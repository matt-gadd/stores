(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@dojo/core/lang", "@dojo/i18n/i18n", "./../d", "./../decorators/afterRender", "./../decorators/inject", "./../Injector"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /* tslint:disable:interface-name */
    var lang_1 = require("@dojo/core/lang");
    var i18n_1 = require("@dojo/i18n/i18n");
    var d_1 = require("./../d");
    var afterRender_1 = require("./../decorators/afterRender");
    var inject_1 = require("./../decorators/inject");
    var Injector_1 = require("./../Injector");
    exports.INJECTOR_KEY = Symbol('i18n');
    function registerI18nInjector(localeData, registry) {
        var injector = new Injector_1.Injector(localeData);
        registry.defineInjector(exports.INJECTOR_KEY, injector);
        return injector;
    }
    exports.registerI18nInjector = registerI18nInjector;
    function I18nMixin(Base) {
        var I18n = /** @class */ (function (_super) {
            tslib_1.__extends(I18n, _super);
            function I18n() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            I18n.prototype.localizeBundle = function (bundle) {
                var locale = this.properties.locale;
                var messages = this._getLocaleMessages(bundle) || bundle.messages;
                return lang_1.assign(Object.create({
                    format: function (key, options) {
                        return i18n_1.formatMessage(bundle, key, options, locale);
                    }
                }), messages);
            };
            I18n.prototype.renderDecorator = function (result) {
                if (d_1.isVNode(result)) {
                    var _a = this.properties, locale = _a.locale, rtl = _a.rtl;
                    var properties = {
                        dir: null,
                        lang: null
                    };
                    if (typeof rtl === 'boolean') {
                        properties['dir'] = rtl ? 'rtl' : 'ltr';
                    }
                    if (locale) {
                        properties['lang'] = locale;
                    }
                    lang_1.assign(result.properties, properties);
                }
                return result;
            };
            /**
             * @private
             * Return the cached dictionary for the specified bundle and locale, if it exists. If the requested dictionary does not
             * exist, then load it and update the instance's state with the appropriate messages.
             *
             * @param bundle
             * The bundle for which to load a locale-specific dictionary.
             *
             * @return
             * The locale-specific dictionary, if it has already been loaded and cached.
             */
            I18n.prototype._getLocaleMessages = function (bundle) {
                var _this = this;
                var properties = this.properties;
                var locale = properties.locale || i18n_1.default.locale;
                var localeMessages = i18n_1.getCachedMessages(bundle, locale);
                if (localeMessages) {
                    return localeMessages;
                }
                i18n_1.default(bundle, locale).then(function () {
                    _this.invalidate();
                });
            };
            tslib_1.__decorate([
                afterRender_1.afterRender(),
                tslib_1.__metadata("design:type", Function),
                tslib_1.__metadata("design:paramtypes", [Object]),
                tslib_1.__metadata("design:returntype", Object)
            ], I18n.prototype, "renderDecorator", null);
            I18n = tslib_1.__decorate([
                inject_1.inject({
                    name: exports.INJECTOR_KEY,
                    getProperties: function (localeData, properties) {
                        var _a = properties.locale, locale = _a === void 0 ? localeData.locale : _a, _b = properties.rtl, rtl = _b === void 0 ? localeData.rtl : _b;
                        return { locale: locale, rtl: rtl };
                    }
                })
            ], I18n);
            return I18n;
        }(Base));
        return I18n;
    }
    exports.I18nMixin = I18nMixin;
    exports.default = I18nMixin;
});
//# sourceMappingURL=I18n.js.map