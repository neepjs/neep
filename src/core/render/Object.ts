import {
	Exposed, Delivered,
	Entity as ComponentEntity,
	NativeComponent,
	Hook, Hooks, NeepNode, IRender,
} from '../type';
import { callHook, setHook } from '../hook';
import { MountedNode } from './draw';
import Container from './Container';
import convert, { TreeNode } from './convert';

function createExposed(obj: NeepObject): Exposed {
	const cfg: { [K in Exclude<keyof Exposed, '$label'>]-?:
		{ configurable: true, value: Exposed[K] }
		| { configurable: true, get(): Exposed[K] }
	} = {
		$parent: { configurable: true, get: () => obj.parent?.exposed },
		$component: { configurable: true, value: null },
		$isContainer: { configurable: true, value: false },
		$created: { configurable: true, get: () => obj.created },
		$destroyed: { configurable: true, get: () => obj.destroyed },
		$mounted: { configurable: true, get: () => obj.mounted },
		$unmounted: { configurable: true, get: () => obj.unmounted },
	};
	const exposed: Exposed = Object.create(null, cfg);
	return exposed;
}

function createEntity(obj: NeepObject): ComponentEntity {
	const cfg: { [K in keyof ComponentEntity]-?:
		{ configurable: true, value: ComponentEntity[K] }
		| { configurable: true, get(): ComponentEntity[K] }
	} = {
		exposed: { configurable: true, get: () => obj.exposed },
		delivered: { configurable: true, get: () => obj.delivered },
		parent: { configurable: true, get: () => obj.parent?.entity },
		component: { configurable: true, value: null },
		isContainer: { configurable: true, value: false },
		created: { configurable: true, get: () => obj.created },
		destroyed: { configurable: true, get: () => obj.destroyed },
		mounted: { configurable: true, get: () => obj.mounted },
		unmounted: { configurable: true, get: () => obj.unmounted },
		$_hooks: { configurable: true, value: Object.create(null) },
		callHook: {
			configurable: true,
			value(h: string) { callHook(h, entity); },
		},
		setHook: {
			configurable: true,
			value(id: string, hook: Hook) {
				return setHook(id, hook, entity);
			},
		},
		refresh: {
			configurable: true,
			value(f?:() => void) { obj.refresh(f); },
		},
	};
	const entity: ComponentEntity = Object.create(null, cfg);
	return entity;
}

export default class NeepObject {
	readonly iRender: IRender;
	/** TODO: 向后代呈递的值 */
	readonly parentDelivered: Delivered;
	/** TODO: 向后代呈递的值 */
	readonly delivered: Delivered;
	/** 组件暴露值 */
	readonly exposed: Exposed = createExposed(this);
	/** 组件实体 */
	readonly entity: ComponentEntity = createEntity(this);
	/** 父组件 */
	parent?: NeepObject;
	/** 原生组件 */
	native: NativeComponent | null = null;
	/** 状态 */
	created: boolean = false;
	destroyed: boolean = false;
	mounted: boolean = false;
	unmounted: boolean = false;
	/**  子组件的暴露值 */
	readonly children: Set<Exposed> = new Set();
	/** The subtree mounted on the parent node */
	tree: (MountedNode | MountedNode[])[] = [];
	readonly container: Container;
	constructor(
		iRender: IRender,
		parent?: NeepObject,
		delivered: Delivered = parent?.delivered || Object.create(null),
		container?: Container,
	) {
		this.iRender = iRender;
		this.parentDelivered = delivered;
		this.delivered = Object.create(delivered);
		if (parent) {
			this.parent = parent;
		}
		this.container = container || this as any as Container;
	}
	/** 结果渲染函数 */
	protected _render: () => NeepNode[] = () => [];

	get canRefresh(): boolean {
		return !this._delayedRefresh;
	}
	protected get needRefresh(): boolean {
		if (this._delayedRefresh) { return false; }
		const needRefresh = this._needRefresh;
		this._needRefresh = false;
		return needRefresh;
	}
	/** 是否需要继续刷新 */
	protected _needRefresh = false;
	private _delayedRefresh = 0;
	/** 是否为刷新中 */
	private _refreshing = false;
	/** 渲染结果 */
	protected _nodes: (TreeNode | TreeNode[])[] = [];
	protected _refresh() { }
	refresh(f?: () => void) {
		if (typeof f === 'function') {
			try {
				this._delayedRefresh++;
				f();
			} finally {
				this._delayedRefresh--;
				if (this._delayedRefresh <= 0) {
					this.refresh();
				}
			}
			return;
		}
		if (this.destroyed) { return; }
		if (!this.created) { return; }
		this._needRefresh = true;

		if (this._refreshing) { return; }
		this._refreshing = true;

		let nodes: NeepNode[] | undefined;
		while(this.needRefresh) {
			nodes = this._render();
			if (this.destroyed) { return; }
		}
		this._refreshing = false;
		if (!this.canRefresh) { return; }
		if (!nodes) { return; }

		this._nodes = convert(this, nodes, this._nodes);
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		if (this.unmounted) { return; }
		this._refresh();
	}
	callHook<H extends Hooks>(id: H): void;
	callHook(id: string): void;
	callHook(id: string): void {
		callHook(id, this.entity);
	}

	childNodes: any[] = [];
	/** 更新属性及子代 */
	protected _update(props: object, children: any[]): void {
		this.childNodes = children;
	}
	/** 更新属性及子代 */
	update(props: object, children: any[]): void {
		this._update(props, children);
	}


	private __executed_destroy = false;
	private __executed_mount = false;
	private __executed_mounted = false;
	protected _destroy() { }
	destroy() {
		if (this.__executed_destroy) { return; }
		this.__executed_destroy = true;
		this.callHook('beforeDestroy');
		this._destroy();
		this.callHook('destroyed');
		this.destroyed = true;
	}
	protected _mount() { }
	mount() {
		if (this.__executed_destroy) { return; }
		if (this.__executed_mount) { return; }
		this.__executed_mount = true;
		this.callHook('beforeMount');
		this._mount();
		this.callHook('mounted');
		this.mounted = true;
	}
	protected _unmount() { }
	unmount() {
		if (!this.mounted) { return; }
		if (this.__executed_mounted) { return; }
		this.__executed_mounted = true;
		this.callHook('beforeUnmount');
		this._unmount();
		this.callHook('unmounted');
		this.unmounted = true;
	}
	_draw() {}
	draw() {
		if (this.__executed_destroy) { return; }
		this.callHook('beforeUpdate');
		this._draw();
		this.callHook('updated');
	}
}
