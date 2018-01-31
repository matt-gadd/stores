(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../src/state/Patch", "./../../src/process", "./../../src/state/Pointer", "./../../src/extras", "./../../src/Store"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var Patch_1 = require("./../../src/state/Patch");
    var process_1 = require("./../../src/process");
    var Pointer_1 = require("./../../src/state/Pointer");
    var extras_1 = require("./../../src/extras");
    var Store_1 = require("./../../src/Store");
    function incrementCounter(_a) {
        var get = _a.get, path = _a.path;
        var counter = get(path('counter')) || 0;
        return [{ op: Patch_1.OperationType.REPLACE, path: new Pointer_1.Pointer('/counter'), value: ++counter }];
    }
    describe('extras', function () {
        it('can serialize and deserialize history', function () {
            var historyManager = extras_1.createHistoryManager();
            var store = new Store_1.Store();
            var incrementCounterProcess = process_1.createProcess('increment', [incrementCounter], historyManager.collector());
            var executor = incrementCounterProcess(store);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 1);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 2);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 3);
            // serialize the history
            var json = JSON.stringify(historyManager.serialize(store));
            // create a new store
            var storeCopy = new Store_1.Store();
            // deserialize the new store with the history
            historyManager.deserialize(storeCopy, JSON.parse(json));
            // should be re-hydrated
            assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 3);
            // storeCopy history is identical to original store history
            assert.deepEqual(historyManager.serialize(store), historyManager.serialize(storeCopy));
            // can undo on new storeCopy
            historyManager.undo(storeCopy);
            assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 2);
            historyManager.undo(storeCopy);
            assert.strictEqual(storeCopy.get(storeCopy.path('counter')), 1);
            // history should now be 1 item
            assert.strictEqual(historyManager.serialize(storeCopy).length, 1);
            // undo on original store
            historyManager.undo(store);
            assert.strictEqual(store.get(store.path('counter')), 2);
            historyManager.undo(store);
            assert.strictEqual(storeCopy.get(store.path('counter')), 1);
            // histories should now be identical
            assert.deepEqual(historyManager.serialize(store), historyManager.serialize(storeCopy));
        });
        it('can undo', function () {
            var historyManager = extras_1.createHistoryManager();
            var store = new Store_1.Store();
            var incrementCounterProcess = process_1.createProcess('increment', [incrementCounter], historyManager.collector());
            var executor = incrementCounterProcess(store);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 1);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 2);
            executor({});
            assert.strictEqual(store.get(store.path('counter')), 3);
            historyManager.undo(store);
            assert.strictEqual(store.get(store.path('counter')), 2);
        });
        it('undo has no effect if there are no undo functions on the stack', function () {
            var historyManager = extras_1.createHistoryManager();
            var store = new Store_1.Store();
            var incrementCounterProcess = process_1.createProcess('increment', [incrementCounter]);
            var executor = incrementCounterProcess(store);
            executor({});
            historyManager.undo(store);
            assert.strictEqual(store.get(store.path('counter')), 1);
        });
    });
});
//# sourceMappingURL=extras.js.map