(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/shim/Symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Symbol_1 = require("@dojo/shim/Symbol");
    /**
     * The symbol identifier for a WNode type
     */
    exports.WNODE = Symbol_1.default('Identifier for a WNode.');
    /**
     * The symbol identifier for a VNode type
     */
    exports.VNODE = Symbol_1.default('Identifier for a VNode.');
    /**
     * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
     */
    function isWNode(child) {
        return Boolean(child && typeof child !== 'string' && child.type === exports.WNODE);
    }
    exports.isWNode = isWNode;
    /**
     * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
     */
    function isVNode(child) {
        return Boolean(child && typeof child !== 'string' && child.type === exports.VNODE);
    }
    exports.isVNode = isVNode;
    function decorate(dNodes, modifier, predicate) {
        var nodes = Array.isArray(dNodes) ? tslib_1.__spread(dNodes) : [dNodes];
        while (nodes.length) {
            var node = nodes.pop();
            if (node) {
                if (!predicate || predicate(node)) {
                    modifier(node);
                }
                if ((isWNode(node) || isVNode(node)) && node.children) {
                    nodes = tslib_1.__spread(nodes, node.children);
                }
            }
        }
        return dNodes;
    }
    exports.decorate = decorate;
    /**
     * Wrapper function for calls to create a widget.
     */
    function w(widgetConstructor, properties, children) {
        if (children === void 0) { children = []; }
        return {
            children: children,
            widgetConstructor: widgetConstructor,
            properties: properties,
            type: exports.WNODE
        };
    }
    exports.w = w;
    function v(tag, propertiesOrChildren, children) {
        if (propertiesOrChildren === void 0) { propertiesOrChildren = {}; }
        if (children === void 0) { children = undefined; }
        var properties = propertiesOrChildren;
        var deferredPropertiesCallback;
        if (Array.isArray(propertiesOrChildren)) {
            children = propertiesOrChildren;
            properties = {};
        }
        if (typeof properties === 'function') {
            deferredPropertiesCallback = properties;
            properties = {};
        }
        return {
            tag: tag,
            deferredPropertiesCallback: deferredPropertiesCallback,
            children: children,
            properties: properties,
            type: exports.VNODE
        };
    }
    exports.v = v;
});
//# sourceMappingURL=d.js.map