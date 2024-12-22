const assert = require('assert');
const _Queue = require('queue-cb');
const _asap = require('asap');

const resolveOnce = require('resolve-once-cb');

describe('resolve-once-cb', () => {
  it('handle success', (callback) => {
    let counter = 0;
    const resolver = resolveOnce((cb) => cb(null, (++counter));

    Promise.all([resolver(), resolver(), resolver()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().then((result) => {
        assert.equal(result, 1);
        assert.equal(counter, 1);
        callback();
      });
    });
  });

  it('handle failure', (callback) => {
    let counter = 0;
    const resolver = resolveOnce(() =>
      Promise.resolve().then(() => {
        ++counter;
        return Promise.reject(new Error('Failed'));
      })
    );

    function wrapError() {
      return new Promise((resolve, _reject) => {
        resolver().catch((err) => {
          assert.equal(counter, 1);
          assert.equal(err.message, 'Failed');
          resolve(counter);
        });
      });
    }

    Promise.all([wrapError(), wrapError(), wrapError()]).then((results) => {
      assert.equal(results.length, 3);

      results.forEach((result) => {
        assert.equal(result, 1);
      });
      assert.equal(counter, 1);

      resolver().catch((err) => {
        assert.equal(counter, 1);
        assert.equal(err.message, 'Failed');
        callback();
      });
    });
  });
});
