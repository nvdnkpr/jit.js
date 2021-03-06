var api = exports;

var assert = require('assert');
var jit = require('../jit');

api.getBackend = function getBackend(arch) {
  if (!arch)
    arch = process.arch;

  if (!jit.backends.hasOwnProperty(arch))
    throw new Error('Arch: ' + arch + ' isn\'t supported yet');

  return jit.backends[arch];
};

api.generate = function generate(fn, options) {
  if (!options)
    options = {};

  var backend = options.backend || api.getBackend(options.arch),
      context = new backend.Masm(options);

  fn.call(context);

  return {
    buffer: context.toBuffer(),
    references: context.getReferences(),
    relocations: context.getRelocations()
  };
};

api.wrap = function wrap(output) {
  var info = new jit.binding.ExecInfo(output.buffer);

  // Copy absolute relocations
  output.relocations.forEach(function(reloc) {
    var offset = info.getAbsoluteOffset(reloc.value);
    assert(reloc.size === offset.length);
    offset.copy(info.buffer, reloc.offset);
  });

  var exec = info.exec.bind(info);
  exec._info = info;
  exec._references = output.references;
  return exec;
};

api.compile = function compile(fn, options) {
  return api.wrap(api.generate(fn, options));
};

api.stubs = function stubs(options) {
  return new jit.Stubs(options);
};

api.ptr = function ptr(buf, offset) {
  return jit.binding.getPointer(buf, offset);
};
