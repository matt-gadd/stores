(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./../WidgetBase", "./../d"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var WidgetBase_1 = require("./../WidgetBase");
    var d_1 = require("./../d");
    function DomWrapper(domNode, options) {
        if (options === void 0) { options = {}; }
        return /** @class */ (function (_super) {
            tslib_1.__extends(DomWrapper, _super);
            function DomWrapper() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            DomWrapper.prototype.__render__ = function () {
                var vNode = _super.prototype.__render__.call(this);
                vNode.domNode = domNode;
                return vNode;
            };
            DomWrapper.prototype.onElementCreated = function (element, key) {
                options.onAttached && options.onAttached();
            };
            DomWrapper.prototype.render = function () {
                var properties = tslib_1.__assign({}, this.properties, { key: 'root' });
                return d_1.v(domNode.tagName, properties);
            };
            return DomWrapper;
        }(WidgetBase_1.WidgetBase));
    }
    exports.DomWrapper = DomWrapper;
    exports.default = DomWrapper;
});
//# sourceMappingURL=DomWrapper.js.map