(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../../src/state/Pointer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var Pointer_1 = require("./../../../src/state/Pointer");
    describe('state/Pointer', function () {
        it('create pointer with string path', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar');
            assert.strictEqual(pointer.path, '/foo/bar');
            assert.deepEqual(pointer.segments, ['foo', 'bar']);
        });
        it('create pointer with array path', function () {
            var pointer = new Pointer_1.Pointer(['foo', 'bar']);
            assert.strictEqual(pointer.path, '/foo/bar');
            assert.deepEqual(pointer.segments, ['foo', 'bar']);
        });
        it('create with special characters', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar~0~1');
            assert.strictEqual(pointer.path, '/foo/bar~0~1');
            assert.deepEqual(pointer.segments, ['foo', 'bar~/']);
        });
        it('create pointer for root should error', function () {
            assert.throws(function () {
                new Pointer_1.Pointer('');
            }, Error, 'Access to the root is not supported.');
            assert.throws(function () {
                new Pointer_1.Pointer(['']);
            }, Error, 'Access to the root is not supported.');
            assert.throws(function () {
                new Pointer_1.Pointer('/');
            }, Error, 'Access to the root is not supported.');
            assert.throws(function () {
                new Pointer_1.Pointer(['/']);
            }, Error, 'Access to the root is not supported.');
        });
        it('get', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar/3');
            var obj = { foo: { bar: [1, 2, 3, 4, 5, 6, 7] } };
            assert.strictEqual(pointer.get(obj), 4);
        });
        it('get last item in array', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar/-');
            var obj = { foo: { bar: [1, 2, 3, 4, 5, 6, 7] } };
            assert.strictEqual(pointer.get(obj), 7);
        });
        it('get deep path that does not exist', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar/qux');
            var obj = {};
            assert.strictEqual(pointer.get(obj), undefined);
        });
        it('walk deep path that does not exist with clone', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar/qux');
            var target = Pointer_1.walk(pointer.segments, {}, true);
            assert.deepEqual(target.object, { foo: { bar: {} } });
            assert.deepEqual(target.target, {});
            assert.deepEqual(target.segment, 'qux');
        });
        it('walk deep path that does not exist not clone', function () {
            var pointer = new Pointer_1.Pointer('/foo/bar/qux');
            var target = Pointer_1.walk(pointer.segments, {}, false);
            assert.deepEqual(target.object, { foo: { bar: {} } });
            assert.deepEqual(target.target, {});
            assert.deepEqual(target.segment, 'qux');
        });
        it('should handle a path with no leading slash', function () {
            var pointer = new Pointer_1.Pointer('foo/bar/qux');
            var target = Pointer_1.walk(pointer.segments, {}, false);
            assert.deepEqual(target.object, { foo: { bar: {} } });
            assert.deepEqual(target.target, {});
            assert.deepEqual(target.segment, 'qux');
        });
    });
});
//# sourceMappingURL=Pointer.js.map