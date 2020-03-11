import {
	IRender,
	MountProps,
	NativeNode,
	NativeContainer,
} from '../type';
import { Tags } from '../auxiliary';
import { getRender } from '../install';
import { createMountedNode } from './id';
import Entity from './Entity';
import convert, { destroy } from './convert';
import draw, { unmount, getNodes, MountedNode } from './draw';
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
	/** 组件树结构 */
	content: (MountedNode | MountedNode[])[] = [];
	_node: NativeNode | null = null;
	_container: NativeContainer | null = null;
	readonly rootContainer: Container = this;
	constructor(
		props: MountProps,
		children: any[],
		parent?: NeepObject,
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
		this._render = () => children;
		this._nodes = convert(this, children);
		// 初始化钩子
		this.callHook('inited');
		this.inited = true;
	}
	setChildren(children: any[]): void {
		if (this.destroyed) { return; }
		this._render = () => children;
		this.refresh();
	}
	setProps(props: MountProps): void {
		if (this.destroyed) { return; }
		this.props = props;
		const { parent, iRender } = this;
		const { type } = props;
		if (parent && !type) {
			this.iRender = parent.container.iRender;
		} else {
			this.iRender = getRender(type);
		}
		if (!this.mounted) { return; }
		if (parent && iRender !== this.iRender) {
			parent.container.markDraw(this);
		}
	}
	/** 更新属性及子代 */
	update(props: MountProps, children: any[]): void {
		this.setProps(props);
		this.setChildren(children);
	}
	_refresh() {
		this.markDraw(this);
	}
	_mount() {
		const { props, parent, iRender } = this;
		const content = draw(this.container.iRender, this._nodes);
		this.content = content;
		const [container, node]
			= iRender.mount(props, parent?.container?.iRender);
		for (const it of getNodes(content)) {
			iRender.insert(container, it);
		}
		this.tree = [createMountedNode({
			tag: Tags.Value,
			component: undefined,
			node,
			value: node,
			children: [],
		})];
		this._node = node;
		this._container = container;
	}
	_destroy() {
		destroy(this.content);
	}
	_unmount() {
		const { parent, iRender } = this;
		if (parent) {
			unmount(parent.container.iRender, this.tree);
		}
		iRender.unmount(
			this._container!,
			this._node!,
			Boolean(parent),
		);
		unmount(this.iRender, this.content);
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
		this.content = draw(
			this.container.iRender,
			this._nodes,
			this.content,
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
			!this._needDraw && !this._awaitDraw.size || this.destroyed,
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
