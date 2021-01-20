import { Emit } from './event';

declare const NativeElementSymbol: unique symbol;
declare const NativeTextSymbol: unique symbol;
declare const NativeComponentSymbol: unique symbol;
declare const NativePlaceholderSymbol: unique symbol;
declare const NativeShadowSymbol: unique symbol;

/** 原生元素节点 */
export interface NativeElementNodes {
	core: { [NativeElementSymbol]: true };
}
/** 原生文本节点 */
export interface NativeTextNodes {
	core: { [NativeTextSymbol]: true };
}
/** 原生占位组件 */
export interface NativePlaceholderNodes {
	core: { [NativePlaceholderSymbol]: true };
}
/** 原生组件 */
export interface NativeComponentNodes {
	core: { [NativeComponentSymbol]: true };
}
/** 原生组件内部 */
export interface NativeShadowNodes {
	core: { [NativeShadowSymbol]: true };
}

/** 原生元素节点 */
export type NativeElementNode = ValueOf<NativeElementNodes>;
/** 原生文本节点 */
export type NativeTextNode = ValueOf<NativeTextNodes>;
/** 原生占位组件 */
export type NativePlaceholderNode = ValueOf<NativePlaceholderNodes>;
/** 原生组件 */
export type NativeComponentNode = ValueOf<NativeComponentNodes>;
/** 原生组件内部 */
export type NativeShadowNode = ValueOf<NativeShadowNodes>;


type ValueOf<T extends object> = T[keyof T];

export type NativeContainerNode =
	NativeElementNode
	| NativeComponentNode
	| NativeShadowNode;
export type NativeNode =
	NativeContainerNode
	| NativeTextNode
	| NativePlaceholderNode;


export interface Rect {
	readonly bottom: number;
	readonly height: number;
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly width: number;
}


export type MountOptions = Record<string, any>;

export interface MountContainerResult {
	container: NativeContainerNode,
	target: NativeContainerNode | null,
	insert: NativeNode | null,
	next: NativeNode | null,
	exposed: any,
}
export interface UpdateContainerResult {
	target: NativeContainerNode | null,
	insert: NativeNode | null,
	next: NativeNode | null,
}

export interface IRenderer<T = any> {
	type: string;
	nextFrame?(this: this, fn: () => void): void;

	getContainer(
		this: this,
		container: NativeContainerNode,
		target: any,
		next: any,
	): [ NativeContainerNode | null, NativeNode | null ],
	/**
	 * 创建挂载容器组件
	 * @param data 创建数据
	 * @param props 创建参数
	 * @param parent 父渲染器
	 */
	mountContainer(
		this: this,
		data: T,
		props: Record<string, any>,
		emit: Emit<Record<string, any>>,
		parent: IRenderer | undefined,
	): MountContainerResult;
	updateContainer(
		this: this,
		container: NativeContainerNode,
		target: NativeContainerNode | null,
		insert: NativeNode | null,
		next: NativeNode | null,
		data: T,
		props: Record<string, any>,
		emit: Emit<Record<string, any>>,
		parent: IRenderer | undefined,
	): UpdateContainerResult;
	recoveryContainer(
		this: this,
		container: NativeContainerNode,
		target: NativeContainerNode | null,
		insert: NativeNode | null,
		next: NativeNode | null,
		newTarget: NativeContainerNode | null,
		newInsert: NativeNode | null,
		newNext: NativeNode | null,
		data: T,
		props: Record<string, any>,
		parent: IRenderer | undefined,
	): void;
	unmountContainer(
		this: this,
		container: NativeContainerNode,
		target: NativeContainerNode | null,
		insert: NativeNode | null,
		next: NativeNode | null,
		data: T,
		props: Record<string, any>,
		parent: IRenderer | undefined,
	): void;

	getMountOptions(
		this: this,
		node: NativeNode,
		options: MountOptions,
	): MountOptions | undefined | void;


	isNode(
		this: this,
		v: any,
	): v is NativeNode;
	createElement(
		this: this,
		data: string | T,
		props: Record<string, any>,
		mountOptions: MountOptions,
	): NativeElementNode | null;
	updateProps(
		this: this,
		node: NativeElementNode,
		data: string | T,
		props: Record<string, any>,
		emit: Emit<Record<string, any>>,
		mountOptions: MountOptions,
	): void;
	createText(this: this, text: string): NativeTextNode;
	createPlaceholder(this: this): NativePlaceholderNode;

	createComponent?(this: this): [NativeComponentNode, NativeShadowNode];

	getParent(this: this, node: NativeNode): NativeContainerNode | null;
	nextNode(this: this, node: NativeNode): NativeNode | null;

	insertNode(
		this: this,
		parent: NativeContainerNode,
		node: NativeNode,
		next?: NativeNode | null,
	): void;
	removeNode(this: this, n: NativeNode): void;
}
