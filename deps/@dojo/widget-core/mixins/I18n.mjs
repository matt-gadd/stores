import * as tslib_1 from "tslib";
/* tslint:disable:interface-name */
import { assign } from '@dojo/core/lang';
import i18n, { formatMessage, getCachedMessages } from '@dojo/i18n/i18n';
import { isVNode } from './../d';
import { afterRender } from './../decorators/afterRender';
import { inject } from './../decorators/inject';
import { Injector } from './../Injector';
export const INJECTOR_KEY = Symbol('i18n');
export function registerI18nInjector(localeData, registry) {
    const injector = new Injector(localeData);
    registry.defineInjector(INJECTOR_KEY, injector);
    return injector;
}
export function I18nMixin(Base) {
    let I18n = class I18n extends Base {
        localizeBundle(bundle) {
            const { locale } = this.properties;
            const messages = this._getLocaleMessages(bundle) || bundle.messages;
            return assign(Object.create({
                format(key, options) {
                    return formatMessage(bundle, key, options, locale);
                }
            }), messages);
        }
        renderDecorator(result) {
            if (isVNode(result)) {
                const { locale, rtl } = this.properties;
                const properties = {
                    dir: null,
                    lang: null
                };
                if (typeof rtl === 'boolean') {
                    properties['dir'] = rtl ? 'rtl' : 'ltr';
                }
                if (locale) {
                    properties['lang'] = locale;
                }
                assign(result.properties, properties);
            }
            return result;
        }
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
        _getLocaleMessages(bundle) {
            const { properties } = this;
            const locale = properties.locale || i18n.locale;
            const localeMessages = getCachedMessages(bundle, locale);
            if (localeMessages) {
                return localeMessages;
            }
            i18n(bundle, locale).then(() => {
                this.invalidate();
            });
        }
    };
    tslib_1.__decorate([
        afterRender(),
        tslib_1.__metadata("design:type", Function),
        tslib_1.__metadata("design:paramtypes", [Object]),
        tslib_1.__metadata("design:returntype", Object)
    ], I18n.prototype, "renderDecorator", null);
    I18n = tslib_1.__decorate([
        inject({
            name: INJECTOR_KEY,
            getProperties: (localeData, properties) => {
                const { locale = localeData.locale, rtl = localeData.rtl } = properties;
                return { locale, rtl };
            }
        })
    ], I18n);
    return I18n;
}
export default I18nMixin;
//# sourceMappingURL=I18n.mjs.map