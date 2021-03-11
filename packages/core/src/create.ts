import {
	ComponentFunc,
	StandardComponent,
	RenderComponent,
	SimpleComponent,
	ContainerComponent,
	DeliverComponent,
	IRenderer,
	Node,
	ComponentContext,
	NativeComponent,
	Component,
	SimpleComponentFunc,
	ShellComponentFunc,
	ShellComponent,
	Element,
	ElementComponent,
	SelfComponent,
} from './types';
import {
	nameSymbol,
	componentsSymbol,
	objectTypeSymbol,
	objectTypeSymbolSimpleComponent,
	objectTypeSymbolNativeComponent,
	objectTypeSymbolRenderComponent,
	objectTypeSymbolDeliverComponent,
	objectTypeSymbolContainerComponent,
	rendererSymbol,
	deliverKeySymbol,
	deliverDefaultSymbol,
	objectTypeSymbolShellComponent,
	propsSymbol,
	componentValueSymbol,
	objectTypeSymbolElementComponent,
} from './constant/symbols';
import { createElementBase } from './auxiliary';
import { isRenderComponent } from './is';


type Render<
	TObject extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
> =
	((params: TObject, context: ComponentContext<TExpose, TEmit>) => Node)
	| RenderComponent<TObject, TExpose, TEmit>;

interface Options<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
> {
	name?: string;
	components?: Record<string, Component<any>>;
	render?: Render<TObject, TExpose, TEmit>;
	props?: (keyof TProps)[];
}

function setObjectType<
	T extends Function & { [objectTypeSymbol]: any; }
>(
	component: T,
	type: T extends Function & { [objectTypeSymbol]: infer S; } ? S : never,
): T {
	Reflect.defineProperty(component, objectTypeSymbol, { value: type });
	return component;
}

function setName<
	T extends Function & { [nameSymbol]?: string; }
>(component: T, name?: string): T {
	if (!name || typeof name !== 'string') { return component; }
	Reflect.defineProperty(component, nameSymbol, { value: name });
	return component;
}
function setValue<
	V, T extends Function & { [componentValueSymbol]: V; }
>(component: T, value: V): T {
	Reflect.defineProperty(component, componentValueSymbol, { value });
	return component;
}
function setComponents<
	V, T extends Function & { [componentsSymbol]?: V; }
>(component: T, components: V): T {
	if (!components || typeof components !== 'object') { return component; }
	Reflect.defineProperty(component, componentsSymbol, { value: components });
	return component;
}

function createSelfComponent<C extends SelfComponent<any>>(): C {
	const component = function component(params: any): Element<C> {
		return createElementBase(component, params) as Element<C>;
	} as  C;
	return component;
}

export function createDeliverComponent<T>(def: T): DeliverComponent<T>;
export function createDeliverComponent<T>(def?: T): DeliverComponent<T | undefined>;
export function createDeliverComponent<T, D>(def: D): DeliverComponent<T | D>;
export function createDeliverComponent<T>(def: T): DeliverComponent<T> {
	const component = createSelfComponent<DeliverComponent<T>>();
	setObjectType(component, objectTypeSymbolDeliverComponent);
	Reflect.defineProperty(component, deliverKeySymbol, { value: Symbol() });
	Reflect.defineProperty(component, deliverDefaultSymbol, { value: def });
	return component;
}

export function createRenderComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
>(
	f: ComponentFunc<TProps, TExpose, TEmit>,
	{name, components}: {
		name?: string;
		components?: Record<string, Component<any>>;
	} = {},
): RenderComponent<TProps, TExpose, TEmit> {
	const component = createSelfComponent<RenderComponent<TProps, TExpose, TEmit>>();
	setObjectType(component, objectTypeSymbolRenderComponent);
	setName(component, name);
	setValue(component, f);
	setComponents(component, components);
	return component;
}
export function createContainerComponent<P extends object, T = any>(
	value: T,
	{name, renderer}: { name?: string, renderer?: string | IRenderer} = {},
): ContainerComponent<P, T> {
	const component = createSelfComponent<ContainerComponent<P, T>>();
	setObjectType(component, objectTypeSymbolContainerComponent);
	setName(component, name);
	setValue(component, value);
	if (typeof renderer === 'string' || typeof renderer === 'object') {
		Reflect.defineProperty(component, rendererSymbol, { value: renderer });
	}
	return component;
}
export function createElementComponent<P extends object, T>(
	value: T,
	{ name }: { name?: string } = {},
): ElementComponent<P, T> {
	const component = createSelfComponent<ElementComponent<P, T>>();
	setObjectType(component, objectTypeSymbolElementComponent);
	setName(component, name);
	setValue(component, value);
	return component;
}

export function createStandardComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
>(
	f: ComponentFunc<TProps, TExpose, TEmit>,
	options?: Options<TProps, TExpose, TEmit, never> & { render?: undefined },
): StandardComponent<TProps, TExpose, TEmit>;

export function createStandardComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
>(
	f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject,
	options: Options<TProps, TExpose, TEmit, TObject> & { render: Render<TObject, TExpose, TEmit>; },
): StandardComponent<TProps, TExpose, TEmit>;

export function createStandardComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
>(
	f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject | Node,
	{name, components, render, props}: Options<TProps, TExpose, TEmit, TObject> = {},
): StandardComponent<TProps, TExpose, TEmit> {
	const component = createComponentFunc(f, render);
	setName(component, name);
	setComponents(component, components);
	if (Array.isArray(props)) {
		Reflect.defineProperty(component, propsSymbol, { value: [...props] });
	}
	return component;
}

function createComponentFunc<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
>(
	f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject | Node,
	render?: Render<TObject, TExpose, TEmit>,
): StandardComponent<TProps, TExpose, TEmit> {
	if (typeof render !== 'function') {
		return f as StandardComponent<TProps, TExpose, TEmit>;
	}
	const renderComponent = isRenderComponent(render)
		? render
		: createRenderComponent(render);
	return function StandardComponent(props, context): Node {
		return createElementBase(renderComponent, f(props, context) as TObject);
	};
}


export function createNativeComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>
>(
	f: ComponentFunc<TProps, TExpose, TEmit>,
	options: Options<TProps, TExpose, TEmit, never> & { render?: undefined },
): NativeComponent<TProps, TExpose, TEmit>;
export function createNativeComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
>(
	f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject,
	options: Options<TProps, TExpose, TEmit, TObject> & { render: Render<TObject, TExpose, TEmit>; },
): NativeComponent<TProps, TExpose, TEmit>;

export function createNativeComponent<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	TObject extends object,
>(
	f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject | Node,
	{name, components, render, props}: Options<TProps, TExpose, TEmit, TObject> = {},
): NativeComponent<TProps, TExpose, TEmit> {
	const component = createComponentFunc(f, render) as NativeComponent<TProps, TExpose, TEmit>;
	setObjectType(component, objectTypeSymbolNativeComponent);
	setName(component, name);
	setComponents(component, components);
	if (Array.isArray(props)) {
		Reflect.defineProperty(component, propsSymbol, { value: [...props] });
	}
	return component;
}


export function createSimpleComponent<
	TProps extends object,
	TEmit extends Record<string, any>
>(
	f: SimpleComponentFunc<TProps, TEmit>,
	{name, components}: {
		name?: string;
		components?: Record<string, Component<any>>;
	} = {},
): SimpleComponent<TProps, TEmit> {
	const component = f as SimpleComponent<TProps, TEmit>;
	setObjectType(component, objectTypeSymbolSimpleComponent);
	setName(component, name);
	setComponents(component, components);
	return component;
}
export function createShellComponent<
	TProps extends object,
	TEmit extends Record<string, any>
>(
	f: ShellComponentFunc<TProps, TEmit>,
	{name}: { name?: string; } = {},
): ShellComponent<TProps, TEmit> {
	const component = f as ShellComponent<TProps, TEmit>;
	setObjectType(component, objectTypeSymbolShellComponent);
	setName(component, name);
	return component;
}

export {
	createStandardComponent as createComponent,
};
