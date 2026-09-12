import assert from 'assert';
import resolveOnce from 'resolve-once-cb';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof resolveOnce, 'function');
  });
});
