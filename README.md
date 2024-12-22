## resolve-once-cb

Resolves a promise only once and memoizes the result.

## Usage

```
const { callbackify } = require('util');
const resolveOnce = require('resolve-once-cb');
const { MongoClient } = require('mongodb');

const connection = resolveOnce((cb) => callbackify(MongoClient.connect)('mongodb://localhost:27017/database', cb) );
connection((err, db1) => { })
connection((err, db2) => { })
// db1 === db2
```
