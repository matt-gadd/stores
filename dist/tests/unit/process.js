(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./../../src/state/Pointer", "./../../src/state/Patch", "./../../src/process", "./../../src/Store"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = intern.getInterface('bdd'), beforeEach = _a.beforeEach, describe = _a.describe, it = _a.it;
    var assert = intern.getPlugin('chai').assert;
    var Pointer_1 = require("./../../src/state/Pointer");
    var Patch_1 = require("./../../src/state/Patch");
    var process_1 = require("./../../src/process");
    var Store_1 = require("./../../src/Store");
    var store;
    var promises = [];
    var promiseResolvers = [];
    function promiseResolver() {
        for (var i = 0; i < promiseResolvers.length; i++) {
            promiseResolvers[i]();
        }
    }
    var testCommandFactory = function (path) {
        return function (_a) {
            var payload = _a.payload;
            var value = Object.keys(payload).length === 0 ? path : payload;
            return [{ op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer("/" + path), value: value }];
        };
    };
    var testAsyncCommandFactory = function (path) {
        return function (_a) {
            var payload = _a.payload;
            var promise = new Promise(function (resolve) {
                promiseResolvers.push(function () {
                    var value = Object.keys(payload).length === 0 ? path : payload;
                    resolve([{ op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer("/" + path), value: value }]);
                });
            });
            promises.push(promise);
            return promise;
        };
    };
    var testErrorCommand = function (_a) {
        var payload = _a.payload;
        new Error('Command Failed');
    };
    describe('process', function () {
        beforeEach(function () {
            store = new Store_1.Store();
            promises = [];
            promiseResolvers = [];
        });
        it('with synchronous commands running in order', function () {
            var process = process_1.createProcess('test', [testCommandFactory('foo'), testCommandFactory('foo/bar')]);
            var processExecutor = process(store);
            processExecutor({});
            var foo = store.get(store.path('foo'));
            var foobar = store.get(store.path('foo', 'bar'));
            assert.deepEqual(foo, { bar: 'foo/bar' });
            assert.strictEqual(foobar, 'foo/bar');
        });
        it('processes wait for asynchronous commands to complete before continuing', function () {
            var process = process_1.createProcess('test', [
                testCommandFactory('foo'),
                testAsyncCommandFactory('bar'),
                testCommandFactory('foo/bar')
            ]);
            var processExecutor = process(store);
            var promise = processExecutor({});
            var foo = store.get(store.path('foo'));
            var bar = store.get(store.path('bar'));
            assert.strictEqual(foo, 'foo');
            assert.isUndefined(bar);
            promiseResolver();
            return promise.then(function () {
                var foo = store.get(store.path('foo'));
                var bar = store.get(store.path('bar'));
                var foobar = store.get(store.path('foo', 'bar'));
                assert.deepEqual(foo, { bar: 'foo/bar' });
                assert.strictEqual(bar, 'bar');
                assert.strictEqual(foobar, 'foo/bar');
            });
        });
        it('support concurrent commands executed synchronously', function () {
            var process = process_1.createProcess('test', [
                testCommandFactory('foo'),
                [testAsyncCommandFactory('bar'), testAsyncCommandFactory('baz')],
                testCommandFactory('foo/bar')
            ]);
            var processExecutor = process(store);
            var promise = processExecutor({});
            promiseResolvers[0]();
            return promises[0].then(function () {
                var bar = store.get(store.path('bar'));
                var baz = store.get(store.path('baz'));
                assert.isUndefined(bar);
                assert.isUndefined(baz);
                promiseResolver();
                return promise.then(function () {
                    var bar = store.get(store.path('bar'));
                    var baz = store.get(store.path('baz'));
                    assert.strictEqual(bar, 'bar');
                    assert.strictEqual(baz, 'baz');
                });
            });
        });
        it('passes the payload to each command', function () {
            var process = process_1.createProcess('test', [
                testCommandFactory('foo'),
                testCommandFactory('bar'),
                testCommandFactory('baz')
            ]);
            var processExecutor = process(store);
            processExecutor({ payload: 'payload' });
            var foo = store.get(store.path('foo'));
            var bar = store.get(store.path('bar'));
            var baz = store.get(store.path('baz'));
            assert.deepEqual(foo, { payload: 'payload' });
            assert.deepEqual(bar, { payload: 'payload' });
            assert.deepEqual(baz, { payload: 'payload' });
        });
        it('can use a transformer for the arguments passed to the process executor', function () {
            var process = process_1.createProcess('test', [
                testCommandFactory('foo'),
                testCommandFactory('bar'),
                testCommandFactory('baz')
            ]);
            var processExecutorOne = process(store, function (payload) {
                return { foo: 'changed' };
            });
            var processExecutorTwo = process(store);
            processExecutorTwo({ foo: '' });
            processExecutorOne({ foo: 1 });
            // processExecutorOne({ foo: '' }); // doesn't compile
            var foo = store.get(store.path('foo'));
            var bar = store.get(store.path('bar'));
            var baz = store.get(store.path('baz'));
            assert.deepEqual(foo, { foo: 'changed' });
            assert.deepEqual(bar, { foo: 'changed' });
            assert.deepEqual(baz, { foo: 'changed' });
        });
        it('provides a command factory', function () {
            var createCommand = process_1.createCommandFactory();
            var command = createCommand(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                // get(path('bar')); // shouldn't compile
                payload.foo;
                // payload.bar; // shouldn't compile
                get(path('foo'));
                return [];
            });
            assert.equal(typeof command, 'function');
        });
        it('can type payload that extends an object', function () {
            var createCommandOne = process_1.createCommandFactory();
            var createCommandTwo = process_1.createCommandFactory();
            var createCommandThree = process_1.createCommandFactory();
            var commandOne = createCommandOne(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                return [];
            });
            var commandTwo = createCommandTwo(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                return [];
            });
            var commandThree = createCommandThree(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                return [];
            });
            var processOne = process_1.createProcess('test', [commandOne, commandTwo]);
            // createProcess('test', [commandOne, commandTwo]); // shouldn't compile
            // createProcess<any, { bar: string }>([commandOne]); // shouldn't compile
            var processTwo = process_1.createProcess('test', [commandTwo]);
            var processThree = process_1.createProcess('test', [commandThree]);
            var executorOne = processOne(store);
            var executorTwo = processTwo(store);
            var executorThree = processThree(store);
            // executorOne({}); // shouldn't compile
            // executorOne({ foo: 1 }); // shouldn't compile
            executorOne({ foo: 'bar', bar: 'string' });
            executorTwo({ bar: 'bar' });
            // executorTwo({}); // shouldn't compile;
            // executorTwo(1); // shouldn't compile
            // executorTwo(''); // shouldn't compile
            // executorThree(); // shouldn't compile
            executorThree({});
        });
        it('if a transformer is provided it determines the payload type', function () {
            var createCommandOne = process_1.createCommandFactory();
            var createCommandTwo = process_1.createCommandFactory();
            var commandOne = createCommandOne(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                return [];
            });
            var commandTwo = createCommandTwo(function (_a) {
                var get = _a.get, path = _a.path, payload = _a.payload;
                return [];
            });
            var transformerOne = function (payload) {
                return {
                    bar: 1
                };
            };
            var transformerTwo = function (payload) {
                return {
                    bar: 1,
                    foo: 2
                };
            };
            var processOne = process_1.createProcess('test', [commandOne]);
            var processTwo = process_1.createProcess('test', [commandOne, commandTwo]);
            var processOneResult = processOne(store, transformerOne)({ foo: '' });
            // processTwo(store, transformerOne); // compile error
            var processTwoResult = processTwo(store, transformerTwo)({ foo: 3 });
            // processTwo(store)({ foo: 3 }); // compile error
            processOneResult.then(function (result) {
                result.payload.bar.toPrecision();
                result.executor(processTwo, { foo: 3, bar: 1 });
                // result.executor(processTwo, { foo: 3, bar: '' }); // compile error
                result.executor(processTwo, { foo: 1 }, transformerTwo);
                // result.executor(processTwo, { foo: '' }, transformerTwo); // compile error
                // result.payload.bar.toUpperCase(); // compile error
                // result.payload.foo; // compile error
            });
            processTwoResult.then(function (result) {
                result.payload.bar.toPrecision();
                result.payload.foo.toPrecision();
                // result.payload.bar.toUpperCase(); // compile error
                // result.payload.foo.toUpperCase(); // compile error
            });
        });
        it('can provide a callback that gets called on process completion', function () {
            var callbackCalled = false;
            var process = process_1.createProcess('test', [testCommandFactory('foo')], function () {
                callbackCalled = true;
            });
            var processExecutor = process(store);
            processExecutor({});
            assert.isTrue(callbackCalled);
        });
        it('when a command errors, the error and command is returned in the error argument of the callback', function () {
            var process = process_1.createProcess('test', [testCommandFactory('foo'), testErrorCommand], function (error) {
                assert.isNotNull(error);
                assert.strictEqual(error && error.command, testErrorCommand);
            });
            var processExecutor = process(store);
            processExecutor({});
        });
        it('executor can be used to programmatically run additional processes', function () {
            var extraProcess = process_1.createProcess('test', [testCommandFactory('bar')]);
            var process = process_1.createProcess('test', [testCommandFactory('foo')], function (error, result) {
                assert.isNull(error);
                var bar = store.get(store.path('bar'));
                assert.isUndefined(bar);
                result.executor(extraProcess, {});
                bar = store.get(store.path('bar'));
                assert.strictEqual(bar, 'bar');
            });
            var processExecutor = process(store);
            processExecutor({});
        });
        it('Creating a process returned automatically decorates all process callbacks', function () {
            var results = [];
            var callbackDecorator = function (callback) {
                return function (error, result) {
                    results.push('callback one');
                    callback && callback(error, result);
                };
            };
            var callbackTwo = function (error, result) {
                results.push('callback two');
                result.payload;
            };
            var logPointerCallback = function (error, result) {
                var paths = result.operations.map(function (operation) { return operation.path.path; });
                var logs = result.get(store.path('logs')) || [];
                result.apply([{ op: Patch_1.OperationType.ADD, path: new Pointer_1.Pointer("/logs/" + logs.length), value: paths }]);
            };
            var createProcess = process_1.createProcessFactoryWith([
                callbackDecorator,
                process_1.createCallbackDecorator(callbackTwo),
                process_1.createCallbackDecorator(logPointerCallback)
            ]);
            var process = createProcess('test', [testCommandFactory('foo'), testCommandFactory('bar')]);
            var executor = process(store);
            executor({});
            assert.lengthOf(results, 2);
            assert.strictEqual(results[0], 'callback two');
            assert.strictEqual(results[1], 'callback one');
            assert.deepEqual(store.get(store.path('logs')), [['/foo', '/bar']]);
            executor({});
            assert.lengthOf(results, 4);
            assert.strictEqual(results[0], 'callback two');
            assert.strictEqual(results[1], 'callback one');
            assert.strictEqual(results[2], 'callback two');
            assert.strictEqual(results[3], 'callback one');
            assert.deepEqual(store.get(store.path('logs')), [['/foo', '/bar'], ['/foo', '/bar']]);
        });
    });
});
//# sourceMappingURL=process.js.map