import Symbol from '@dojo/shim/Symbol';
/**
 * The symbol identifier for a WNode type
 */
export const WNODE = Symbol('Identifier for a WNode.');
/**
 * The symbol identifier for a VNode type
 */
export const VNODE = Symbol('Identifier for a VNode.');
/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
export function isWNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === WNODE);
}
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
export function isVNode(child) {
    return Boolean(child && typeof child !== 'string' && child.type === VNODE);
}
export function decorate(dNodes, modifier, predicate) {
    let nodes = Array.isArray(dNodes) ? [...dNodes] : [dNodes];
    while (nodes.length) {
        const node = nodes.pop();
        if (node) {
            if (!predicate || predicate(node)) {
                modifier(node);
            }
            if ((isWNode(node) || isVNode(node)) && node.children) {
                nodes = [...nodes, ...node.children];
            }
        }
    }
    return dNodes;
}
/**
 * Wrapper function for calls to create a widget.
 */
export function w(widgetConstructor, properties, children = []) {
    return {
        children,
        widgetConstructor,
        properties,
        type: WNODE
    };
}
export function v(tag, propertiesOrChildren = {}, children = undefined) {
    let properties = propertiesOrChildren;
    let deferredPropertiesCallback;
    if (Array.isArray(propertiesOrChildren)) {
        children = propertiesOrChildren;
        properties = {};
    }
    if (typeof properties === 'function') {
        deferredPropertiesCallback = properties;
        properties = {};
    }
    return {
        tag,
        deferredPropertiesCallback,
        children,
        properties,
        type: VNODE
    };
}
//# sourceMappingURL=d.mjs.map