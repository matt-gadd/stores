(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../src/Store", "./../../src/state/Patch", "./../../src/state/Pointer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), beforeEach = _a.beforeEach, describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var Store_1 = require("./../../src/Store");
    var Patch_1 = require("./../../src/state/Patch");
    var Pointer_1 = require("./../../src/state/Pointer");
    var store = new Store_1.Store();
    var testPatchOperations = [{ op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/test'), value: 'test' }];
    describe('store', function () {
        beforeEach(function () {
            store = new Store_1.Store();
        });
        it('create store', function () {
            assert.isOk(store);
        });
        it('apply/get', function () {
            var undo = store.apply(testPatchOperations);
            assert.strictEqual(store.get(store.path('test')), 'test');
            assert.deepEqual(undo, [
                { op: Patch_1.OperationType.TEST, path: new Pointer_1.Pointer('/test'), value: 'test' },
                { op: Patch_1.OperationType.REMOVE, path: new Pointer_1.Pointer('/test') }
            ]);
        });
        it('should allow paths to be registered to an onChange', function () {
            var first = 0;
            var second = 0;
            var onChange = store.onChange, path = store.path, apply = store.apply;
            onChange(path('foo', 'bar'), function () { return (first += 1); });
            onChange([path('foo', 'bar'), path('baz')], function () { return (second += 1); });
            apply([
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/foo/bar'), value: 'test' },
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/baz'), value: 'hello' }
            ], true);
            assert.strictEqual(first, 1);
            assert.strictEqual(second, 1);
            apply([
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/foo/bar'), value: 'test' },
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/baz'), value: 'world' }
            ], true);
            assert.strictEqual(first, 1);
            assert.strictEqual(second, 2);
        });
        it('can remove a registered onChange', function () {
            var first = 0;
            var second = 0;
            var onChange = store.onChange, path = store.path, apply = store.apply;
            var remove = onChange(path('foo', 'bar'), function () { return (first += 1); }).remove;
            onChange([path('foo', 'bar'), path('baz')], function () { return (second += 1); });
            apply([
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/foo/bar'), value: 'test' },
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/baz'), value: 'hello' }
            ], true);
            assert.strictEqual(first, 1);
            assert.strictEqual(second, 1);
            remove();
            apply([
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/foo/bar'), value: 'test2' },
                { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/baz'), value: 'hello2' }
            ], true);
            assert.strictEqual(first, 1);
            assert.strictEqual(second, 2);
        });
        it('invalidate', function () {
            var invalidateEmitted = false;
            store.on('invalidate', function () {
                invalidateEmitted = true;
            });
            store.invalidate();
            assert.isTrue(invalidateEmitted);
        });
        describe('paths', function () {
            var store;
            beforeEach(function () {
                store = new Store_1.Store();
                store.apply([
                    { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/foo'), value: { bar: 'bar' } },
                    { op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer('/baz'), value: [5] }
                ]);
            });
            it('should return the correct type based on the path provided', function () {
                var bar = store.get(store.path('foo', 'bar'));
                assert.strictEqual(bar.trim(), 'bar');
            });
            it('should be able to combine partial paths', function () {
                var bar = store.get(store.path(store.path('foo'), 'bar'));
                assert.strictEqual(bar.trim(), 'bar');
            });
            it('should be able to return a path for an index in an array', function () {
                var five = store.get(store.at(store.path('baz'), 0));
                assert.strictEqual(five, 5);
            });
            it('should not return the root', function () {
                assert.throws(function () {
                    store.get(store.path(''));
                }, Error, 'Access to the root is not supported.');
            });
        });
    });
});
//# sourceMappingURL=Store.js.map