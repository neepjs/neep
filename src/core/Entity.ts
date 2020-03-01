import {
	NeepComponent,
	NeepNode,
	Slots,
	Context,
	NativeComponent,
} from './type';
import auxiliary from './auxiliary';
import { monitorable } from './install';
import { setCurrent } from './helper/current';
import convert, { destroy, TreeNode } from './convert';
import Container from './Container';
import draw, { unmount, MountedNode } from './draw';
import normalize from './utils/normalize';
import { getSlots, setSlots } from './utils/slot';
import NeepObject from './Object';

function updateProps(
	nObject: Entity<any, any>,
	props: any,
	children:any[],
) {
	const oldProps = nObject.props;
	const newKeys = new Set(Reflect.ownKeys(props));
	for (const k of Reflect.ownKeys(oldProps)) {
		if (!newKeys.has(k)) {
			delete oldProps[k];
		}
	}
	for (const k of newKeys) {
		oldProps[k] = props[k];
	}

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
	setSlots(iRender, slots, nObject.slots);
	if (!native) { return; }
	nObject._childNodes
		= convert(nObject, childNodes, nObject._childNodes);
}

function createContext<
	P extends object = object,
	R extends object = object
>(nObject: Entity<P, R>): Context {
	return {
		slots: nObject.slots,
		get inited() {
			return nObject.inited;
		},
		get parent() {
			return nObject.parent.exposed;
		},
		get children() {
			return nObject.children;
		},
		get childNodes() {
			return nObject.childNodes;
		},
	};
}

/** 初始化渲染 */
function initRender<R extends object = object>(
	nObject: Entity<any, R>
): { render(): any, nodes: any, stopRender?(): void } {
	const {
		component,
		props,
		context,
		container: { iRender },
		exposed,
	} = nObject;
	const native = Boolean(nObject.native);
	// 初始化执行
	const result = setCurrent(
		() => component(props, context, auxiliary),
		exposed,
	);
	if (typeof result === 'function') {
		// 响应式
		const render = monitorable.createExecutable(
			() => normalize(
				(result as () => NeepNode)(),
				context,
				component,
				iRender,
				native,
			),
			changed => changed && nObject.refresh(),
		);
		return {
			nodes: render(),
			render,
			stopRender: () => render.stop(),
		};
	}

	return {
		nodes: normalize(result, context, component, iRender, native),
		render:() => normalize(setCurrent(
			() => component(props, context, auxiliary) as R,
			exposed,
		), context, component, iRender, native),
	};
}


export default class Entity<
	P extends object = object,
	R extends object = object
> extends NeepObject {
	/** 组件函数 */
	readonly component: NeepComponent<P, R>;
	/** 组件属性 */
	readonly props: P = monitorable.getProxy(Object.create(null));
	/** 组件槽 */
	readonly slots: Slots = monitorable.getProxy(Object.create(null));
	/** 结果渲染函数 */
	private readonly _render:() => NeepNode[];
	/** 结果渲染函数 */
	private readonly _stopRender?:() => void;
	/** 渲染结果 */
	private _nodes: (TreeNode | TreeNode[])[];
	_childNodes: (TreeNode | TreeNode[])[] | undefined;
	_children: (MountedNode | MountedNode[])[] = [];
	/** 组件上下文 */
	readonly context: Context;
	/** 原生组件 */
	readonly native: NativeComponent | null = null;
	readonly parent: Entity<any, any> | Container;
	readonly container: Container;
	childNodes: any[];
	constructor(
		component: NeepComponent<P, R>,
		props: object,
		children: any[],
		parent: Entity<any, any> | Container,
	) {
		super();
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
		this.container = parent instanceof Container
			? parent
			: parent.container;
		// 上下文属性
		const context = createContext(this);
		this.context = context;
		// 初始化钩子
		this.callHook('beforeInit');
		// 更新属性
		this.childNodes = children;
		updateProps(this, props, children);
		// 获取渲染函数及初始渲染
		const { render, nodes, stopRender } = initRender(this);
		this._render = render;
		this._stopRender = stopRender;
		this._nodes = convert(this, nodes);
		// 初始化钩子
		this.callHook('inited');
		this.inited = true;
		if (this._needRefresh) { this.refresh(); }
	}
	/** 更新属性及子代 */
	update(
		props: object,
		children: any[],
	): this {
		if (this.destroyed) { return this; }
		this.childNodes = children;
		updateProps(this, props, children);
		if (!this._stopRender || this.native) {
			this.refresh();
		}
		return this;
	}
	destroy() {
		if (this.destroyed) { return; }
		this.destroyed = true;
		this.callHook('beforeDestroy');
		if (this._stopRender) {
			this._stopRender();
		}
		if (this.parent) {
			this.parent.children.delete(this.exposed);
		}
		destroy(this._nodes);
		this.callHook('destroyed');
	}

	/** 是否需要继续刷新 */
	private _needRefresh = false;
	/** 是否为刷新中 */
	private _refreshing = false;
	/** 刷新 */
	refresh() {
		if (this.destroyed) { return; }
		if (!this.inited) { return; }
		this._needRefresh = true;
		if (this._refreshing) { return; }
		this._refreshing = true;
		let nodes: NeepNode[];
		while(this._needRefresh) {
			this._needRefresh = false;
			nodes = this._render();
			if (this.destroyed) { return; }
		}
		this._refreshing = false;
		this._nodes = convert(this, nodes!, this._nodes);
		if (!this.mounted) { return; }
		this.container.markDraw(this);
	}
	draw() {
		if (this.destroyed) { return; }
		this.callHook('beforeUpdate');
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

		this.callHook('updated');
	}
	_mounting = false;
	mount() {
		if (this.mounted) { return; }
		if (this._mounting) { return; }
		this._mounting = true;
		this.callHook('beforeMount');
		this.tree = draw(this.container.iRender, this._nodes);
		this.callHook('mounted');
		this.mounted = true;
	}
	unmount() {
		if (!this.mounted) { return; }
		if (this.unmounted) { return; }
		this.unmounted = true;
		unmount(this.container.iRender, this.tree);
	}
}
