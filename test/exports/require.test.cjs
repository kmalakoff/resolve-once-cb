const assert = require('assert');
const resolveOnce = require('resolve-once-cb');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof resolveOnce, 'function');
  });
});
