import {
	StandardComponent,
	Slots,
	TreeNodeList,
	ComponentEntity,
	Hook,
	Emit,
	On,
	RenderComponent,
	ComponentContext,
} from '../../types';
import {
	componentsSymbol,
	propsSymbol,
} from '../../constant/symbols';
import { postpone, createObject } from '../../install/monitorable';
import delayRefresh from '../../extends/delayRefresh';
import convert from '../convert';
import { createSlotApi, getSlots, setSlots } from '../slot';

import BaseProxy from './BaseProxy';
import { callHook, setHook } from '../../extends/hook';
import EventEmitter from '../../EventEmitter';
import ContainerProxy from './ContainerProxy';
import CustomComponentProxy from './CustomComponentProxy';
import { createBy } from '../../extends/with';

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
		data: { configurable: true, value: obj.data },
		exposed: { configurable: true, get: () => obj.exposed },
		parent: { configurable: true, value: obj.parentComponentProxy?.entity },
		component: { configurable: true, value: obj.tag },
		created: { configurable: true, get: () => obj.created },
		destroyed: { configurable: true, get: () => obj.destroyed },
		mounted: { configurable: true, get: () => obj.mounted },
		unmounted: { configurable: true, get: () => obj.unmounted },
		callHook: {
			configurable: true,
			value(h: string) { callHook(h, obj.contextData); },
		},
		setHook: {
			configurable: true,
			value(id: string, hook: Hook) { return setHook(id, hook, obj.contextData); },
		},
		on: { configurable: true, value: events.on },
		emit: { configurable: true, value: events.emit },
	};
	const entity: ComponentEntity<any> = Object.create(null, cfg);
	return entity;
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
	if (proxy.propsDefined) {
		proxy.propsDefined.forEach(k => newKeys.add(k));
		for (const k of Object.keys(propsObj)) {
			if (filter(k) && !newKeys.has(k)) {
				delete propsObj[k as keyof TProps];
			}
		}
		for (const k of newKeys) { propsObj[k as keyof TProps] = props[k]; }
	} else {
		let needRefresh = false;
		for (const k of Object.keys(propsObj)) {
			if (filter(k) && !newKeys.has(k)) {
				needRefresh = true;
				delete propsObj[k as keyof TProps];
			}
		}
		for (const k of newKeys) {
			if (k in propsObj && [k as keyof TProps] === props[k]) { continue; }
			propsObj[k as keyof TProps] = props[k];
			needRefresh = true;
		}
		if (needRefresh) {
			proxy.refresh();
		}
	}

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
> extends CustomComponentProxy<TExpose, C, ComponentEntity<C>> {


	isNative: boolean = false;
	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	readonly emit: Emit<Record<string, any>>;
	readonly on: On<TExpose | undefined, Record<string, any>>;

	readonly components: Record<string, StandardComponent<any, any, any>>
	= Object.create(null);

	/** 组件属性 */
	readonly props: TProps;
	/** 组件属性定义 */
	readonly propsDefined?: (keyof TProps & string)[];
	/** 组件槽 */
	readonly slots: Slots = Object.create(null);
	lastSlots: Record<string | symbol, any[]> | undefined;

	/** 原生子代 */
	nativeNodes: TreeNodeList | undefined;


	callHook(id: string): void { callHook(id, this.contextData); }


	/** 结果渲染函数 */
	protected _render: () => any[];
	/** 结果渲染函数 */
	protected readonly _stopRender: () => void;

	protected abstract _init(): void;
	protected abstract _initRender(context: ComponentContext<any, any>): IRender;

	/** 结果渲染函数 */
	constructor(
		originalTag: any,
		component: C,
		props: object,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(originalTag, component, props, parent, false);
		this.container = parent.container;
		this.componentRoot = this;
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
			this.props = Object.create(null);
		}
		this._init();
		// 初始化钩子
		this.callHook('beforeCreate');
		// 更新属性
		this._update(props, children);

		const context: ComponentContext<any, any> = {
			by: createBy(this.contextData),
			slot: createSlotApi(this.slots),
			expose: t => this.setExposed(t),
			childNodes: () => this.childNodes,
			emit: this.emit,
		};
		// 获取渲染函数及初始渲染
		const { render, nodes, stopRender } = this._initRender(context);
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
		delayRefresh(() => postpone(() => update(this, props, children)));
	}

	childNodes: any[] = [];
	/** 刷新 */
	requestDraw(): void {
		this.container.markDraw(this);
	}
}
