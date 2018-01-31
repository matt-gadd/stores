import { CoreProperties, DefaultWidgetBaseInterface, DNode, VNode, WNode, ProjectionOptions, Projection, VNodeProperties } from './interfaces';
import WeakMap from '@dojo/shim/WeakMap';
import NodeHandler from './NodeHandler';
import RegistryHandler from './RegistryHandler';
export declare type RenderResult = DNode<any> | DNode<any>[];
export interface InternalWNode extends WNode<DefaultWidgetBaseInterface> {
    /**
     * The instance of the widget
     */
    instance: DefaultWidgetBaseInterface;
    /**
     * The rendered DNodes from the instance
     */
    rendered: InternalDNode[];
    /**
     * Core properties that are used by the widget core system
     */
    coreProperties: CoreProperties;
    /**
     * Children for the WNode
     */
    children: InternalDNode[];
}
export interface InternalVNode extends VNode {
    /**
     * Children for the VNode
     */
    children?: InternalDNode[];
    inserted?: boolean;
    /**
     * Bag used to still decorate properties on a deferred properties callback
     */
    decoratedDeferredProperties?: VNodeProperties;
    /**
     * DOM element
     */
    domNode?: Element | Text;
}
export declare type InternalDNode = InternalVNode | InternalWNode;
export interface WidgetData {
    onElementCreated: Function;
    onElementUpdated: Function;
    onDetach: () => void;
    onAttach: () => void;
    parentInvalidate?: Function;
    dirty: boolean;
    registry: () => RegistryHandler;
    nodeHandler: NodeHandler;
    coreProperties: CoreProperties;
    invalidate: Function;
}
export declare const widgetInstanceMap: WeakMap<any, WidgetData>;
export declare function toParentVNode(domNode: Element): InternalVNode;
export declare function toTextVNode(data: any): InternalVNode;
export declare function filterAndDecorateChildren(children: undefined | DNode | DNode[], instance: DefaultWidgetBaseInterface): InternalDNode[];
export declare const dom: {
    create: (dNode: RenderResult, instance: DefaultWidgetBaseInterface, projectionOptions?: Partial<ProjectionOptions> | undefined) => Projection;
    append: (parentNode: Element, dNode: RenderResult, instance: DefaultWidgetBaseInterface, projectionOptions?: Partial<ProjectionOptions> | undefined) => Projection;
    merge: (element: Element, dNode: RenderResult, instance: DefaultWidgetBaseInterface, projectionOptions?: Partial<ProjectionOptions> | undefined) => Projection;
    replace: (element: Element, dNode: RenderResult, instance: DefaultWidgetBaseInterface, projectionOptions?: Partial<ProjectionOptions> | undefined) => Projection;
};
