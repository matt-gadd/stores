import { customEventClass, handleAttributeChanged, initializeElement } from './customElements';
/**
 * Register a custom element using the v1 spec of custom elements. Note that
 * this is the default export, and, expects the proposal to work in the browser.
 * This will likely require the polyfill and native shim.
 *
 * @param descriptorFactory
 */
export function registerCustomElement(descriptorFactory) {
    const descriptor = descriptorFactory();
    customElements.define(descriptor.tagName, class extends HTMLElement {
        constructor() {
            super();
            this._isAppended = false;
            this._appender = initializeElement(this);
        }
        connectedCallback() {
            if (!this._isAppended) {
                this._appender();
                this._isAppended = true;
                this.dispatchEvent(new customEventClass('connected', {
                    bubbles: false
                }));
            }
        }
        attributeChangedCallback(name, oldValue, newValue) {
            handleAttributeChanged(this, name, newValue, oldValue);
        }
        getWidgetInstance() {
            return this._widgetInstance;
        }
        setWidgetInstance(widget) {
            this._widgetInstance = widget;
        }
        getWidgetConstructor() {
            return this.getDescriptor().widgetConstructor;
        }
        getDescriptor() {
            return descriptor;
        }
        static get observedAttributes() {
            return (descriptor.attributes || []).map((attribute) => attribute.attributeName.toLowerCase());
        }
    });
}
export default registerCustomElement;
//# sourceMappingURL=registerCustomElement.mjs.map