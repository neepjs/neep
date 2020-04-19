import './jsx.d.ts';
import { Auxiliary, Tags } from './auxiliary';
import * as symbols from './symbols';
import { isValue } from './install';
import EventEmitter from './EventEmitter';
import NeepError from './Error';

/** 全局钩子 */
export interface Hook {
	(nObject: Entity): void
}
/** source 对象 */
export type NeepNode = NeepElement | null;

/** 槽函数 */
export interface SlotFn {
	(...props: any): NeepElement;
	readonly children: any[];
}
/** 槽列表 */
export interface Slots {
	[name: string]: SlotFn | undefined;
}
export interface Emit<T extends Record<string, any[]> = Record<string, any[]>> {
	<N extends keyof T>(name: N, ...p: T[N]): void;
	omit(...names: string[]): Emit;
	readonly names: (keyof T)[];
}
export interface EventSet {
	[key: string]: (...p: any[]) => void;
}
export interface On<T extends Record<string, any[]> = Record<string, any[]>> {
	<N extends keyof T>(name: N, listener: (...p: T[N]) => void): () => void;
}

export interface ContextConstructor {
	(context: Context, exposed?: Exposed): void;
}
export type Hooks = 'beforeCreate' | 'created'
	| 'beforeDestroy' | 'destroyed'
	| 'beforeUpdate' | 'updated'
	| 'beforeMount' | 'mounted'
	| 'beforeDraw' | 'drawn'
	| 'beforeDrawAll' | 'drawnAll'
;
export interface Exposed {
	readonly $component: Component<any, any> | null;
	readonly $parent?: Exposed;
	readonly $isContainer: boolean;
	readonly $created: boolean;
	readonly $destroyed: boolean;
	readonly $mounted: boolean;
	readonly $unmounted: boolean;
	/** Only the development mode is valid */
	readonly $label?: [string, string];
	[name: string]: any;
}
export interface Delivered {
	[name: string]: any;
}
export interface RootExposed extends Exposed {
	$update(node?: NeepElement | Component): RootExposed;
	$mount(target?: any): RootExposed;
	$unmount(): void;
}

/** 上下文环境 */
export interface Context {
	/** 作用域槽 */
	slots: Slots;
	/** 是否已经完成初始化 */
	created: boolean;
	/** 父组件 */
	parent?: Exposed;
	delivered: Delivered;
	/** 子组件集合 */
	children: Set<Exposed>;
	childNodes: any[];
	refresh(fn?: () => void): void;
	emit: Emit,
}

export interface Entity {
	readonly exposed: Exposed;
	readonly delivered: Delivered;
	readonly component: Component<any, any> | null;
	readonly parent?: Entity;
	readonly isContainer: boolean;
	readonly created: boolean;
	readonly destroyed: boolean;
	readonly mounted: boolean;
	readonly unmounted: boolean;
	readonly config: Record<string, any>;

	readonly on: On;
	readonly emit: Emit;

	callHook<H extends Hooks>(hook: H): void;
	callHook(hook: string): void;
	setHook<H extends Hooks>(id: H, hook: Hook):() => void;
	setHook(id: string, hook: Hook): () => void;
	readonly $_hooks: { [name: string]: Set<Hook>; }

	refresh(): void;
	refresh<T>(f: () => T, async?: false): T;
	refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
	refresh<T>(
		f: () => PromiseLike<T> | T,
		async?: boolean,
	): PromiseLike<T> | T;
	refresh<T>(
		f?: () => PromiseLike<T> | T,
		async?: boolean,
	): PromiseLike<T> | T | undefined;

	$_valueIndex: number;
	readonly $_values: any[];
}

export interface Render<R extends object = any> {
	(data: R, context: Context, auxiliary: Auxiliary): NeepNode;
}

/** 组件标记 */
export interface Marks {
	/** 组件名称 */
	[symbols.nameSymbol]?: string;
	/** 是否为原生组件 */
	[symbols.typeSymbol]?: 'native' | 'simple' | 'standard';
	[symbols.renderSymbol]?: Render;
	[symbols.configSymbol]?: Record<string, any>;
	[symbols.componentsSymbol]?: Record<string, Component>;
}
/** 构造函数 */
export interface Component<
	P extends object = object,
	R extends object = object,
> extends Marks {
	(
		props: P,
		context: Context,
		auxiliary: Auxiliary
	): undefined | null | NeepNode | NeepNode[] | R |
		(() => undefined | null | NeepNode | NeepNode[] | R);
}

export type Tag = null | string
	| typeof Tags[keyof typeof Tags]
	| Component<any, any>;

export interface Ref {
	(node: NativeNode | Exposed, isRemove?: boolean): void;
}

export interface NeepElement {
	[symbols.isElementSymbol]: true,
	/** 标签名 */
	tag: Tag;
	/** 属性 */
	props?: { [key: string]: any; };
	/** 子节点 */
	children: any[];
	/** 引用绑定 */
	ref?: Ref;
	/** 插槽 */
	slot?: string;
	/** 列表对比 key */
	key?: any;
	/** Value 类型值 */
	value?: any;
	/** Slot 相关的渲染函数 */
	render?(...props: any[]): any;
	/** 槽渲染参数 */
	args?: any[];
	/** 是否是已插入的 */
	inserted?: boolean;
	/** 标注 */
	label?: [string, string];
	$__neep__delivered?: Delivered;
}

declare const NativeElementSymbol: unique symbol;
declare const NativeTextSymbol: unique symbol;
declare const NativeComponentSymbol: unique symbol;
declare const NativePlaceholderSymbol: unique symbol;
declare const NativeShadowSymbol: unique symbol;
/** 原生元素节点 */
export interface NativeElement { [NativeElementSymbol]: true }
/** 原生文本节点 */
export interface NativeText { [NativeTextSymbol]: true }
/** 原生占位组件 */
export interface NativePlaceholder { [NativePlaceholderSymbol]: true }
/** 原生组件 */
export interface NativeComponent { [NativeComponentSymbol]: true }
/** 原生组件内部 */
export interface NativeShadow { [NativeShadowSymbol]: true }

export type NativeContainer =
	NativeElement
	| NativeComponent
	| NativeShadow;
export type NativeNode =
	NativeContainer
	| NativeText
	| NativePlaceholder;

export interface MountProps {
	type?: string | IRender;
	target?: any;
	[key: string]: any;
}

export interface IRenderAuxiliary {
	isValue: typeof isValue;
	EventEmitter: typeof EventEmitter;
	Error: typeof NeepError;
}

export interface IRender {
	type: string;
	install?(auxiliary: IRenderAuxiliary): void;
	nextFrame?(fn: () => void): void;
	mount(
		props: MountProps,
		parent?: IRender
	):
		[NativeContainer, NativeNode];
	unmount(
		container: NativeContainer,
		node: NativeNode,
		removed: boolean,
	): any;
	draw(container: NativeContainer, node: NativeNode): void;
	drawContainer(
		container: NativeContainer,
		node: NativeNode,
		props: MountProps,
		parent?: IRender,
		/**
		 * 当 parent 存在且与当前节点不同时，用于区分
		 */
		isSelf?: boolean,
	): [NativeContainer, NativeNode];

	isNode(v: any): v is NativeNode;
	create(
		tag: string,
		props: Record<string, any>,
	): NativeElement;
	update(
		node: NativeElement,
		props: Record<string, any>,
	): void;
	text(text: string): NativeText;
	placeholder(): NativePlaceholder;

	component?(): [NativeComponent, NativeShadow];

	parent(node: NativeNode): NativeContainer | null;
	next(node: NativeNode): NativeNode | null;

	insert(
		parent: NativeContainer,
		node: NativeNode,
		next?: NativeNode | null,
	): void;
	remove(n: NativeNode): void;
}
