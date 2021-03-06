var common = require('../common'),
    test = common.test;

if (process.arch !== 'x64')
  return;

describe('JIT.js x64 Stub', function() {
  test('should support stubs', function() {
    this.stubs.define('sum', function() {
      this.add('rax', 'rbx');
      this.Return();
    });

    this.stubs.define('sub', function() {
      this.sub('rax', 'rbx');
      this.Return();
    });

    this.mov('rax', 20);
    this.mov('rbx', 32);
    this.stub('rcx', 'sum');
    this.mov('rbx', 10);
    this.stub('rcx', 'sub');
    this.Return();
  }, 42);
});
