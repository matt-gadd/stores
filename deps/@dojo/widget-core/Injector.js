(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/core/Evented"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var Evented_1 = require("@dojo/core/Evented");
    var Injector = /** @class */ (function (_super) {
        tslib_1.__extends(Injector, _super);
        function Injector(payload) {
            var _this = _super.call(this) || this;
            _this._payload = payload;
            return _this;
        }
        Injector.prototype.get = function () {
            return this._payload;
        };
        Injector.prototype.set = function (payload) {
            this._payload = payload;
            this.emit({ type: 'invalidate' });
        };
        return Injector;
    }(Evented_1.Evented));
    exports.Injector = Injector;
    exports.default = Injector;
});
//# sourceMappingURL=Injector.js.map