/**
 * This Decorator is provided properties that define the behavior of a custom element, and
 * registers that custom element.
 */
export function customElement({ tag, properties, attributes, events, initialization }) {
    return function (target) {
        target.prototype.__customElementDescriptor = {
            tagName: tag,
            widgetConstructor: target,
            attributes: (attributes || []).map((attributeName) => ({ attributeName })),
            properties: (properties || []).map((propertyName) => ({ propertyName })),
            events: (events || []).map((propertyName) => ({
                propertyName,
                eventName: propertyName.replace('on', '').toLowerCase()
            })),
            initialization
        };
    };
}
export default customElement;
//# sourceMappingURL=customElement.mjs.map