import { Constructor, DefaultWidgetBaseInterface, DeferredVirtualProperties, DNode, VNode, RegistryLabel, VNodeProperties, WidgetBaseInterface, WNode } from './interfaces';
/**
 * The symbol identifier for a WNode type
 */
export declare const WNODE: symbol;
/**
 * The symbol identifier for a VNode type
 */
export declare const VNODE: symbol;
/**
 * Helper function that returns true if the `DNode` is a `WNode` using the `type` property
 */
export declare function isWNode<W extends WidgetBaseInterface = DefaultWidgetBaseInterface>(child: DNode<W>): child is WNode<W>;
/**
 * Helper function that returns true if the `DNode` is a `VNode` using the `type` property
 */
export declare function isVNode(child: DNode): child is VNode;
/**
 * Generic decorate function for DNodes. The nodes are modified in place based on the provided predicate
 * and modifier functions.
 *
 * The children of each node are flattened and added to the array for decoration.
 *
 * If no predicate is supplied then the modifier will be executed on all nodes.
 */
export declare function decorate<T extends DNode>(dNodes: DNode, modifier: (dNode: T) => void, predicate: (dNode: DNode) => dNode is T): DNode;
export declare function decorate<T extends DNode>(dNodes: DNode[], modifier: (dNode: T) => void, predicate: (dNode: DNode) => dNode is T): DNode[];
export declare function decorate(dNodes: DNode, modifier: (dNode: DNode) => void): DNode;
export declare function decorate(dNodes: DNode[], modifier: (dNode: DNode) => void): DNode[];
/**
 * Wrapper function for calls to create a widget.
 */
export declare function w<W extends WidgetBaseInterface>(widgetConstructor: Constructor<W> | RegistryLabel, properties: W['properties'], children?: W['children']): WNode<W>;
/**
 * Wrapper function for calls to create VNodes.
 */
export declare function v(tag: string, properties: VNodeProperties | DeferredVirtualProperties, children?: DNode[]): VNode;
export declare function v(tag: string, children: undefined | DNode[]): VNode;
export declare function v(tag: string): VNode;
