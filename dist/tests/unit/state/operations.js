(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../../src/state/operations", "./../../../src/state/Patch", "./../../../src/state/Pointer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var operations = require("./../../../src/state/operations");
    var Patch_1 = require("./../../../src/state/Patch");
    var Pointer_1 = require("./../../../src/state/Pointer");
    describe('state/operations', function () {
        it('add()', function () {
            var result = operations.add({ path: '/test', state: null, value: null }, 'test');
            assert.deepEqual(result, {
                op: Patch_1.OperationType.ADD,
                path: new Pointer_1.Pointer('/test'),
                value: 'test'
            });
        });
        it('remove()', function () {
            var result = operations.remove({ path: '/test', state: null, value: null });
            assert.deepEqual(result, {
                op: Patch_1.OperationType.REMOVE,
                path: new Pointer_1.Pointer('/test')
            });
        });
        it('replace()', function () {
            var result = operations.replace({ path: '/test', state: null, value: null }, 'test');
            assert.deepEqual(result, {
                op: Patch_1.OperationType.REPLACE,
                path: new Pointer_1.Pointer('/test'),
                value: 'test'
            });
        });
        it('test()', function () {
            var result = operations.test({ path: '/test', state: null, value: null }, 'test');
            assert.deepEqual(result, {
                op: Patch_1.OperationType.TEST,
                path: new Pointer_1.Pointer('/test'),
                value: 'test'
            });
        });
    });
});
//# sourceMappingURL=operations.js.map