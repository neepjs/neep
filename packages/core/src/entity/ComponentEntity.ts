import { Component, NeepNode, Slots, Context, Delivered, NativeShadow, TreeNode, MountedNode } from '../type';
import auxiliary from '../auxiliary';
import { exec, monitor, encase } from '../install';
import { setCurrent } from '../helper/current';
import convert, { destroy } from './convert';
import draw, { unmount, getNodes } from './draw';
import normalize from './normalize';
import { getSlots, setSlots } from './slot';
import EntityObject from './EntityObject';
import { initContext } from '../helper/context';
import { updateProps } from './props';
import { typeSymbol, configSymbol, componentsSymbol } from '../symbols';
import { refresh } from '../helper';

function update(
	nObject: ComponentEntity<any, any>,
	props: any,
	children:any[],
) {
	updateProps(nObject.props, props, {}, false, true);
	nObject.events.updateInProps(props);
	const slots = Object.create(null);
	const { native } = nObject;
	const childNodes = getSlots(
		nObject.iRender,
		children,
		slots,
		Boolean(native),
	);
	setSlots(slots, nObject.slots);
	if (!native) { return; }
	nObject.nativeNodes
		= convert(nObject, childNodes, nObject.nativeNodes);
	if (!nObject.mounted) { return; }
	nObject.requestDraw();
}

function createContext<
	P extends object = object,
	R extends object = object
>(nObject: ComponentEntity<P, R>): Context {
	return initContext({
		slots: nObject.slots,
		get created() { return nObject.created; },
		get parent() { return nObject.parent.exposed; },
		get delivered() { return nObject.parentDelivered; },
		get children() { return nObject.children; },
		get childNodes() { return nObject.childNodes; },
		get emit() { return nObject.emit; },
		refresh(f) { nObject.refresh(f); },
	}, nObject.exposed);
}

/** 初始化渲染 */
function initRender<R extends object = object>(
	nObject: ComponentEntity<any, R>
): { render(): any, nodes: any, stopRender(): void } {
	const {
		component,
		props,
		context,
		entity,
	} = nObject;
	const refresh = (changed: boolean) => changed && nObject.refresh();
	// 初始化执行
	const result = exec(refresh, () => setCurrent(
		() => component(props, context, auxiliary),
		entity,
	), { resultOnly: true });
	if (typeof result === 'function') {
		// 响应式
		const render = monitor(
			refresh,
			() => normalize(nObject, (result as () => NeepNode)()),
		);
		return {
			nodes: render(),
			render,
			stopRender: () => render.stop(),
		};
	}

	const render = monitor(
		refresh,
		() => normalize(nObject, setCurrent(
			() => component(props, context, auxiliary),
			entity,
		)),
	);
	return {
		nodes: exec(
			refresh,
			() => normalize(nObject, result),
			{ resultOnly: true },
		),
		render,
		stopRender: () => render.stop(),
	};
}


export default class ComponentEntity<
	P extends object = object,
	R extends object = object
> extends EntityObject {
	/** 组件函数 */
	readonly component: Component<P, R>;
	/** 组件属性 */
	readonly props: P = encase(Object.create(null));
	/** 组件槽 */
	readonly slots: Slots = encase(Object.create(null));
	/** 结果渲染函数 */
	private readonly _stopRender:() => void;
	/** 原生子代 */
	nativeNodes: (TreeNode | TreeNode[])[] | undefined;
	shadowTree: (MountedNode | MountedNode[])[] = [];
	nativeTree: (MountedNode | MountedNode[])[] = [];
	private readonly _shadow: NativeShadow | undefined;
	/** 组件上下文 */
	readonly context: Context;
	readonly parent: EntityObject;
	/** 结果渲染函数 */
	constructor(
		component: Component<P, R>,
		props: object,
		children: any[],
		parent: EntityObject,
		delivered?: Delivered,
	) {
		super(parent.iRender, parent, delivered, parent.container);
		this.component = component;
		Object.assign(this.config, component[configSymbol]);
		Object.assign(this.components, component[componentsSymbol]);
		Reflect.defineProperty(
			this.exposed,
			'$component',
			{ value: component, enumerable: true, configurable: true },
		);
		// 原生组件
		[this.native, this._shadow] =
			component[typeSymbol] === 'native' &&
			this.iRender.component?.() || [];
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
		refresh(() => update(this, props, children));
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
		refresh(() => update(this, props, children));
	}
	_destroy() {
		if (this._stopRender) {
			this._stopRender();
		}
		this.parent.children.delete(this.exposed);
		destroy(this._nodes);
	}

	/** 刷新 */
	requestDraw() {
		this.container.markDraw(this);
	}
	_draw() {
		const {nativeNodes, iRender, _shadow, native} = this;
		if (!native || !nativeNodes || !_shadow) {
			this.tree = draw(
				iRender,
				this._nodes,
				this.tree,
			);
			return;
		}
		this.shadowTree = draw(
			iRender,
			this._nodes,
			this.shadowTree,
		);
		this.nativeTree = draw(
			iRender,
			nativeNodes,
			this.nativeTree,
		);
	}
	_mount() {
		const {nativeNodes, iRender, _shadow, native, _nodes} = this;
		if (!native || !nativeNodes || !_shadow) {
			this.tree = draw(iRender, _nodes);
			return;
		}
		this.tree = draw(iRender, convert(this, native));
		this.shadowTree = draw(iRender, _nodes);
		for (const it of getNodes(this.shadowTree)) {
			iRender.insert(_shadow, it);
		}
		this.nativeTree = draw(iRender, nativeNodes);
		for (const it of getNodes(this.nativeTree)) {
			iRender.insert(native, it);
		}
	}
	_unmount() {
		const {iRender, nativeTree} = this;
		unmount(iRender, this.tree);
		if (!nativeTree) { return; }
		unmount(iRender, nativeTree);
	}
}
