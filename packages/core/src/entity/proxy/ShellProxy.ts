import {
	MountOptions,
	TreeNodeList,
	ShellComponent,
	DeliverComponent,
	ShellContext,
	Slots,
	MountedNode,
	Monitored,
	ShellEntity,
} from '../../type';
import BaseProxy from './BaseProxy';
import draw, { unmount } from '../draw';
import RefProxy from './RefProxy';
import { isElement, Fragment } from '../../auxiliary';
import convert, { destroy } from '../convert';
import { monitor } from '../../install/monitorable';
import { wait } from '../../extends/refresh';
import { init, NormalizeAuxiliaryObject } from '../normalize';
import { isProduction } from '../../constant';
import { runShell } from '../../extends/current';
import { initContext } from '../../extends/context';
import getDelivered from '../getDelivered';
import EventEmitter from '../../EventEmitter';
import { createSlotApi, getSlots, setSlots } from '../slot';
import ContainerProxy from './ContainerProxy';
import ComponentProxy from './ComponentProxy';


function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}

// TODO
export default class ShellProxy<
	T extends ShellComponent<any, any>
> extends RefProxy<any, T, ShellEntity> {
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }

	props: any;
	childNodes: any[];
	src?: any;

	/** 组件槽 */
	readonly slots: Slots = Object.create(null);
	lastSlots: Record<string | symbol, any[]> | undefined;
	/** 结果渲染函数 */
	private __render: Monitored<any[], []>;

	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;


	requestDraw(): void {
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		this.container.markDraw(this);
	}
	callHook(id: string): void {
	}

	createEntity(events: EventEmitter<any>): ShellEntity {
		const cfg: { [K in keyof ShellEntity]-?:
			{ configurable: true, value: ShellEntity[K], writable?: boolean }
			| { configurable: true, get(): ShellEntity[K] }
		} = {
			data: { configurable: true, value: this.data },
			exposed: { configurable: true, value: undefined },
			on: { configurable: true, value: events.on },
			emit: { configurable: true, value: events.emit },
		};
		const entity: ShellEntity = Object.create(null, cfg);
		return entity;
	}
	constructor(
		originalTag: any,
		tag: T,
		props: object,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(
			parent.renderer,
			originalTag,
			tag,
			props,
			parent,
		);
		this.container = parent.container;
		this.componentRoot = parent.componentRoot;
		this.props = props;
		this.childNodes = children;
		const {slots} = this;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _this = this;
		const {delivered} = this;

		const refresh = (f?: () => void): void => { this.refresh(f); };

		const event = this.events;

		const context: ShellContext<any> = initContext({
			isShell: true,
			delivered<T>(deliver: DeliverComponent<T>): T {
				return getDelivered(delivered, deliver);
			},
			slot: createSlotApi(slots),
			refresh,
			get childNodes() {
				return _this.childNodes;
			},
			emit: event.emit,
		});
		const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
			renderer: this.renderer,
			refresh,
			slotRenderFnList: new WeakMap(),
			delivered: this.delivered,
			// TODO
			simpleParent: undefined,
		};
		this.__render = monitor(
			changed => changed && this.refresh(),
			() => {
				const props = {...this.props};
				event.updateInProps(props);
				const result = isProduction
					? tag(props, context)
					: runShell(
						l => this.labels = l,
						() => tag(props, context),
					);
				return init(
					normalizeAuxiliaryObject,
					getNodeArray(result),
					slots,
					[],
					false,
					false,
				);
			},
		);
		this.created = true;
		this.refresh();
		this._nodes = convert(this, this.__render());
	}

	/** 是否为刷新中 */
	private __refreshing = false;
	/** 是否需要继续刷新 */
	private __needRefresh = false;
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
				if (this.__delayedRefresh <= 0) {
					this.refresh();
				}
			}
		}
		if (this.destroyed) { return; }
		this.__needRefresh = true;
		if (!this.created) { return; }

		if (this.__refreshing) { return; }
		this.__refreshing = true;

		let nodes: any[] | undefined;
		while (this.__needRefresh && !wait(this)) {
			this.__needRefresh = false;
			nodes = this.__render();
			if (this.destroyed) { return; }
		}
		this.__refreshing = false;
		if (!nodes) { return; }
		this._nodes = convert(this, nodes, this._nodes);
		if (wait(this)) { return; }
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		if (this.unmounted) { return; }
		this.requestDraw();
	}

	_update(props: object, children: any[]): void {
		this.props = props;

		const slots = Object.create(null);
		getSlots(this.renderer, children, slots);
		setSlots(slots, this.slots, this.lastSlots);
		this.lastSlots = slots;
		this.childNodes = children;
		this.refresh();
	}
	_destroy(): void {
		this.__render.stop();
		destroy(this._nodes);
	}
	_mount(mountOptions: MountOptions): void {
		this.tree = draw(
			this.renderer,
			mountOptions,
			this._nodes,
		);
	}
	_redraw(mountOptions: MountOptions): void {
		this.tree = draw(
			this.renderer,
			mountOptions,
			this._nodes,
			this.tree,
		);
	}
	_unmount(): void {
		unmount(this.renderer, this.tree);
	}
}
