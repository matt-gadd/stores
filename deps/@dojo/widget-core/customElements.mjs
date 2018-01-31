import { assign } from '@dojo/core/lang';
import { from as arrayFrom } from '@dojo/shim/array';
import global from '@dojo/shim/global';
import { WidgetBase } from './WidgetBase';
import { v, w } from './d';
import { DomWrapper } from './util/DomWrapper';
import { ProjectorMixin } from './mixins/Projector';
export var ChildrenType;
(function (ChildrenType) {
    ChildrenType["DOJO"] = "DOJO";
    ChildrenType["ELEMENT"] = "ELEMENT";
})(ChildrenType || (ChildrenType = {}));
/**
 * DomToWidgetWrapper HOC
 *
 * @param domNode The dom node to wrap
 */
export function DomToWidgetWrapper(domNode) {
    return class DomToWidgetWrapper extends WidgetBase {
        constructor() {
            super();
            domNode.addEventListener('connected', () => {
                this._widgetInstance = domNode.getWidgetInstance();
                this.invalidate();
            });
        }
        __render__() {
            const vNode = super.__render__();
            vNode.domNode = domNode;
            return vNode;
        }
        render() {
            if (this._widgetInstance) {
                this._widgetInstance.setProperties(Object.assign({ key: 'root' }, this._widgetInstance.properties, this.properties));
            }
            return v(domNode.tagName, {});
        }
    };
}
function getWidgetPropertyFromAttribute(attributeName, attributeValue, descriptor) {
    let { propertyName = attributeName, value = attributeValue } = descriptor;
    if (typeof value === 'function') {
        value = value(attributeValue);
    }
    return [propertyName, value];
}
export let customEventClass = global.CustomEvent;
if (typeof customEventClass !== 'function') {
    const customEvent = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    if (global.Event) {
        customEvent.prototype = global.Event.prototype;
    }
    customEventClass = customEvent;
}
/**
 * Called by HTMLElement subclass to initialize itself with the appropriate attributes/properties/events.
 *
 * @param element The element to initialize.
 */
export function initializeElement(element) {
    let initialProperties = {};
    const { childrenType = ChildrenType.DOJO, attributes = [], events = [], properties = [], initialization } = element.getDescriptor();
    attributes.forEach((attribute) => {
        const attributeName = attribute.attributeName;
        const [propertyName, propertyValue] = getWidgetPropertyFromAttribute(attributeName, element.getAttribute(attributeName.toLowerCase()), attribute);
        initialProperties[propertyName] = propertyValue;
    });
    let customProperties = {};
    attributes.reduce((properties, attribute) => {
        const { propertyName = attribute.attributeName } = attribute;
        properties[propertyName] = {
            get() {
                return element.getWidgetInstance().properties[propertyName];
            },
            set(value) {
                const [propertyName, propertyValue] = getWidgetPropertyFromAttribute(attribute.attributeName, value, attribute);
                element.getWidgetInstance().setProperties(assign({}, element.getWidgetInstance().properties, {
                    [propertyName]: propertyValue
                }));
            }
        };
        return properties;
    }, customProperties);
    properties.reduce((properties, property) => {
        const { propertyName, getValue, setValue } = property;
        const { widgetPropertyName = propertyName } = property;
        properties[propertyName] = {
            get() {
                const value = element.getWidgetInstance().properties[widgetPropertyName];
                return getValue ? getValue(value) : value;
            },
            set(value) {
                element.getWidgetInstance().setProperties(assign({}, element.getWidgetInstance().properties, {
                    [widgetPropertyName]: setValue ? setValue(value) : value
                }));
            }
        };
        return properties;
    }, customProperties);
    Object.defineProperties(element, customProperties);
    // define events
    events.forEach((event) => {
        const { propertyName, eventName } = event;
        initialProperties[propertyName] = (event) => {
            element.dispatchEvent(new customEventClass(eventName, {
                bubbles: false,
                detail: event
            }));
        };
    });
    if (initialization) {
        initialization.call(element, initialProperties);
    }
    const projector = ProjectorMixin(element.getWidgetConstructor());
    const widgetInstance = new projector();
    widgetInstance.setProperties(initialProperties);
    element.setWidgetInstance(widgetInstance);
    return function () {
        let children = [];
        let elementChildren = arrayFrom(element.children);
        elementChildren.forEach((childNode, index) => {
            const properties = { key: `child-${index}` };
            if (childrenType === ChildrenType.DOJO) {
                children.push(w(DomToWidgetWrapper(childNode), properties));
            }
            else {
                children.push(w(DomWrapper(childNode), properties));
            }
        });
        elementChildren.forEach((childNode) => {
            element.removeChild(childNode);
        });
        widgetInstance.setChildren(children);
        widgetInstance.append(element);
    };
}
/**
 * Called by HTMLElement subclass when an HTML attribute has changed.
 *
 * @param element     The element whose attributes are being watched
 * @param name        The name of the attribute
 * @param newValue    The new value of the attribute
 * @param oldValue    The old value of the attribute
 */
export function handleAttributeChanged(element, name, newValue, oldValue) {
    const attributes = element.getDescriptor().attributes || [];
    attributes.forEach((attribute) => {
        const { attributeName } = attribute;
        if (attributeName.toLowerCase() === name.toLowerCase()) {
            const [propertyName, propertyValue] = getWidgetPropertyFromAttribute(attributeName, newValue, attribute);
            element
                .getWidgetInstance()
                .setProperties(assign({}, element.getWidgetInstance().properties, { [propertyName]: propertyValue }));
        }
    });
}
//# sourceMappingURL=customElements.mjs.map