import { WidgetBase } from './../WidgetBase';
import { Constructor, VNodeProperties, WidgetProperties } from './../interfaces';
export interface DomWrapperOptions {
    onAttached?(): void;
}
export declare type DomWrapperProperties = VNodeProperties & WidgetProperties;
export declare type DomWrapper = Constructor<WidgetBase<DomWrapperProperties>>;
export declare function DomWrapper(domNode: Element, options?: DomWrapperOptions): DomWrapper;
export default DomWrapper;
