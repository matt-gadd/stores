(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./process", "../src/state/Pointer", "@dojo/shim/WeakMap"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var process_1 = require("./process");
    var Pointer_1 = require("../src/state/Pointer");
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    function createHistoryManager() {
        var storeMap = new WeakMap_1.default();
        return {
            collector: function (callback) {
                return function (error, result) {
                    var operations = result.operations, undoOperations = result.undoOperations, processId = result.processId, store = result.store;
                    var _a = storeMap.get(store) || {
                        history: [],
                        undo: []
                    }, history = _a.history, undo = _a.undo;
                    history.push({ processId: processId, operations: operations });
                    undo.push(undoOperations);
                    storeMap.set(store, { history: history, undo: undo });
                    callback && callback(error, result);
                };
            },
            canUndo: function (store) {
                var stacks = storeMap.get(store);
                if (stacks) {
                    var history_1 = stacks.history, undo = stacks.undo;
                    if (undo.length && history_1.length) {
                        return true;
                    }
                }
                return false;
            },
            undo: function (store) {
                var stacks = storeMap.get(store);
                if (stacks) {
                    var history_2 = stacks.history, undo = stacks.undo;
                    if (undo.length && history_2.length) {
                        history_2.pop();
                        store.apply(undo.pop());
                        storeMap.set(store, { history: history_2, undo: undo });
                    }
                }
            },
            deserialize: function (store, history) {
                history.forEach(function (_a) {
                    var processId = _a.processId, operations = _a.operations;
                    operations = operations.map(function (operation) {
                        operation.path = new Pointer_1.Pointer(operation.path);
                        return operation;
                    });
                    var callback;
                    if (processId) {
                        var process = process_1.getProcess(processId);
                        if (process) {
                            callback = process[2];
                        }
                    }
                    process_1.processExecutor(processId, [function () { return operations; }], store, callback, undefined)({});
                });
            },
            serialize: function (store) {
                var stacks = storeMap.get(store);
                if (stacks) {
                    var history_3 = stacks.history;
                    return history_3;
                }
                return [];
            }
        };
    }
    exports.createHistoryManager = createHistoryManager;
});
//# sourceMappingURL=extras.js.map