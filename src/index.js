import { printBuffer } from './core';
import { timer } from './helpers';
import defaults from './defaults';

/**
 * Creates logger with following options
 *
 * @namespace
 * @param {object} stores - stores to look for
 * @param {object} options - options for logger
 * @param {string | function | object} options.level - console[level]
 * @param {boolean} options.duration - print duration of each action?
 * @param {boolean} options.timestamp - print timestamp with each action?
 * @param {object} options.colors - custom colors
 * @param {object} options.logger - implementation of the `console` API
 * @param {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @param {boolean} options.collapsed - is group collapsed?
 * @param {boolean} options.predicate - condition which resolves logger behavior
 * @param {function} options.stateTransformer - transform state before print
 * @param {function} options.actionTransformer - transform action before print
 * @param {function} options.errorTransformer - transform error before print
 *
 * @returns {function} logger middleware
 */
function createLogger(stores, options = {}) {
  const loggerOptions = {
    ...defaults,
    ...options,
  };

  const {
    logger,
    transformer, stateTransformer, errorTransformer,
    logErrors,
  } = loggerOptions;

  // Return if 'console' object is not defined
  if (typeof logger === `undefined`) {
    return () => next => action => next(action);
  }

  if (transformer) {
    console.error(`Option 'transformer' is deprecated, use 'stateTransformer' instead!`); // eslint-disable-line no-console
  }

  const logBuffer = [];

  return (actionContext) => (next) => (type, payload) => {
    const logEntry = {};
    logBuffer.push(logEntry);

    logEntry.started = timer.now();
    logEntry.startedTime = new Date();
    logEntry.prevState = stateTransformer(stores, type, actionContext);
    logEntry.action = { type, payload };

    let returnedValue;
    if (logErrors) {
      try {
        returnedValue = next(type, payload);
      } catch (e) {
        logEntry.error = errorTransformer(e);
      }
    } else {
      returnedValue = next(type, payload);
    }

    logEntry.took = timer.now() - logEntry.started;
    logEntry.nextState = stateTransformer(stores, type, actionContext);

    const diff = loggerOptions.diff;

    printBuffer(logBuffer, { ...loggerOptions, diff });
    logBuffer.length = 0;

    if (logEntry.error) throw logEntry.error;
    return returnedValue;
  };
}

export default createLogger;
