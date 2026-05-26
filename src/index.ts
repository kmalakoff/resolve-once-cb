const UNRESOLVED = 0;
const RESOLVING = 1;
const RESOLVED_SUCCESS = 2;
const RESOLVED_ERROR = 3;

export type Callback<T> = (error?: Error | null, result?: T) => void;
export type Resolver<T> = (callback: Callback<T>) => void;

export default function resolveOnce<T>(fn: Resolver<T>): Resolver<T> {
  let state = UNRESOLVED;
  let result: T | Error;
  const waiting: Callback<T>[] = [];

  function resolveResult() {
    if (state === RESOLVING) return;
    state = RESOLVING;

    function callback(error?: Error | null, value?: T): void {
      if (state !== RESOLVING) return;
      if (error) {
        state = RESOLVED_ERROR;
        result = error;
        while (waiting.length) waiting.pop()?.(result as Error);
      } else {
        state = RESOLVED_SUCCESS;
        result = value as T;
        while (waiting.length) waiting.pop()?.(undefined, result as T);
      }
    }

    try {
      fn(callback);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }

  return (callback: Callback<T>): void => {
    if (typeof callback !== 'function') throw new Error('resolve-once-cb missing callback');
    if (state === RESOLVED_SUCCESS) return callback(undefined, result as T);
    if (state === RESOLVED_ERROR) return callback(result as Error);
    waiting.push(callback);
    resolveResult();
  };
}
