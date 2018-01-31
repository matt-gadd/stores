(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This Decorator is provided properties that define the behavior of a custom element, and
     * registers that custom element.
     */
    function customElement(_a) {
        var tag = _a.tag, properties = _a.properties, attributes = _a.attributes, events = _a.events, initialization = _a.initialization;
        return function (target) {
            target.prototype.__customElementDescriptor = {
                tagName: tag,
                widgetConstructor: target,
                attributes: (attributes || []).map(function (attributeName) { return ({ attributeName: attributeName }); }),
                properties: (properties || []).map(function (propertyName) { return ({ propertyName: propertyName }); }),
                events: (events || []).map(function (propertyName) { return ({
                    propertyName: propertyName,
                    eventName: propertyName.replace('on', '').toLowerCase()
                }); }),
                initialization: initialization
            };
        };
    }
    exports.customElement = customElement;
    exports.default = customElement;
});
//# sourceMappingURL=customElement.js.map