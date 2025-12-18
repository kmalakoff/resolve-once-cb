const UNRESOLVED = 0;
const RESOLVING = 1;
const RESOLVED_SUCCESS = 2;
const RESOLVED_ERROR = 3;

export type Callback<T> = (error?: Error, result?: T) => void;
export type Resolver<T> = (callback: Callback<T>) => void;

export default function resolveOnce<T>(fn: Resolver<T>): Resolver<T> {
  let state = UNRESOLVED;
  let result: T | Error;
  const waiting = [];

  function resolveResult() {
    if (state === RESOLVING) return;
    state = RESOLVING;

    function callback(error?: Error, value?: T): void {
      if (state !== RESOLVING) return;
      if (error) {
        state = RESOLVED_ERROR;
        result = error;
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

  return (callback: Callback<T>): void => {
    if (typeof callback !== 'function') throw new Error('resolve-once-cb missing callback');
    if (state === RESOLVED_SUCCESS) return callback(null, result as T);
    if (state === RESOLVED_ERROR) return callback(result as Error);
    waiting.push(callback);
    resolveResult();
  };
}
