import {
	nameSymbol,
	rendererSymbol,
	componentsSymbol,
	objectTypeSymbol,
	objectTypeSymbolDeliverComponent,
	deliverKeySymbol,
	deliverDefaultSymbol,
	propsSymbol,
	objectTypeSymbolNativeComponent,
	objectTypeSymbolSimpleComponent,
	objectTypeSymbolRenderComponent,
	objectTypeSymbolContainerComponent,
	objectTypeSymbolElementComponent,
	objectTypeSymbolShellComponent,
	componentValueSymbol,
} from '../symbols';
import { ComponentContext, ShellContext } from './context';
import { Node, Element } from './node';
import { IRenderer } from './renderer';
import { ComponentEntity } from './entity';

export interface SelfComponent<TProps extends object> {
	(props: TProps): Element<this>;
}
export interface PropsDefinition {
	value?: 'mix' | 'always' | 'valueify'
}
/** 构造函数 */
export interface ComponentFunc<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
> {
	(props: TProps, context: ComponentContext<TExpose, TEmit>): Node;
}
export interface SimpleComponentFunc<
	TProps extends object,
	TEmit extends Record<string, any>
> {
	(props: TProps, context: ShellContext<TEmit>): Node;
}
export interface ShellComponentFunc<
	TProps extends object,
	TEmit extends Record<string, any>
> {
	(props: TProps, context: ShellContext<TEmit>): Node;
}
export interface SpecialComponentFunc<P extends object, C extends any[]> {
	(attrs: P, ...children: C): Node;
}

export interface DeliverComponent<T> extends SelfComponent<{ value?: T }> {
	readonly [objectTypeSymbol]: typeof objectTypeSymbolDeliverComponent;
	readonly [deliverKeySymbol]: symbol;
	readonly [deliverDefaultSymbol]: T;
}

export interface RenderComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
> extends SelfComponent<TProps> {
	readonly [objectTypeSymbol]: typeof objectTypeSymbolRenderComponent;
	readonly [componentValueSymbol]: ComponentFunc<TProps, TExpose, TEmit>;
	readonly [nameSymbol]?: string;
	readonly [componentsSymbol]?: Record<string, Component<any>>;
	readonly [propsSymbol]?: (keyof TProps)[];
}
export interface ContainerComponent<P extends object, T = any> extends SelfComponent<P> {
	readonly [objectTypeSymbol]: typeof objectTypeSymbolContainerComponent;
	readonly [componentValueSymbol]: T;
	readonly [nameSymbol]?: string;
	readonly [rendererSymbol]?: string | IRenderer;
}
export interface ElementComponent<P extends object, T> extends SelfComponent<P> {
	readonly [objectTypeSymbol]: typeof objectTypeSymbolElementComponent;
	readonly [componentValueSymbol]: T;
	readonly [nameSymbol]?: string;
}

export interface StandardComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
> extends ComponentFunc<TProps, TExpose, TEmit> {
	/** 组件名称 */
	[nameSymbol]?: string;
	[componentsSymbol]?: Record<string, Component<any>>;
	[objectTypeSymbol]?: typeof objectTypeSymbolNativeComponent;
	[propsSymbol]?: (keyof TProps)[];
}

export interface NativeComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
> extends StandardComponent<TProps, TExpose, TEmit> {
	[objectTypeSymbol]: typeof objectTypeSymbolNativeComponent
}

export interface SimpleComponent<
	TProps extends object,
	TEmit extends Record<string, any>
> extends SimpleComponentFunc<TProps, TEmit> {
	[objectTypeSymbol]: typeof objectTypeSymbolSimpleComponent;
	/** 组件名称 */
	[nameSymbol]?: string;
	[componentsSymbol]?: Record<string, Component<any>>;
}
export interface ShellComponent<
	TProps extends object,
	TEmit extends Record<string, any>
> extends ShellComponentFunc<TProps, TEmit> {
	[objectTypeSymbol]: typeof objectTypeSymbolShellComponent;
	/** 组件名称 */
	[nameSymbol]?: string;
}


export type Component<P extends object = any> =
| StandardComponent<P, any, any>
| SimpleComponent<P, any>
| ShellComponent<P, any>
| ContainerComponent<P>
| ElementComponent<P, any>
| DeliverComponent<P extends { value?:  infer T } ? T : any>;

export interface Service<T, P extends any[]> {
	(entity: ComponentEntity<any, any>, ...p: P): T;
}
