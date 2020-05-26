import {
	Exposed, Delivered,
	Entity,
	NativeComponent,
	Hook, Hooks, NeepNode, IRender, Component, MountedNode, TreeNode,
} from '../type';
import { callHook, setHook } from '../hook';
import ContainerEntity from './ContainerEntity';
import convert from './convert';
import { wait } from '../helper/refresh';
import { exec } from '../install';
import EventEmitter from '../EventEmitter';

function createExposed(obj: EntityObject): Exposed {
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

let completeList: (() => void)[] | undefined;
export function setCompleteList(list?: (() => void)[]): void {
	completeList = list;
}
export function complete(it: () => void): void {
	if (!completeList) {
		it();
	} else {
		completeList.push(it);
	}
}

function createEntity(obj: EntityObject): Entity {
	const cfg: { [K in keyof Entity]-?:
		{ configurable: true, value: Entity[K], writable?: boolean }
		| { configurable: true, get(): Entity[K] }
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
		$_valueIndex: { configurable: true, value: 0, writable: true },
		$_values: { configurable: true, value: [] },
		$_serviceIndex: { configurable: true, value: 0, writable: true },
		$_services: { configurable: true, value: [] },
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
		refresh: { configurable: true, value: obj.refresh.bind(obj) },
		on: { configurable: true, value: obj.on },
		emit: { configurable: true, value: obj.emit },
		config: { configurable: true, value: obj.config },
	};
	const entity: Entity = Object.create(null, cfg);
	return entity;
}

export default class EntityObject {
	readonly events = new EventEmitter();
	readonly emit = this.events.emit;
	readonly on = this.events.on;
	readonly eventCancelHandles = new Set<() => void>();
	readonly iRender: IRender;
	readonly components: Record<string, Component> = Object.create(null);
	readonly config: Record<string, any> = Object.create(null);
	/** 接受到的呈递值 */
	readonly parentDelivered: Delivered;
	/** 向后代呈递的值 */
	readonly delivered: Delivered;
	/** 组件暴露值 */
	readonly exposed: Exposed = createExposed(this);
	/** 组件实体 */
	readonly entity: Entity = createEntity(this);
	/** 父组件 */
	parent?: EntityObject;
	/** 原生组件 */
	native: NativeComponent | undefined;
	/** 状态 */
	created: boolean = false;
	destroyed: boolean = false;
	mounted: boolean = false;
	unmounted: boolean = false;
	/**  子组件的暴露值 */
	readonly children: Set<Exposed> = new Set();
	/** The subtree mounted on the parent node */
	tree: (MountedNode | MountedNode[])[] = [];
	readonly container: ContainerEntity;
	constructor(
		iRender: IRender,
		parent?: EntityObject,
		delivered: Delivered = parent?.delivered || Object.create(null),
		container?: ContainerEntity,
	) {
		this.iRender = iRender;
		this.parentDelivered = delivered;
		this.delivered = Object.create(delivered);
		if (parent) {
			this.parent = parent;
		}
		this.container = container || this as any as ContainerEntity;
	}
	/** 结果渲染函数 */
	protected _render: () => NeepNode[] = () => [];

	get canRefresh(): boolean {
		if (wait(this)) { return false; }
		return !this._delayedRefresh;
	}
	protected get needRefresh(): boolean {
		if (wait(this)) { return false; }
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
	protected requestDraw(): void { }
	async asyncRefresh<T>(f: () => PromiseLike<T> | T): Promise<T> {
		try {
			this._delayedRefresh++;
			return await f();
		} finally {
			this._delayedRefresh--;
			this.refresh();
		}
	}
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
	refresh<T>(
		f?: () => PromiseLike<T> | T,
		async?: boolean,
	): PromiseLike<T> | T | undefined {
		if (typeof f === 'function') {
			if (async) { return this.asyncRefresh(f); }
			try {
				this._delayedRefresh++;
				return f();
			} finally {
				this._delayedRefresh--;
				if (this._delayedRefresh <= 0) {
					this.refresh();
				}
			}
		}
		if (this.destroyed) { return; }
		this._needRefresh = true;
		if (!this.created) { return; }

		if (this._refreshing) { return; }
		this._refreshing = true;

		let nodes: NeepNode[] | undefined;
		while (this.needRefresh) {
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
		this.requestDraw();
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
	protected _destroy(): void { }
	destroy(): void {
		if (this.__executed_destroy) { return; }
		this.__executed_destroy = true;
		this.callHook('beforeDestroy');
		this._destroy();
		this.callHook('destroyed');
		this.destroyed = true;
	}
	protected _mount(): void { }
	mount(): void {
		if (this.__executed_destroy) { return; }
		if (this.__executed_mount) { return; }
		this.__executed_mount = true;
		this.callHook('beforeMount');
		const result = exec(
			c => c && this.requestDraw(),
			() => {
				this._mount();
				this.mounted = true;
			},
		);
		this._cancelDrawMonitor = result.stop;
		complete(() => this.callHook('mounted'));
	}
	protected _unmount(): void { }
	unmount(): void {
		if (!this.mounted) { return; }
		if (this.__executed_mounted) { return; }
		this.__executed_mounted = true;
		this.callHook('beforeUnmount');
		this._unmount();
		this.callHook('unmounted');
		this.unmounted = true;
	}
	_draw(): void {}
	_cancelDrawMonitor?: () => void;
	draw(): void {
		if (this.__executed_destroy) { return; }
		if (this._cancelDrawMonitor) {
			this._cancelDrawMonitor();
		}
		this.callHook('beforeDraw');
		const result = exec(
			c => c && this.requestDraw(),
			() => this._draw(),
		);
		this._cancelDrawMonitor = result.stop;
		complete(() => this.callHook('drawn'));
	}
}
