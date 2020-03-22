import { Component, NeepNode, Slots, Context, Delivered } from '../type';
import auxiliary from '../auxiliary';
import { monitorable } from '../install';
import { setCurrent } from '../helper/current';
import convert, { destroy, TreeNode } from './convert';
import draw, { unmount, MountedNode } from './draw';
import normalize from './normalize';
import { getSlots, setSlots } from './slot';
import NeepObject from './Object';
import { initContext } from '../helper/context';
import { updateProps } from './props';

function update(
	nObject: Entity<any, any>,
	props: any,
	children:any[],
) {
	updateProps(nObject.props, props);

	const slots = Object.create(null);
	const {
		native,
		container: { iRender },
	} = nObject;
	const childNodes = getSlots(
		iRender,
		children,
		slots,
		Boolean(native),
	);
	setSlots(slots, nObject.slots);
	if (!native) { return; }
	nObject.nativeNodes
		= convert(nObject, childNodes, nObject.nativeNodes);
}

function createContext<
	P extends object = object,
	R extends object = object
>(nObject: Entity<P, R>): Context {
	return initContext({
		slots: nObject.slots,
		get created() { return nObject.created; },
		get parent() { return nObject.parent.exposed; },
		get delivered() { return nObject.parentDelivered; },
		get children() { return nObject.children; },
		get childNodes() { return nObject.childNodes; },
		refresh(f) { nObject.refresh(f); }
	}, nObject.exposed);
}

/** 初始化渲染 */
function initRender<R extends object = object>(
	nObject: Entity<any, R>
): { render(): any, nodes: any, stopRender(): void } {
	const {
		component,
		props,
		context,
		entity,
	} = nObject;
	const refresh = (changed: boolean) => changed && nObject.refresh()
	// 初始化执行
	const result = monitorable.exec(() => setCurrent(
		() => component(props, context, auxiliary),
		entity,
	), refresh, { resultOnly: true, postpone: true });
	if (typeof result === 'function') {
		// 响应式
		const render = monitorable.createExecutable(
			() => normalize(nObject, (result as () => NeepNode)()),
			refresh,
		);
		return {
			nodes: render(),
			render,
			stopRender: () => render.stop(),
		};
	}

	const render = monitorable.createExecutable(
		() => normalize(nObject, setCurrent(
			() => component(props, context, auxiliary),
			entity,
		)),
		refresh,
		{ postpone: true },
	);
	return {
		nodes: monitorable.exec(
			() => normalize(nObject, result),
			refresh,
			{ resultOnly: true, postpone: true },
		),
		render,
		stopRender: () => render.stop(),
	};
}


export default class Entity<
	P extends object = object,
	R extends object = object
> extends NeepObject {
	/** 组件函数 */
	readonly component: Component<P, R>;
	/** 组件属性 */
	readonly props: P = monitorable.encase(Object.create(null));
	/** 组件槽 */
	readonly slots: Slots = monitorable.encase(Object.create(null));
	/** 结果渲染函数 */
	private readonly _stopRender:() => void;
	/** 原生子代 */
	nativeNodes: (TreeNode | TreeNode[])[] | undefined;
	nativeTree: (MountedNode | MountedNode[])[] = [];
	/** 组件上下文 */
	readonly context: Context;
	readonly parent: NeepObject;
	/** 结果渲染函数 */
	constructor(
		component: Component<P, R>,
		props: object,
		children: any[],
		parent: NeepObject,
		delivered?: Delivered,
	) {
		super(parent.iRender, parent, delivered, parent.container);
		this.component = component;
		Reflect.defineProperty(
			this.exposed,
			'$component',
			{ value: component, enumerable: true, configurable: true },
		);
		// // 原生组件
		// const native = nativeRender.component
		// 	&& component[typeSymbol] === 'native' && false;
		// // 原生组件
		// const nativeComponent = native
		// 	? nativeRender.component!()
		// 	: null;
		// this.native = nativeComponent;
		// 父子关系
		this.parent = parent;
		parent.children.add(this.exposed);
		// 上下文属性
		const context = createContext(this);
		this.context = context;
		// 初始化钩子
		this.callHook('beforeCreate');
		// 更新属性
		this.childNodes = children;
		update(this, props, children);
		// 获取渲染函数及初始渲染
		const { render, nodes, stopRender } = initRender(this);
		this._render = render;
		this._stopRender = stopRender;
		this._nodes = convert(this, nodes);
		// 初始化钩子
		this.callHook('created');
		this.created = true;
		if (this._needRefresh) { this.refresh(); }
	}
	/** 更新属性及子代 */
	_update(props: object, children: any[]): void {
		if (this.destroyed) { return; }
		this.childNodes = children;
		update(this, props, children);
	}
	_destroy() {
		if (this._stopRender) {
			this._stopRender();
		}
		this.parent.children.delete(this.exposed);
		destroy(this._nodes);
	}

	/** 刷新 */
	_refresh() {
		this.container.markDraw(this);
	}
	_draw() {
		this.tree = draw(
			this.container.iRender,
			this._nodes,
			this.tree,
		);
		const {native} = this;
		if (native) {
			// const shadow = this.container.iRender.shadow!(native);
			// TODO: 更新 childNodes
		}
	}
	_mount() {
		this.tree = draw(this.container.iRender, this._nodes);
	}
	_unmount() {
		unmount(this.container.iRender, this.tree);
	}
}
