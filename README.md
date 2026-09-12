# resolve-once-cb

Run a callback-based operation once and memoize its result, including errors.

```sh
npm install resolve-once-cb
```

## Usage

```js
const resolveOnce = require('resolve-once-cb');

const resolveValue = resolveOnce((cb) => cb(null, { id: 1 }));
resolveValue((err, value1) => {
  if (err) throw err;
  resolveValue((err, value2) => {
    if (err) throw err;
    console.log(value1 === value2); // true
  });
});
```
