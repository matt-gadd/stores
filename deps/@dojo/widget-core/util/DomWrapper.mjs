import { WidgetBase } from './../WidgetBase';
import { v } from './../d';
export function DomWrapper(domNode, options = {}) {
    return class DomWrapper extends WidgetBase {
        __render__() {
            const vNode = super.__render__();
            vNode.domNode = domNode;
            return vNode;
        }
        onElementCreated(element, key) {
            options.onAttached && options.onAttached();
        }
        render() {
            const properties = Object.assign({}, this.properties, { key: 'root' });
            return v(domNode.tagName, properties);
        }
    };
}
export default DomWrapper;
//# sourceMappingURL=DomWrapper.mjs.map