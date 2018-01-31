import { Bundle, Messages } from '@dojo/i18n/i18n';
import { Constructor, WidgetProperties } from './../interfaces';
import { Injector } from './../Injector';
import { Registry } from './../Registry';
import { WidgetBase } from './../WidgetBase';
export declare const INJECTOR_KEY: symbol;
export interface LocaleData {
    /**
     * The locale for the widget. If not specified, then the root locale (as determined by `@dojo/i18n`) is assumed.
     * If specified, the widget's node will have a `lang` property set to the locale.
     */
    locale?: string;
    /**
     * An optional flag indicating the widget's text direction. If `true`, then the underlying node's `dir`
     * property is set to "rtl". If it is `false`, then the `dir` property is set to "ltr". Otherwise, the property
     * is not set.
     */
    rtl?: boolean;
}
export interface I18nProperties extends LocaleData, WidgetProperties {
}
export declare type LocalizedMessages<T extends Messages> = T & {
    /**
     * Formats an ICU-formatted message template for the represented bundle.
     *
     * @param key
     * The message key.
     *
     * @param options
     * The values to pass to the formatter.
     *
     * @return
     * The formatted string.
     */
    format(key: string, options?: any): string;
};
/**
 * interface for I18n functionality
 */
export interface I18nMixin {
    /**
     * Return the cached messages for the specified bundle for the current locale, assuming they have already
     * been loaded. If the locale-specific messages have not been loaded, they are fetched and the widget state
     * is updated.
     *
     * @param bundle
     * The required bundle object for which available locale messages should be loaded.
     *
     * @return
     * The localized messages, along with a `format` method for formatting ICU-formatted templates.
     */
    localizeBundle<T extends Messages>(bundle: Bundle<T>): LocalizedMessages<T>;
    properties: I18nProperties;
}
export declare function registerI18nInjector(localeData: LocaleData, registry: Registry): Injector;
export declare function I18nMixin<T extends Constructor<WidgetBase<any>>>(Base: T): T & Constructor<I18nMixin>;
export default I18nMixin;
