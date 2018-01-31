(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./customElements"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var customElements_1 = require("./customElements");
    /**
     * Register a custom element using the v1 spec of custom elements. Note that
     * this is the default export, and, expects the proposal to work in the browser.
     * This will likely require the polyfill and native shim.
     *
     * @param descriptorFactory
     */
    function registerCustomElement(descriptorFactory) {
        var descriptor = descriptorFactory();
        customElements.define(descriptor.tagName, /** @class */ (function (_super) {
            tslib_1.__extends(class_1, _super);
            function class_1() {
                var _this = _super.call(this) || this;
                _this._isAppended = false;
                _this._appender = customElements_1.initializeElement(_this);
                return _this;
            }
            class_1.prototype.connectedCallback = function () {
                if (!this._isAppended) {
                    this._appender();
                    this._isAppended = true;
                    this.dispatchEvent(new customElements_1.customEventClass('connected', {
                        bubbles: false
                    }));
                }
            };
            class_1.prototype.attributeChangedCallback = function (name, oldValue, newValue) {
                customElements_1.handleAttributeChanged(this, name, newValue, oldValue);
            };
            class_1.prototype.getWidgetInstance = function () {
                return this._widgetInstance;
            };
            class_1.prototype.setWidgetInstance = function (widget) {
                this._widgetInstance = widget;
            };
            class_1.prototype.getWidgetConstructor = function () {
                return this.getDescriptor().widgetConstructor;
            };
            class_1.prototype.getDescriptor = function () {
                return descriptor;
            };
            Object.defineProperty(class_1, "observedAttributes", {
                get: function () {
                    return (descriptor.attributes || []).map(function (attribute) { return attribute.attributeName.toLowerCase(); });
                },
                enumerable: true,
                configurable: true
            });
            return class_1;
        }(HTMLElement)));
    }
    exports.registerCustomElement = registerCustomElement;
    exports.default = registerCustomElement;
});
//# sourceMappingURL=registerCustomElement.js.map