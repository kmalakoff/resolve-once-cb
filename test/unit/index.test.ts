import assert from 'assert';
import Queue from 'queue-cb';

import resolveOnce, { type Callback, type Resolver } from 'resolve-once-cb';

describe('resolve-once-cb', () => {
  it('handle success', (callback) => {
    let counter = 0;
    const resolver = resolveOnce<number>((cb) => cb(undefined, ++counter)) as Resolver<number>;

    const errors: (Error | null)[] = [];
    const results: number[] = [];
    function collect(cb: (error?: Error | null) => void) {
      resolver((err, value) => {
        err ? errors.push(err) : results.push(value as number);
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

    const errors: (Error | null)[] = [];
    const results: unknown[] = [];
    function collect(cb: (error?: Error | null) => void) {
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
        assert.equal((err as Error).message, 'Failed');
      });
      assert.equal(counter, 1);

      resolver((err) => {
        assert.equal(counter, 1);
        assert.equal((err as Error).message, 'Failed');
        callback();
      });
    });
  });

  describe('errors', () => {
    it('missing callback', (done) => {
      let counter = 0;
      const resolver = resolveOnce<number>((cb) => cb(undefined, ++counter));
      try {
        resolver(undefined as unknown as Callback<number>);
        assert.ok(false, 'should not get here');
      } catch (err: unknown) {
        assert.ok((err as Error).message.indexOf('missing callback') >= 0);
        done();
      }
    });
  });
});
