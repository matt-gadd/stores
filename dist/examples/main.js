(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/widget-core/mixins/Projector", "@dojo/widget-core/WidgetBase", "@dojo/widget-core/d", "./../src/Store", "./../src/state/operations", "./../src/process", "./../src/extras"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Projector_1 = require("@dojo/widget-core/mixins/Projector");
    var WidgetBase_1 = require("@dojo/widget-core/WidgetBase");
    var d_1 = require("@dojo/widget-core/d");
    var Store_1 = require("./../src/Store");
    var operations_1 = require("./../src/state/operations");
    var process_1 = require("./../src/process");
    var extras_1 = require("./../src/extras");
    var createCommand = process_1.createCommandFactory();
    var incrementCounter = createCommand(function (_a) {
        var get = _a.get, path = _a.path;
        var counter = get(path('counter')) || 0;
        return [operations_1.replace(path('counter'), ++counter)];
    });
    var incrementAnotherCounter = createCommand(function (_a) {
        var get = _a.get, path = _a.path;
        var anotherCounter = get(path('anotherCounter')) || 0;
        return [operations_1.replace(path('anotherCounter'), anotherCounter + 10)];
    });
    var historyManager = extras_1.createHistoryManager();
    var incrementProcess = process_1.createProcess('increment', [incrementCounter, incrementAnotherCounter], historyManager.collector());
    var initialProcess = process_1.createProcess('initial', [incrementCounter, incrementAnotherCounter]);
    var Example = /** @class */ (function (_super) {
        tslib_1.__extends(Example, _super);
        function Example() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._textArea = '';
            _this._stores = [];
            return _this;
        }
        Example.prototype._createStore = function () {
            var store = new Store_1.Store();
            initialProcess(store)({});
            try {
                historyManager.deserialize(store, JSON.parse(this._textArea));
            }
            catch (e) { }
            this._stores.push(store);
            this.invalidate();
        };
        Example.prototype._increment = function (store) {
            incrementProcess(store)({});
            this.invalidate();
        };
        Example.prototype._undo = function (store) {
            historyManager.undo(store);
            this.invalidate();
        };
        Example.prototype._renderStore = function (store, key) {
            var _this = this;
            var path = store.path, get = store.get;
            return d_1.v('div', { key: key, classes: ['container'] }, [
                d_1.v('div', {
                    classes: ['mdl-card', 'mdl-shadow--2dp']
                }, [
                    d_1.v('div', {
                        classes: [
                            'mdl-color--accent mdl-color-text--accent-contrast mdl-card__title mdl-card--expand'
                        ]
                    }, [
                        d_1.v('h2', { classes: ['mdl-card__title-text'] }, [
                            d_1.v('div', [
                                d_1.v('div', ["counter: " + get(path('counter'))]),
                                d_1.v('div', ["anotherCounter: " + get(path('anotherCounter'))])
                            ])
                        ])
                    ]),
                    d_1.v('div', { classes: ['mdl-card__supporting-text'] }, [
                        d_1.v('div', {
                            classes: ['mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-labe']
                        }, [
                            d_1.v('textarea', { readonly: 'readonly', rows: '10', classes: ['mdl-textfield__input'] }, [
                                JSON.stringify(historyManager.serialize(store), null, '\t')
                            ])
                        ])
                    ]),
                    d_1.v('div', { classes: ['mdl-card__actions', 'mdl-card--border'] }, [
                        d_1.v('button', {
                            key: 'increment',
                            classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
                            onclick: function () { return _this._increment(store); }
                        }, ['increment']),
                        d_1.v('button', {
                            key: 'undo',
                            classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
                            disabled: !historyManager.canUndo(store),
                            onclick: function () { return _this._undo(store); }
                        }, ['undo'])
                    ])
                ])
            ]);
        };
        Example.prototype._renderStores = function () {
            var _this = this;
            return this._stores.map(function (store, i) { return _this._renderStore(store, i); });
        };
        Example.prototype.render = function () {
            var _this = this;
            return d_1.v('div', {}, [
                d_1.v('h3', ['History Management']),
                d_1.v('div', tslib_1.__spread([
                    d_1.v('div', { classes: ['container'] }, [
                        d_1.v('div', {
                            classes: ['mdl-card', 'mdl-shadow--2dp']
                        }, [
                            d_1.v('div', {
                                classes: [
                                    'mdl-color--primary mdl-color-text--primary-contrast mdl-card__title mdl-card--expand'
                                ]
                            }, [d_1.v('h2', { classes: ['mdl-card__title-text'] }, ['create store'])]),
                            d_1.v('div', { classes: ['mdl-card__supporting-text'] }, [
                                d_1.v('div', {
                                    classes: ['mdl-textfield', 'mdl-js-textfield', 'mdl-textfield--floating-labe']
                                }, [
                                    d_1.v('textarea', {
                                        id: 'foo',
                                        rows: '10',
                                        classes: ['mdl-textfield__input'],
                                        onchange: function (e) {
                                            _this._textArea = e.target.value;
                                        }
                                    }),
                                    d_1.v('label', { for: 'foo', classes: ['mdl-textfield__label'] }, [
                                        'store history:'
                                    ])
                                ])
                            ]),
                            d_1.v('div', {
                                classes: ['mdl-card__actions', 'mdl-card--border']
                            }, [
                                d_1.v('button', {
                                    classes: ['mdl-button', 'mdl-js-button', 'mdl-js-ripple-effect'],
                                    onclick: this._createStore
                                }, ['create'])
                            ])
                        ])
                    ])
                ], this._renderStores()))
            ]);
        };
        return Example;
    }(WidgetBase_1.default));
    var Projector = Projector_1.ProjectorMixin(Example);
    var projector = new Projector();
    projector.append();
});
//# sourceMappingURL=main.js.map