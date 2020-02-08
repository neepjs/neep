import {
	MountedNode, TreeNode,
	IRender, Native,
	MountProps,
} from './type';
import Entity from './Entity';
import convert, { destroy } from './convert';
import draw, { unmount, getNodes } from './draw';
import { Tags } from './auxiliary';
import { getRender } from './install';
import { createMountedNode } from './dev/id';
import NeepObject from './Object';


let awaitDraw = new Set<Container>();
let requested = false;
function markDraw(c: Container) {
	awaitDraw.add(c);
	if (requested) { return; }
	requested = true;
	window.requestAnimationFrame(() => {
		requested = false;
		const list = [...awaitDraw];
		awaitDraw.clear();
		list.map(c => c.drawAll());
	});
}

export default class Container extends NeepObject {
	props: MountProps;
	iRender: IRender;
	readonly native = false;
	/** 渲染结果 */
	private _nodes: (TreeNode | TreeNode[])[];
	/** 组件树结构 */
	private _content: (MountedNode | MountedNode[])[] = [];
	get content() {
		return this._content;
	}
	parent?: Entity<any, any> | Container;
	_node: Native.Node | null = null;
	_container: Native.Container | null = null;
	readonly container = this;
	readonly rootContainer: Container = this;
	get isDifferent(): boolean {
		const { parent } = this;
		if (!parent) { return true; }
		return this.iRender !== parent.container.iRender;
	}

	constructor(
		props: MountProps,
		children: any[],
		parent?: Entity<any, any> | Container,
	) {
		super();
		this.props = props;
		this.parent = parent;
		if (parent) {
			this.rootContainer = parent.container.rootContainer;
		}
		const { type } = props;
		if (parent && !type) {
			this.iRender = parent.container.iRender;
		} else {
			this.iRender = getRender(type);
		}
		// 初始化钩子
		this.callHook('beforeInit');
		this._nodes = convert(this, children);
		// 初始化钩子
		this.callHook('inited');
		this._inited = true;
	}
	/** 更新属性及子代 */
	update(
		props: MountProps,
		children: any[],
	) {
		if (this.destroyed) { return this; }
		this.props = props;
		const { parent, iRender } = this;
		const { type } = props;
		if (parent && !type) {
			this.iRender = parent.container.iRender;
		} else {
			this.iRender = getRender(type);
		}
		this._nodes = convert(this, children, this._nodes);
		if (!this.mounted) { return; }
		if (parent && iRender !== this.iRender) {
			parent.container.markDraw(this);
		}
		this.markDraw(this);
	}
	private _unmount = true;
	mount() {
		if (this.destroyed) { return; }
		if (this.mounted) { return; }
		if (!this._unmount) { return; }
		this._unmount = true;
		this.callHook('beforeMount');
		const { props, parent, iRender } = this;
		const content = draw(this.container.iRender, this._nodes);
		this._content = content;
		const [container, node]
			= iRender.mount(props, parent?.container?.iRender);
		for (const it of getNodes(content)) {
			iRender.insert(container, it);
		}
		this._tree = [createMountedNode({
			tag: Tags.Value,
			component: undefined,
			node,
			value: node,
			children: [],
		})];
		this._node = node;
		this._container = container;
		this.callHook('mounted');
		this._mounted = true;
	}
	destroy() {
		if (this.destroyed) { return; }
		this._destroyed = true;
		this.callHook('beforeDestroy');
		destroy(this._content);
		this.callHook('destroyed');
	}
	unmount() {
		const { parent, iRender } = this;
		if (parent) {
			unmount(parent.container.iRender, this._tree);
		}
		iRender.unmount(
			this._container!,
			this._node!,
			Boolean(parent),
		);
		unmount(this.iRender, this._content);
	}
	draw() {
		// this.callHook('beforeUpdate');
		// TODO: 调用销毁
		// TODO: 调用构建
		// this.callHook('updated');
	}
	drawSelf() {
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		this.callHook('beforeUpdate');
		this._content = draw(
			this.container.iRender,
			this._nodes,
			this._content,
		);
		this.callHook('updated');
		if (!this._needDraw) { return; }
		this._needDraw = false;
	}
	/** 等待重画的项目 */
	private _awaitDraw = new Set<Entity<any, any> | Container>();
	/** 自身是否需要重绘 */
	private _needDraw = false;
	/** 标记需要绘制的元素 */
	markDraw(
		nObject: Entity<any, any> | Container,
		remove = false,
	) {
		if (nObject === this) {
			this._needDraw = !remove;
		} else if (remove) {
			this._awaitDraw.delete(nObject);
		} else {
			this._awaitDraw.add(nObject);
		}
		this.rootContainer.markDrawContainer(
			this,
			!this._needDraw && !this._awaitDraw.size || this._destroyed,
		);
	}
	drawContainer() {
		const {
			_node: node,
			_container: container,
			_awaitDraw: awaitDraw,
		} = this;
		if (!node || !container) { return; }
		this.callHook('beforeDraw');
		const needDraw = this._needDraw;
		this._needDraw = false;
		const list = [...awaitDraw];
		awaitDraw.clear();
		if (needDraw) { this.drawSelf(); }
		list.map(c => c.draw());
		this.iRender.darw(container, node);
		this.callHook('drawed');
	}
	private _containers = new Set<Container>();
	markDrawContainer(
		container: Container,
		remove = false,
	) {
		if (remove) {
			this._containers.delete(container);
		} else {
			this._containers.add(container);
		}
		markDraw(this);
	}
	drawAll() {
		const containers = this._containers;
		if (!containers.size) { return; }
		this.callHook('beforeDrawAll');
		const list = [...containers];
		list.map(c => c.drawContainer());
		this.callHook('drawedAll');
	}
}
