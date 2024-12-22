const assert = require('assert');
const Queue = require('queue-cb');

const resolveOnce = require('resolve-once-cb');

describe('resolve-once-cb', () => {
  it('handle success', (callback) => {
    let counter = 0;
    const resolver = resolveOnce((cb) => cb(null, ++counter));

    const errors = [];
    const results = [];
    function collect(cb) {
      resolver((err, value) => {
        err ? errors.push(err) : results.push(value);
        cb();
      });
    }

    const queue = new Queue();
    queue.defer(collect);
    queue.defer(collect);
    queue.defer(collect);
    queue.await((err) => {
      assert.ok(!err);
      assert.ok(errors.length === 0);
      assert.equal(results.length, 3);
      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver((err, result) => {
        assert.ok(!err);
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle failure', (callback) => {
    let counter = 0;
    const resolver = resolveOnce((cb) => {
      ++counter;
      cb(new Error('Failed'));
    });

    const errors = [];
    const results = [];
    function collect(cb) {
      resolver((err, value) => {
        err ? errors.push(err) : results.push(value);
        cb();
      });
    }

    const queue = new Queue();
    queue.defer(collect);
    queue.defer(collect);
    queue.defer(collect);
    queue.await((err) => {
      assert.ok(!err);
      assert.ok(errors.length === 3);
      assert.equal(results.length, 0);
      errors.forEach((err) => {
        assert.equal(err.message, 'Failed');
      });
      assert.equal(counter, 1);

      resolver((err) => {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });
});
