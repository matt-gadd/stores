(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/shim/Map", "@dojo/shim/WeakMap", "./d", "./diff", "./RegistryHandler", "./NodeHandler", "./vdom", "./Registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Map_1 = require("@dojo/shim/Map");
    var WeakMap_1 = require("@dojo/shim/WeakMap");
    var d_1 = require("./d");
    var diff_1 = require("./diff");
    var RegistryHandler_1 = require("./RegistryHandler");
    var NodeHandler_1 = require("./NodeHandler");
    var vdom_1 = require("./vdom");
    var Registry_1 = require("./Registry");
    var WidgetRenderState;
    (function (WidgetRenderState) {
        WidgetRenderState[WidgetRenderState["IDLE"] = 1] = "IDLE";
        WidgetRenderState[WidgetRenderState["PROPERTIES"] = 2] = "PROPERTIES";
        WidgetRenderState[WidgetRenderState["CHILDREN"] = 3] = "CHILDREN";
        WidgetRenderState[WidgetRenderState["RENDER"] = 4] = "RENDER";
    })(WidgetRenderState || (WidgetRenderState = {}));
    var decoratorMap = new Map_1.default();
    var boundAuto = diff_1.auto.bind(null);
    /**
     * Main widget base for all widgets to extend
     */
    var WidgetBase = /** @class */ (function () {
        /**
         * @constructor
         */
        function WidgetBase() {
            var _this = this;
            /**
             * Indicates if it is the initial set properties cycle
             */
            this._initialProperties = true;
            /**
             * Array of property keys considered changed from the previous set properties
             */
            this._changedPropertyKeys = [];
            this._renderState = WidgetRenderState.IDLE;
            this._nodeHandler = new NodeHandler_1.default();
            this._children = [];
            this._decoratorCache = new Map_1.default();
            this._properties = {};
            this._boundRenderFunc = this.render.bind(this);
            this._boundInvalidate = this.invalidate.bind(this);
            vdom_1.widgetInstanceMap.set(this, {
                dirty: true,
                onElementCreated: function (element, key) {
                    _this.onElementCreated(element, key);
                },
                onElementUpdated: function (element, key) {
                    _this.onElementUpdated(element, key);
                },
                onAttach: function () {
                    _this.onAttach();
                },
                onDetach: function () {
                    _this.onDetach();
                    _this._destroy();
                },
                nodeHandler: this._nodeHandler,
                registry: function () {
                    return _this.registry;
                },
                coreProperties: {},
                invalidate: this._boundInvalidate
            });
            this._runAfterConstructors();
        }
        WidgetBase.prototype.meta = function (MetaType) {
            if (this._metaMap === undefined) {
                this._metaMap = new Map_1.default();
            }
            var cached = this._metaMap.get(MetaType);
            if (!cached) {
                cached = new MetaType({
                    invalidate: this._boundInvalidate,
                    nodeHandler: this._nodeHandler,
                    bind: this
                });
                this._metaMap.set(MetaType, cached);
            }
            return cached;
        };
        /**
         * Widget lifecycle method that is called whenever a dom node is created for a VNode.
         * Override this method to access the dom nodes that were inserted into the dom.
         * @param element The dom node represented by the vdom node.
         * @param key The vdom node's key.
         */
        WidgetBase.prototype.onElementCreated = function (element, key) {
            // Do nothing by default.
        };
        /**
         * Widget lifecycle method that is called whenever a dom node that is associated with a VNode is updated.
         * Override this method to access the dom node.
         * @param element The dom node represented by the vdom node.
         * @param key The vdom node's key.
         */
        WidgetBase.prototype.onElementUpdated = function (element, key) {
            // Do nothing by default.
        };
        WidgetBase.prototype.onAttach = function () {
            // Do nothing by default.
        };
        WidgetBase.prototype.onDetach = function () {
            // Do nothing by default.
        };
        Object.defineProperty(WidgetBase.prototype, "properties", {
            get: function () {
                return this._properties;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WidgetBase.prototype, "changedPropertyKeys", {
            get: function () {
                return tslib_1.__spread(this._changedPropertyKeys);
            },
            enumerable: true,
            configurable: true
        });
        WidgetBase.prototype.__setCoreProperties__ = function (coreProperties) {
            this._renderState = WidgetRenderState.PROPERTIES;
            var baseRegistry = coreProperties.baseRegistry;
            var instanceData = vdom_1.widgetInstanceMap.get(this);
            if (instanceData.coreProperties.baseRegistry !== baseRegistry) {
                if (this._registry === undefined) {
                    this._registry = new RegistryHandler_1.default();
                    this._registry.on('invalidate', this._boundInvalidate);
                }
                this._registry.base = baseRegistry;
                this.invalidate();
            }
            instanceData.coreProperties = coreProperties;
        };
        WidgetBase.prototype.__setProperties__ = function (originalProperties) {
            var _this = this;
            this._renderState = WidgetRenderState.PROPERTIES;
            var properties = this._runBeforeProperties(originalProperties);
            var registeredDiffPropertyNames = this.getDecorator('registeredDiffProperty');
            var changedPropertyKeys = [];
            var propertyNames = Object.keys(properties);
            var instanceData = vdom_1.widgetInstanceMap.get(this);
            if (this._initialProperties === false || registeredDiffPropertyNames.length !== 0) {
                var allProperties = tslib_1.__spread(propertyNames, Object.keys(this._properties));
                var checkedProperties = [];
                var diffPropertyResults = {};
                var runReactions = false;
                for (var i = 0; i < allProperties.length; i++) {
                    var propertyName = allProperties[i];
                    if (checkedProperties.indexOf(propertyName) !== -1) {
                        continue;
                    }
                    checkedProperties.push(propertyName);
                    var previousProperty = this._properties[propertyName];
                    var newProperty = this._bindFunctionProperty(properties[propertyName], instanceData.coreProperties.bind);
                    if (registeredDiffPropertyNames.indexOf(propertyName) !== -1) {
                        runReactions = true;
                        var diffFunctions = this.getDecorator("diffProperty:" + propertyName);
                        for (var i_1 = 0; i_1 < diffFunctions.length; i_1++) {
                            var result = diffFunctions[i_1](previousProperty, newProperty);
                            if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                                changedPropertyKeys.push(propertyName);
                            }
                            if (propertyName in properties) {
                                diffPropertyResults[propertyName] = result.value;
                            }
                        }
                    }
                    else {
                        var result = boundAuto(previousProperty, newProperty);
                        if (result.changed && changedPropertyKeys.indexOf(propertyName) === -1) {
                            changedPropertyKeys.push(propertyName);
                        }
                        if (propertyName in properties) {
                            diffPropertyResults[propertyName] = result.value;
                        }
                    }
                }
                if (runReactions) {
                    this._mapDiffPropertyReactions(properties, changedPropertyKeys).forEach(function (args, reaction) {
                        if (args.changed) {
                            reaction.call(_this, args.previousProperties, args.newProperties);
                        }
                    });
                }
                this._properties = diffPropertyResults;
                this._changedPropertyKeys = changedPropertyKeys;
            }
            else {
                this._initialProperties = false;
                for (var i = 0; i < propertyNames.length; i++) {
                    var propertyName = propertyNames[i];
                    if (typeof properties[propertyName] === 'function') {
                        properties[propertyName] = this._bindFunctionProperty(properties[propertyName], instanceData.coreProperties.bind);
                    }
                    else {
                        changedPropertyKeys.push(propertyName);
                    }
                }
                this._changedPropertyKeys = changedPropertyKeys;
                this._properties = tslib_1.__assign({}, properties);
            }
            if (this._changedPropertyKeys.length > 0) {
                this.invalidate();
            }
            else {
                this._renderState = WidgetRenderState.IDLE;
            }
        };
        Object.defineProperty(WidgetBase.prototype, "children", {
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        WidgetBase.prototype.__setChildren__ = function (children) {
            this._renderState = WidgetRenderState.CHILDREN;
            if (this._children.length > 0 || children.length > 0) {
                this._children = children;
                this.invalidate();
            }
        };
        WidgetBase.prototype.__render__ = function () {
            this._renderState = WidgetRenderState.RENDER;
            var instanceData = vdom_1.widgetInstanceMap.get(this);
            instanceData.dirty = false;
            var render = this._runBeforeRenders();
            var dNode = render();
            dNode = this.runAfterRenders(dNode);
            this._nodeHandler.clear();
            this._renderState = WidgetRenderState.IDLE;
            return dNode;
        };
        WidgetBase.prototype.invalidate = function () {
            var instanceData = vdom_1.widgetInstanceMap.get(this);
            if (this._renderState === WidgetRenderState.IDLE) {
                instanceData.dirty = true;
                if (instanceData.parentInvalidate) {
                    instanceData.parentInvalidate();
                }
            }
            else if (this._renderState === WidgetRenderState.PROPERTIES) {
                instanceData.dirty = true;
            }
            else if (this._renderState === WidgetRenderState.CHILDREN) {
                instanceData.dirty = true;
            }
        };
        WidgetBase.prototype.render = function () {
            return d_1.v('div', {}, this.children);
        };
        /**
         * Function to add decorators to WidgetBase
         *
         * @param decoratorKey The key of the decorator
         * @param value The value of the decorator
         */
        WidgetBase.prototype.addDecorator = function (decoratorKey, value) {
            value = Array.isArray(value) ? value : [value];
            if (this.hasOwnProperty('constructor')) {
                var decoratorList = decoratorMap.get(this.constructor);
                if (!decoratorList) {
                    decoratorList = new Map_1.default();
                    decoratorMap.set(this.constructor, decoratorList);
                }
                var specificDecoratorList = decoratorList.get(decoratorKey);
                if (!specificDecoratorList) {
                    specificDecoratorList = [];
                    decoratorList.set(decoratorKey, specificDecoratorList);
                }
                specificDecoratorList.push.apply(specificDecoratorList, tslib_1.__spread(value));
            }
            else {
                var decorators = this.getDecorator(decoratorKey);
                this._decoratorCache.set(decoratorKey, tslib_1.__spread(decorators, value));
            }
        };
        /**
         * Function to build the list of decorators from the global decorator map.
         *
         * @param decoratorKey  The key of the decorator
         * @return An array of decorator values
         * @private
         */
        WidgetBase.prototype._buildDecoratorList = function (decoratorKey) {
            var allDecorators = [];
            var constructor = this.constructor;
            while (constructor) {
                var instanceMap = decoratorMap.get(constructor);
                if (instanceMap) {
                    var decorators = instanceMap.get(decoratorKey);
                    if (decorators) {
                        allDecorators.unshift.apply(allDecorators, tslib_1.__spread(decorators));
                    }
                }
                constructor = Object.getPrototypeOf(constructor);
            }
            return allDecorators;
        };
        /**
         * Destroys private resources for WidgetBase
         */
        WidgetBase.prototype._destroy = function () {
            if (this._registry) {
                this._registry.destroy();
            }
            if (this._metaMap !== undefined) {
                this._metaMap.forEach(function (meta) {
                    meta.destroy();
                });
            }
        };
        /**
         * Function to retrieve decorator values
         *
         * @param decoratorKey The key of the decorator
         * @returns An array of decorator values
         */
        WidgetBase.prototype.getDecorator = function (decoratorKey) {
            var allDecorators = this._decoratorCache.get(decoratorKey);
            if (allDecorators !== undefined) {
                return allDecorators;
            }
            allDecorators = this._buildDecoratorList(decoratorKey);
            this._decoratorCache.set(decoratorKey, allDecorators);
            return allDecorators;
        };
        WidgetBase.prototype._mapDiffPropertyReactions = function (newProperties, changedPropertyKeys) {
            var _this = this;
            var reactionFunctions = this.getDecorator('diffReaction');
            return reactionFunctions.reduce(function (reactionPropertyMap, _a) {
                var reaction = _a.reaction, propertyName = _a.propertyName;
                var reactionArguments = reactionPropertyMap.get(reaction);
                if (reactionArguments === undefined) {
                    reactionArguments = {
                        previousProperties: {},
                        newProperties: {},
                        changed: false
                    };
                }
                reactionArguments.previousProperties[propertyName] = _this._properties[propertyName];
                reactionArguments.newProperties[propertyName] = newProperties[propertyName];
                if (changedPropertyKeys.indexOf(propertyName) !== -1) {
                    reactionArguments.changed = true;
                }
                reactionPropertyMap.set(reaction, reactionArguments);
                return reactionPropertyMap;
            }, new Map_1.default());
        };
        /**
         * Binds unbound property functions to the specified `bind` property
         *
         * @param properties properties to check for functions
         */
        WidgetBase.prototype._bindFunctionProperty = function (property, bind) {
            if (typeof property === 'function' && Registry_1.isWidgetBaseConstructor(property) === false) {
                if (this._bindFunctionPropertyMap === undefined) {
                    this._bindFunctionPropertyMap = new WeakMap_1.default();
                }
                var bindInfo = this._bindFunctionPropertyMap.get(property) || {};
                var boundFunc = bindInfo.boundFunc, scope = bindInfo.scope;
                if (boundFunc === undefined || scope !== bind) {
                    boundFunc = property.bind(bind);
                    this._bindFunctionPropertyMap.set(property, { boundFunc: boundFunc, scope: bind });
                }
                return boundFunc;
            }
            return property;
        };
        Object.defineProperty(WidgetBase.prototype, "registry", {
            get: function () {
                if (this._registry === undefined) {
                    this._registry = new RegistryHandler_1.default();
                    this._registry.on('invalidate', this._boundInvalidate);
                }
                return this._registry;
            },
            enumerable: true,
            configurable: true
        });
        WidgetBase.prototype._runBeforeProperties = function (properties) {
            var _this = this;
            var beforeProperties = this.getDecorator('beforeProperties');
            if (beforeProperties.length > 0) {
                return beforeProperties.reduce(function (properties, beforePropertiesFunction) {
                    return tslib_1.__assign({}, properties, beforePropertiesFunction.call(_this, properties));
                }, tslib_1.__assign({}, properties));
            }
            return properties;
        };
        /**
         * Run all registered before renders and return the updated render method
         */
        WidgetBase.prototype._runBeforeRenders = function () {
            var _this = this;
            var beforeRenders = this.getDecorator('beforeRender');
            if (beforeRenders.length > 0) {
                return beforeRenders.reduce(function (render, beforeRenderFunction) {
                    var updatedRender = beforeRenderFunction.call(_this, render, _this._properties, _this._children);
                    if (!updatedRender) {
                        console.warn('Render function not returned from beforeRender, using previous render');
                        return render;
                    }
                    return updatedRender;
                }, this._boundRenderFunc);
            }
            return this._boundRenderFunc;
        };
        /**
         * Run all registered after renders and return the decorated DNodes
         *
         * @param dNode The DNodes to run through the after renders
         */
        WidgetBase.prototype.runAfterRenders = function (dNode) {
            var _this = this;
            var afterRenders = this.getDecorator('afterRender');
            if (afterRenders.length > 0) {
                return afterRenders.reduce(function (dNode, afterRenderFunction) {
                    return afterRenderFunction.call(_this, dNode);
                }, dNode);
            }
            if (this._metaMap !== undefined) {
                this._metaMap.forEach(function (meta) {
                    meta.afterRender();
                });
            }
            return dNode;
        };
        WidgetBase.prototype._runAfterConstructors = function () {
            var _this = this;
            var afterConstructors = this.getDecorator('afterConstructor');
            if (afterConstructors.length > 0) {
                afterConstructors.forEach(function (afterConstructor) { return afterConstructor.call(_this); });
            }
        };
        /**
         * static identifier
         */
        WidgetBase._type = Registry_1.WIDGET_BASE_TYPE;
        return WidgetBase;
    }());
    exports.WidgetBase = WidgetBase;
    exports.default = WidgetBase;
});
//# sourceMappingURL=WidgetBase.js.map