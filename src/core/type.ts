import { Auxiliary, Tags } from './auxiliary';
import { Marks } from './create/mark';
import Entity from './Entity';
import { isElementSymbol } from './symbols';
import Container from './Container';

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
export interface Exposed {
	readonly $component: NeepComponent<any, any> | null;
	readonly $isContainer: boolean;
	readonly $inited: boolean;
	readonly $mounted: boolean;
	readonly $destroyed: boolean;
	/** Only the development mode is valid */
	readonly $label?: [string, string];
	[name: string]: any;
}
export interface RootExposed {
	$mount(target?: any): RootExposed;
	$update(node?: NeepElement | NeepComponent): RootExposed;
}
export interface Render<R extends object = any> {
	(data: R, context: Context, auxiliary: Auxiliary): NeepNode;
}

/** 上下文环境 */
export interface Context {
	/** 作用域槽 */
	slots: Slots;
	/** 是否已经完成初始化 */
	inited: boolean;
	/** 父组件 */
	parent?: Exposed;
	/** 子组件集合 */
	children: Set<Exposed>;
}

/** 构造函数 */

export interface NeepResponseComponent<
	P extends object = object,
	R extends object = object,
> extends Marks {
	(
		props: P,
		context: Context,
		auxiliary: Auxiliary
	): () => undefined | NeepNode | NeepNode[] | R;
}

export interface NeepRepeatedlyComponent<
	P extends object = object,
	R extends object = object,
> extends Marks {
	(
		props: P,
		context: Context,
		auxiliary: Auxiliary,
	): undefined | NeepNode | NeepNode[] | R;
}

export type NeepComponent<
	P extends object = object,
	R extends object = object,
> = NeepResponseComponent<P, R> | NeepRepeatedlyComponent<P, R>;

export type Tag = null | string
	| typeof Tags[keyof typeof Tags]
	| NeepComponent;


export interface NeepElement {
	[isElementSymbol]: true,
	/** 标签名 */
	tag: Tag;
	/** 属性 */
	props?: { [key: string]: any; };
	/** 事件 */
	on?: { [key: string]: (event: Event) => void; };
	/** 子节点 */
	children: any[];
	/** 引用绑定 */
	ref?(node: Native.Node | Exposed, isRemove?: boolean): void;
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
}


export namespace Native {
	const ElementSymbol = Symbol();
	const TextSymbol = Symbol();
	const ComponentSymbol = Symbol();
	const PlaceholderSymbol = Symbol();
	const ShadowSymbol = Symbol();
	
	/** 原生元素节点 */
	export interface Element { [ElementSymbol]: true };
	/** 原生文本节点 */
	export interface Text { [TextSymbol]: true };
	/** 原生占位组件 */
	export interface Placeholder { [PlaceholderSymbol]: true };
	/** 原生组件 */
	export interface Component { [ComponentSymbol]: true };
	/** 原生组件内部 */
	export interface Shadow { [ShadowSymbol]: true };

	export type Container = Element | Component | Shadow;
	export type Node = Container | Text | Placeholder;
}

export interface MountProps {
	type?: string | IRender;
	target?: any;
	[key: string]: any;
}
export interface IRender {
	type: string;
	mount(props: MountProps, parent?: IRender):
		[Native.Container, Native.Node];
	unmount(
		container: Native.Container,
		node: Native.Node,
		removed: boolean,
	): any;
	darw(container: Native.Container, node: Native.Node): void;

	isNode(v: any): v is Native.Node;
	create(tag: string, props: {[k: string]: any}): Native.Element;
	text(text: string): Native.Text;
	placeholder(): Native.Placeholder;

	component?(): [Native.Component, Native.Shadow];

	parent(node: Native.Node): Native.Container | null;
	next(node: Native.Node): Native.Node | null;

	update(node: Native.Element, props: {[key: string]: string}): void;
	insert(
		parent: Native.Container,
		node: Native.Node,
		next?: Native.Node | null,
	): void;
	remove(n: Native.Node): void;
}

/** 组件标记函数 */
export interface Mark {
	<N extends NeepComponent<any, any>>(component: N): N;
}
