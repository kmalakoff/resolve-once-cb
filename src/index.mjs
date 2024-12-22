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

    fn((err, value) => {
      if (err) {
        state = RESOLVED_ERROR;
        result = err;
        while (waiting.length) waiting.pop()(result);
      } else {
        state = RESOLVED_SUCCESS;
        result = value;
        while (waiting.length) waiting.pop()(null, result);
      }
    });
  }

  return (callback) => {
    if (state === RESOLVED_SUCCESS) return Promise.resolve(result);
    if (state === RESOLVED_ERROR) return Promise.reject(result);

    resolveResult(callback);
    return function collect(callback) {
      waiting.push(callback);
    };
  };
}
