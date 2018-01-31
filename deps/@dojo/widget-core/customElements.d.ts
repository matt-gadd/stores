import { Constructor, VNodeProperties, WidgetProperties } from './interfaces';
import { WidgetBase } from './WidgetBase';
import { ProjectorMixin } from './mixins/Projector';
/**
 * @type CustomElementAttributeDescriptor
 *
 * Describes a custom element attribute
 *
 * @property attributeName   The name of the attribute on the DOM element
 * @property propertyName    The name of the property on the widget
 * @property value           A function that takes a string or null value, and returns a new value. The widget's property will be set to the new value.
 */
export interface CustomElementAttributeDescriptor {
    attributeName: string;
    propertyName?: string;
    value?: (value: string | null) => any;
}
/**
 * @type CustomElementPropertyDescriptor
 *
 * Describes a widget property exposed via a custom element
 *
 * @property propertyName        The name of the property on the DOM element
 * @property widgetPropertyName  The name of the property on the widget
 * @property getValue            A transformation function on the widget's property value
 * @property setValue            A transformation function on the DOM elements property value
 */
export interface CustomElementPropertyDescriptor {
    propertyName: string;
    widgetPropertyName?: string;
    getValue?: (value: any) => any;
    setValue?: (value: any) => any;
}
/**
 * @type CustomElementEventDescriptor
 *
 * Describes a custom element event
 *
 * @property propertyName    The name of the property on the widget that takes a function
 * @property eventName       The type of the event to emit (it will be a CustomEvent object of this type)
 */
export interface CustomElementEventDescriptor {
    propertyName: string;
    eventName: string;
}
/**
 * Defines a custom element initializing function. Passes in initial properties so they can be extended
 * by the initializer.
 */
export interface CustomElementInitializer {
    (properties: WidgetProperties): void;
}
export declare enum ChildrenType {
    DOJO = "DOJO",
    ELEMENT = "ELEMENT",
}
/**
 * @type CustomElementDescriptor
 *
 * Describes a custom element.
 *
 * @property tagName             The tag name to register this widget under. Tag names must contain a "-"
 * @property widgetConstructor   widget Constructor that will return the widget to be wrapped in a custom element
 * @property attributes          A list of attributes to define on this element
 * @property properties          A list of properties to define on this element
 * @property events              A list of events to expose on this element
 * @property initialization      A method to run to set custom properties on the wrapped widget
 */
export interface CustomElementDescriptor {
    /**
     * The name of the custom element tag
     */
    tagName: string;
    /**
     * Widget constructor that will create the widget
     */
    widgetConstructor: Constructor<WidgetBase<WidgetProperties>>;
    /**
     * List of attributes on the custom element to map to widget properties
     */
    attributes?: CustomElementAttributeDescriptor[];
    /**
     * List of widget properties to expose as properties on the custom element
     */
    properties?: CustomElementPropertyDescriptor[];
    /**
     * List of events to expose
     */
    events?: CustomElementEventDescriptor[];
    /**
     * Initialization function called before the widget is created (for custom property setting)
     */
    initialization?: CustomElementInitializer;
    /**
     * The type of children that the custom element accepts
     */
    childrenType?: ChildrenType;
}
/**
 * @type CustomElement
 *
 * A custom element extends upon a regular HTMLElement but adds fields for describing and wrapping a widget constructor.
 *
 * @property getWidgetConstructor Return the widget constructor for this element
 * @property getDescriptor        Return the element descriptor for this element
 * @property getWidgetInstance    Return the widget instance that this element wraps
 * @property setWidgetInstance    Set the widget instance for this element
 */
export interface CustomElement extends HTMLElement {
    getWidgetConstructor(): Constructor<WidgetBase<WidgetProperties>>;
    getDescriptor(): CustomElementDescriptor;
    getWidgetInstance(): ProjectorMixin<any>;
    setWidgetInstance(instance: ProjectorMixin<any>): void;
}
/**
 * Properties for DomToWidgetWrapper
 */
export declare type DomToWidgetWrapperProperties = VNodeProperties & WidgetProperties;
/**
 * DomToWidgetWrapper type
 */
export declare type DomToWidgetWrapper = Constructor<WidgetBase<DomToWidgetWrapperProperties>>;
/**
 * DomToWidgetWrapper HOC
 *
 * @param domNode The dom node to wrap
 */
export declare function DomToWidgetWrapper(domNode: CustomElement): DomToWidgetWrapper;
export declare let customEventClass: any;
/**
 * Called by HTMLElement subclass to initialize itself with the appropriate attributes/properties/events.
 *
 * @param element The element to initialize.
 */
export declare function initializeElement(element: CustomElement): () => void;
/**
 * Called by HTMLElement subclass when an HTML attribute has changed.
 *
 * @param element     The element whose attributes are being watched
 * @param name        The name of the attribute
 * @param newValue    The new value of the attribute
 * @param oldValue    The old value of the attribute
 */
export declare function handleAttributeChanged(element: CustomElement, name: string, newValue: string | null, oldValue: string | null): void;
