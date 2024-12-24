const UNRESOLVED = 0;
const RESOLVING = 1;
const RESOLVED_SUCCESS = 2;
const RESOLVED_ERROR = 3;

export default function resolveOnce(fn) {
  let state = UNRESOLVED;
  let result;
  const waiting = [];

  function resolveResult() {
    if (state === RESOLVING) return;
    state = RESOLVING;

    function callback(err, value) {
      if (state !== RESOLVING) return;
      if (err) {
        state = RESOLVED_ERROR;
        result = err;
        while (waiting.length) waiting.pop()(result);
      } else {
        state = RESOLVED_SUCCESS;
        result = value;
        while (waiting.length) waiting.pop()(null, result);
      }
    }

    try {
      fn(callback);
    } catch (err) {
      callback(err);
    }
  }

  return (callback) => {
    if (typeof callback !== 'function') throw new Error('resolve-once-cb missing callback');
    if (state === RESOLVED_SUCCESS) return callback(null, result);
    if (state === RESOLVED_ERROR) return callback(result);
    waiting.push(callback);
    resolveResult(callback);
  };
}
