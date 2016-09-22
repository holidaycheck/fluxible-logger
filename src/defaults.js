function getStoreNamesByActionType(stores, type) {
  return stores
    .map((store) => ({ types: Object.keys(store.handlers), name: store.storeName }))
    .filter((store) => store.types.filter((ty) => ty === type).length > 0)
    .map((store) => store.name)
    .filter((value, index, el) => el.indexOf(value) === index);
}

function getStates(storeNames = [], actionContext) {
  return storeNames.reduce((acc, name) => ({
    ...acc,
    [name]: actionContext.getStore(name).state,
  }), {});
}

export default {
  level: `log`,
  logger: console,
  logErrors: true,
  collapsed: true,
  predicate: undefined,
  duration: true,
  timestamp: true,
  stateTransformer: (stores, type, actionContext) => getStates(getStoreNamesByActionType(stores, type), actionContext),
  actionTransformer: action => action,
  errorTransformer: error => error,
  colors: {
    title: () => `#000000`,
    prevState: () => `#9E9E9E`,
    action: () => `#03A9F4`,
    nextState: () => `#4CAF50`,
    error: () => `#F20404`,
  },
  diff: false,
  diffPredicate: undefined,

  // Deprecated options
  transformer: undefined,
};
