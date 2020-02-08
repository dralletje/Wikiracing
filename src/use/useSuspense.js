export let useSuspense = (keyMapFn, executeFn) => {
  let cache = new Map();
  return (...args) => {
    let key = keyMapFn(...args);
    if (!cache.has(key)) {
      cache.set(key, {
        $promise: (async () => {
          try {
            let result = await executeFn(...args);
            cache.set(key, { $fullfilled: result });
          } catch (error) {
            cache.set(key, { $rejected: error });
          }
        })()
      });
    }
    let connection = cache.get(key);

    if (connection.$promise) {
      throw connection.$promise;
    }
    if (connection.$fullfilled) {
      return connection.$fullfilled;
    }
    if (connection.$rejected) {
      throw connection.$rejected;
    }
  };
};
