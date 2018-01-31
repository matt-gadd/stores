(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/core/lang", "@dojo/shim/array", "@dojo/shim/global", "./WidgetBase", "./d", "./util/DomWrapper", "./mixins/Projector"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var lang_1 = require("@dojo/core/lang");
    var array_1 = require("@dojo/shim/array");
    var global_1 = require("@dojo/shim/global");
    var WidgetBase_1 = require("./WidgetBase");
    var d_1 = require("./d");
    var DomWrapper_1 = require("./util/DomWrapper");
    var Projector_1 = require("./mixins/Projector");
    var ChildrenType;
    (function (ChildrenType) {
        ChildrenType["DOJO"] = "DOJO";
        ChildrenType["ELEMENT"] = "ELEMENT";
    })(ChildrenType = exports.ChildrenType || (exports.ChildrenType = {}));
    /**
     * DomToWidgetWrapper HOC
     *
     * @param domNode The dom node to wrap
     */
    function DomToWidgetWrapper(domNode) {
        return /** @class */ (function (_super) {
            tslib_1.__extends(DomToWidgetWrapper, _super);
            function DomToWidgetWrapper() {
                var _this = _super.call(this) || this;
                domNode.addEventListener('connected', function () {
                    _this._widgetInstance = domNode.getWidgetInstance();
                    _this.invalidate();
                });
                return _this;
            }
            DomToWidgetWrapper.prototype.__render__ = function () {
                var vNode = _super.prototype.__render__.call(this);
                vNode.domNode = domNode;
                return vNode;
            };
            DomToWidgetWrapper.prototype.render = function () {
                if (this._widgetInstance) {
                    this._widgetInstance.setProperties(tslib_1.__assign({ key: 'root' }, this._widgetInstance.properties, this.properties));
                }
                return d_1.v(domNode.tagName, {});
            };
            return DomToWidgetWrapper;
        }(WidgetBase_1.WidgetBase));
    }
    exports.DomToWidgetWrapper = DomToWidgetWrapper;
    function getWidgetPropertyFromAttribute(attributeName, attributeValue, descriptor) {
        var _a = descriptor.propertyName, propertyName = _a === void 0 ? attributeName : _a, _b = descriptor.value, value = _b === void 0 ? attributeValue : _b;
        if (typeof value === 'function') {
            value = value(attributeValue);
        }
        return [propertyName, value];
    }
    exports.customEventClass = global_1.default.CustomEvent;
    if (typeof exports.customEventClass !== 'function') {
        var customEvent = function (event, params) {
            params = params || { bubbles: false, cancelable: false, detail: undefined };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };
        if (global_1.default.Event) {
            customEvent.prototype = global_1.default.Event.prototype;
        }
        exports.customEventClass = customEvent;
    }
    /**
     * Called by HTMLElement subclass to initialize itself with the appropriate attributes/properties/events.
     *
     * @param element The element to initialize.
     */
    function initializeElement(element) {
        var initialProperties = {};
        var _a = element.getDescriptor(), _b = _a.childrenType, childrenType = _b === void 0 ? ChildrenType.DOJO : _b, _c = _a.attributes, attributes = _c === void 0 ? [] : _c, _d = _a.events, events = _d === void 0 ? [] : _d, _e = _a.properties, properties = _e === void 0 ? [] : _e, initialization = _a.initialization;
        attributes.forEach(function (attribute) {
            var attributeName = attribute.attributeName;
            var _a = tslib_1.__read(getWidgetPropertyFromAttribute(attributeName, element.getAttribute(attributeName.toLowerCase()), attribute), 2), propertyName = _a[0], propertyValue = _a[1];
            initialProperties[propertyName] = propertyValue;
        });
        var customProperties = {};
        attributes.reduce(function (properties, attribute) {
            var _a = attribute.propertyName, propertyName = _a === void 0 ? attribute.attributeName : _a;
            properties[propertyName] = {
                get: function () {
                    return element.getWidgetInstance().properties[propertyName];
                },
                set: function (value) {
                    var _a = tslib_1.__read(getWidgetPropertyFromAttribute(attribute.attributeName, value, attribute), 2), propertyName = _a[0], propertyValue = _a[1];
                    element.getWidgetInstance().setProperties(lang_1.assign({}, element.getWidgetInstance().properties, (_b = {},
                        _b[propertyName] = propertyValue,
                        _b)));
                    var _b;
                }
            };
            return properties;
        }, customProperties);
        properties.reduce(function (properties, property) {
            var propertyName = property.propertyName, getValue = property.getValue, setValue = property.setValue;
            var _a = property.widgetPropertyName, widgetPropertyName = _a === void 0 ? propertyName : _a;
            properties[propertyName] = {
                get: function () {
                    var value = element.getWidgetInstance().properties[widgetPropertyName];
                    return getValue ? getValue(value) : value;
                },
                set: function (value) {
                    element.getWidgetInstance().setProperties(lang_1.assign({}, element.getWidgetInstance().properties, (_a = {},
                        _a[widgetPropertyName] = setValue ? setValue(value) : value,
                        _a)));
                    var _a;
                }
            };
            return properties;
        }, customProperties);
        Object.defineProperties(element, customProperties);
        // define events
        events.forEach(function (event) {
            var propertyName = event.propertyName, eventName = event.eventName;
            initialProperties[propertyName] = function (event) {
                element.dispatchEvent(new exports.customEventClass(eventName, {
                    bubbles: false,
                    detail: event
                }));
            };
        });
        if (initialization) {
            initialization.call(element, initialProperties);
        }
        var projector = Projector_1.ProjectorMixin(element.getWidgetConstructor());
        var widgetInstance = new projector();
        widgetInstance.setProperties(initialProperties);
        element.setWidgetInstance(widgetInstance);
        return function () {
            var children = [];
            var elementChildren = array_1.from(element.children);
            elementChildren.forEach(function (childNode, index) {
                var properties = { key: "child-" + index };
                if (childrenType === ChildrenType.DOJO) {
                    children.push(d_1.w(DomToWidgetWrapper(childNode), properties));
                }
                else {
                    children.push(d_1.w(DomWrapper_1.DomWrapper(childNode), properties));
                }
            });
            elementChildren.forEach(function (childNode) {
                element.removeChild(childNode);
            });
            widgetInstance.setChildren(children);
            widgetInstance.append(element);
        };
    }
    exports.initializeElement = initializeElement;
    /**
     * Called by HTMLElement subclass when an HTML attribute has changed.
     *
     * @param element     The element whose attributes are being watched
     * @param name        The name of the attribute
     * @param newValue    The new value of the attribute
     * @param oldValue    The old value of the attribute
     */
    function handleAttributeChanged(element, name, newValue, oldValue) {
        var attributes = element.getDescriptor().attributes || [];
        attributes.forEach(function (attribute) {
            var attributeName = attribute.attributeName;
            if (attributeName.toLowerCase() === name.toLowerCase()) {
                var _a = tslib_1.__read(getWidgetPropertyFromAttribute(attributeName, newValue, attribute), 2), propertyName = _a[0], propertyValue = _a[1];
                element
                    .getWidgetInstance()
                    .setProperties(lang_1.assign({}, element.getWidgetInstance().properties, (_b = {}, _b[propertyName] = propertyValue, _b)));
            }
            var _b;
        });
    }
    exports.handleAttributeChanged = handleAttributeChanged;
});
//# sourceMappingURL=customElements.js.map