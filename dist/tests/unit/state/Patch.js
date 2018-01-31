(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../../src/state/Pointer", "./../../../src/state/Patch", "./../../../src/state/operations"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var Pointer_1 = require("./../../../src/state/Pointer");
    var Patch_1 = require("./../../../src/state/Patch");
    var ops = require("./../../../src/state/operations");
    describe('state/Patch', function () {
        describe('add', function () {
            it('value to new path', function () {
                var patch = new Patch_1.Patch(ops.add({ path: 'test', state: null, value: null }, 'test'));
                var obj = {};
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: 'test' });
                assert.deepEqual(result.undoOperations, [
                    { op: 'test', path: new Pointer_1.Pointer('/test'), value: 'test' },
                    { op: 'remove', path: new Pointer_1.Pointer('/test') }
                ]);
            });
            it('value to new nested path', function () {
                var patch = new Patch_1.Patch(ops.add({ path: '/foo/bar/qux', state: null, value: null }, 'test'));
                var obj = {};
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { foo: { bar: { qux: 'test' } } });
                assert.deepEqual(result.undoOperations, [
                    { op: 'test', path: new Pointer_1.Pointer('/foo/bar/qux'), value: 'test' },
                    { op: 'remove', path: new Pointer_1.Pointer('/foo/bar/qux') }
                ]);
            });
            it('value to existing path', function () {
                var patch = new Patch_1.Patch(ops.add({ path: '/test', state: null, value: null }, 'test'));
                var obj = { test: true };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: 'test' });
                assert.deepEqual(result.undoOperations, [
                    { op: 'test', path: new Pointer_1.Pointer('/test'), value: 'test' },
                    { op: 'remove', path: new Pointer_1.Pointer('/test') }
                ]);
            });
            it('value to array index path', function () {
                var patch = new Patch_1.Patch(ops.add({ path: '/test/0', state: null, value: null }, 'test'));
                var obj = { test: [] };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: ['test'] });
                assert.deepEqual(result.undoOperations, [
                    { op: 'test', path: new Pointer_1.Pointer('/test/0'), value: 'test' },
                    { op: 'remove', path: new Pointer_1.Pointer('/test/0') }
                ]);
            });
        });
        describe('replace', function () {
            it('new path', function () {
                var patch = new Patch_1.Patch(ops.replace({ path: '/test', state: null, value: null }, 'test'));
                var obj = {};
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: 'test' });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.TEST, path: new Pointer_1.Pointer('/test'), value: 'test' },
                    { op: Patch_1.OperationType.REPLACE, path: new Pointer_1.Pointer('/test'), value: undefined }
                ]);
            });
            it('value to new nested path', function () {
                var patch = new Patch_1.Patch(ops.replace({ path: '/foo/bar/qux', state: null, value: null }, 'test'));
                var obj = {};
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { foo: { bar: { qux: 'test' } } });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.TEST, path: new Pointer_1.Pointer('/foo/bar/qux'), value: 'test' },
                    { op: Patch_1.OperationType.REPLACE, path: new Pointer_1.Pointer('/foo/bar/qux'), value: undefined }
                ]);
            });
            it('existing path', function () {
                var patch = new Patch_1.Patch(ops.replace({ path: '/test', state: null, value: null }, 'test'));
                var obj = { test: true };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: 'test' });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.TEST, path: new Pointer_1.Pointer('/test'), value: 'test' },
                    { op: Patch_1.OperationType.REPLACE, path: new Pointer_1.Pointer('/test'), value: true }
                ]);
            });
            it('array index path', function () {
                var patch = new Patch_1.Patch(ops.replace({ path: '/test/1', state: null, value: null }, 'test'));
                var obj = { test: ['test', 'foo'] };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: ['test', 'test'] });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.TEST, path: new Pointer_1.Pointer('/test/1'), value: 'test' },
                    { op: Patch_1.OperationType.REPLACE, path: new Pointer_1.Pointer('/test/1'), value: 'foo' }
                ]);
            });
        });
        describe('remove', function () {
            it('new path', function () {
                var patch = new Patch_1.Patch(ops.remove({ path: '/test', state: null, value: null }));
                var obj = { other: true };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { other: true });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/test'), value: undefined }
                ]);
            });
            it('existing path', function () {
                var patch = new Patch_1.Patch(ops.remove({ path: '/test', state: null, value: null }));
                var obj = { test: true };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, {});
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/test'), value: true }
                ]);
            });
            it('array index path', function () {
                var patch = new Patch_1.Patch(ops.remove({ path: '/test/1', state: null, value: null }));
                var obj = { test: ['test', 'foo'] };
                var result = patch.apply(obj);
                assert.notStrictEqual(result.object, obj);
                assert.deepEqual(result.object, { test: ['test'] });
                assert.deepEqual(result.undoOperations, [
                    { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/test/1'), value: 'foo' }
                ]);
            });
        });
        describe('test', function () {
            it('success', function () {
                var patch = new Patch_1.Patch(ops.test({ path: '/test', state: null, value: null }, 'test'));
                var obj = { test: 'test' };
                var result = patch.apply(obj);
                assert.strictEqual(result.object, obj);
            });
            it('failure', function () {
                var patch = new Patch_1.Patch(ops.test({ path: '/test', state: null, value: null }, true));
                var obj = { test: 'test' };
                assert.throws(function () {
                    patch.apply(obj);
                }, Error, 'Test operation failure. Unable to apply any operations.');
            });
            it('nested path', function () {
                var patch = new Patch_1.Patch(ops.test({ path: '/foo/0/bar/baz/0/qux', state: null, value: null }, true));
                var obj = {
                    foo: [
                        {
                            bar: {
                                baz: [
                                    {
                                        qux: true
                                    }
                                ]
                            }
                        }
                    ]
                };
                var result = patch.apply(obj);
                assert.strictEqual(result.object, obj);
            });
            it('complex value', function () {
                var patch = new Patch_1.Patch(ops.test({ path: '/foo', state: null, value: null }, [
                    {
                        bar: {
                            baz: [
                                {
                                    qux: true
                                }
                            ]
                        }
                    }
                ]));
                var obj = {
                    foo: [
                        {
                            bar: {
                                baz: [
                                    {
                                        qux: true
                                    }
                                ]
                            }
                        }
                    ]
                };
                var result = patch.apply(obj);
                assert.strictEqual(result.object, obj);
            });
            it('no value', function () {
                var patch = new Patch_1.Patch(ops.test({ path: '/test', state: null, value: null }, 'test'));
                var obj = { test: 'test' };
                var result = patch.apply(obj);
                assert.strictEqual(result.object, obj);
            });
        });
        it('unknown', function () {
            var patch = new Patch_1.Patch({
                op: 'unknown',
                path: new Pointer_1.Pointer('/test')
            });
            assert.throws(function () {
                patch.apply({});
            }, Error, 'Unknown operation');
        });
    });
});
//# sourceMappingURL=Patch.js.map