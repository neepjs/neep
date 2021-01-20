import {
	StandardComponent,
	Slots,
	TreeNodeList,
	ComponentEntity,
	Hook,
	Emit,
	On,
	RenderComponent,
} from '../../type';
import {
	componentsSymbol,
	objectTypeSymbol,
	objectTypeSymbolHookEntity,
	propsSymbol,
} from '../../symbols';
import { encase, postpone, createObject } from '../../install/monitorable';
import refresh, { wait } from '../../extends/refresh';
import convert, { destroy } from '../convert';
import { getSlots, setSlots } from '../slot';

import BaseProxy from './BaseProxy';
import { initEntity } from '../../extends/entity';
import { callHook, setHook } from '../../hook';
import EventEmitter from '../../EventEmitter';
import ContainerProxy from './ContainerProxy';
import RefProxy from './RefProxy';

export interface IRender {
	render(): any[];
	nodes: any[];
	stopRender(): void;
}

function createEntity(
	obj: ComponentProxy<any, any, any, any>,
	events: EventEmitter<any>,
): ComponentEntity<any> {
	const cfg: { [K in Exclude<keyof ComponentEntity<any>, '$_label'>]-?:
		{ configurable: true, value: ComponentEntity<any>[K], writable?: boolean }
		| { configurable: true, get(): ComponentEntity<any>[K] }
	} = {
		[objectTypeSymbol]: { configurable: true, value: objectTypeSymbolHookEntity },
		data: { configurable: true, value: obj.data },
		exposed: { configurable: true, get: () => obj.exposed },
		parent: { configurable: true, value: obj.parentComponentProxy?.entity },
		component: { configurable: true, value: obj.tag },
		created: { configurable: true, get: () => obj.created },
		destroyed: { configurable: true, get: () => obj.destroyed },
		mounted: { configurable: true, get: () => obj.mounted },
		unmounted: { configurable: true, get: () => obj.unmounted },
		$_hooks: { configurable: true, value: Object.create(null) },
		$_useHookValues: { configurable: true, value: [] },
		callHook: {
			configurable: true,
			value(h: string) { callHook(h, entity); },
		},
		setHook: {
			configurable: true,
			value(id: string, hook: Hook<any>) { return setHook(id, hook, entity); },
		},
		refresh: { configurable: true, value: obj.refresh.bind(obj) },
		on: { configurable: true, value: events.on },
		emit: { configurable: true, value: events.emit },
	};
	const entity: ComponentEntity<any> = Object.create(null, cfg);
	return initEntity(entity);
}

const disabledKey = new Set([
	':', '@', '#', '*',
	'!', '%', '^', '~',
	'&', '?', '+', '.',
	'(', ')', '[', ']', '{', '}', '<', '>',
]);
function filter(k: string | number | symbol): boolean {
	if (typeof k !== 'string') { return true; }
	if (disabledKey.has(k[0])) { return false; }
	if (k.substr(0, 2) === 'n:') { return false; }
	if (k.substr(0, 3) === 'on:') { return false; }
	return true;
}

function update<TProps extends object>(
	proxy: ComponentProxy<TProps, any, any, any>,
	props: any,
	children: any[],
): void {
	const {props: propsObj, isNative} = proxy;
	const newKeys = new Set(Object.keys(props).filter(filter));
	proxy.propsDefined.forEach(k => newKeys.add(k));
	for (const k of Object.keys(propsObj)) {
		if (filter(k) && !newKeys.has(k)) {
			delete propsObj[k as keyof TProps];
		}
	}
	for (const k of newKeys) { propsObj[k as keyof TProps] = props[k]; }

	proxy.events.updateInProps(props);
	const slots = Object.create(null);
	const childNodes = getSlots(proxy.renderer, children, slots, isNative);
	setSlots(slots, proxy.slots, proxy.lastSlots);
	proxy.lastSlots = slots;
	if (!isNative) { return; }
	proxy.nativeNodes = convert(proxy, childNodes, proxy.nativeNodes);
	if (!proxy.mounted) { return; }
	proxy.requestDraw();
}


export default abstract class ComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends StandardComponent<TProps, TExpose, TEmit>
	| RenderComponent<TProps, TExpose, TEmit>,
> extends RefProxy<TExpose, C, ComponentEntity<C>> {

	isNative: boolean = false;
	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	/** 子组件 */
	readonly children: Set<ComponentProxy<any, any, any, any>> = new Set();

	readonly emit: Emit<Record<string, any>>;
	readonly on: On<TExpose | undefined, Record<string, any>>;

	readonly components: Record<string, StandardComponent<any, any, any>>
	= Object.create(null);

	/** 组件属性 */
	readonly props: TProps;
	/** 组件属性定义 */
	readonly propsDefined: (keyof TProps & string)[];
	/** 组件槽 */
	readonly slots: Slots = Object.create(null);
	lastSlots: Record<string | symbol, any[]> | undefined;

	/** 原生子代 */
	nativeNodes: TreeNodeList | undefined;

	/** 父组件代理 */
	readonly parentComponentProxy?: ComponentProxy<any, any, any, any>;

	callHook(id: string): void { callHook(id, this.entity); }


	/** 结果渲染函数 */
	protected _render: () => any[];
	/** 结果渲染函数 */
	protected readonly _stopRender: () => void;

	protected abstract _init(): void;
	protected abstract _initRender(): IRender;

	/** 结果渲染函数 */
	constructor(
		originalTag: any,
		component: C,
		props: object,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(parent.renderer, originalTag, component, props, parent);
		this.container = parent.container;
		this.componentRoot = this;
		this.parentComponentProxy = parent.componentRoot;
		const {events} = this;
		this.emit = events.emit;
		this.on = events.on;

		Object.assign(this.components, component[componentsSymbol]);
		// 属性定义及属性
		const propsDefined = component[propsSymbol];
		if (Array.isArray(propsDefined)) {
			this.propsDefined = propsDefined as (keyof TProps & string)[];
			this.props = createObject(propsDefined, null);
		} else {
			this.propsDefined = [];
			this.props = encase(Object.create(null));
		}
		this._init();
		// 初始化钩子
		this.callHook('beforeCreate');
		// 更新属性
		this._update(props, children);
		// 获取渲染函数及初始渲染
		const { render, nodes, stopRender } = this._initRender();
		this._render = render;
		this._stopRender = stopRender;
		this._nodes = convert(this, nodes);
		// 初始化钩子
		this.callHook('created');
		this.created = true;
		if (this.needRefresh) { this.refresh(); }
	}
	createEntity(events: EventEmitter<any>): ComponentEntity<C> {
		return createEntity(this, events);
	}
	/** 更新属性及子代 */
	_update(props: object, children: any[]): void {
		if (this.destroyed) { return; }
		this.childNodes = children;
		refresh(() => postpone(() => update(this, props, children)));
	}
	_destroy(): void {
		this._stopRender();
		destroy(this._nodes);
	}

	childNodes: any[] = [];
	/** 是否为刷新中 */
	private __refreshing = false;
	/** 是否需要继续刷新 */
	private __needRefresh = false;
	get needRefresh(): boolean { return this.__needRefresh; }
	/** 延时刷新计数 */
	private __delayedRefresh = 0;

	/** 渲染结果 */
	protected _nodes: TreeNodeList = [];

	refresh(): void;
	refresh<T>(f: () => T): T;
	refresh<T>(f?: () =>  T): T | void;
	refresh<T>(f?: () =>  T): T | void {
		if (typeof f === 'function') {
			try {
				this.__delayedRefresh++;
				return f();
			} finally {
				this.__delayedRefresh--;
				if (this.__delayedRefresh <= 0) { this.refresh(); }
			}
		}
		if (this.destroyed) { return; }
		this.__needRefresh = true;
		if (!this.created) { return; }

		if (this.__refreshing) { return; }
		this.__refreshing = true;

		let nodes: any[] | undefined;
		for (;;) {
			if (wait(this)) { break; }
			if (this.__delayedRefresh) { break; }
			if (!this.__needRefresh) { break; }
			this.__needRefresh = false;
			nodes = this._render();
			if (this.destroyed) { return; }
		}
		this.__refreshing = false;
		if (wait(this)) { return; }
		if (this.__delayedRefresh) { return; }
		if (!nodes) { return; }

		this._nodes = convert(this, nodes, this._nodes);
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		if (this.unmounted) { return; }
		this.requestDraw();
	}
	/** 刷新 */
	requestDraw(): void {
		this.container.markDraw(this);
	}
}
