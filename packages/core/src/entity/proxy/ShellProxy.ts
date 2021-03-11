import {
	MountOptions,
	ShellComponent,
	ShellContext,
	Slots,
	MountedNode,
	Monitored,
	ShellEntity,
} from '../../types';
import BaseProxy from './BaseProxy';
import draw, { unmount } from '../draw';
import CustomComponentProxy from './CustomComponentProxy';
import { isElement } from '../../auxiliary';
import { Fragment } from '../../constant/tags';
import convert from '../convert';
import { monitor } from '../../install/monitorable';
import { init } from '../normalize';
import { NormalizeAuxiliaryObject } from '../normalize';
import { isProduction } from '../../constant/info';
import { runCurrent, runCurrentWithLabel } from '../../extends/current';
import EventEmitter from '../../EventEmitter';
import { createSlotApi, getSlots, setSlots } from '../slot';
import ContainerProxy from './ContainerProxy';
import ComponentProxy from './ComponentProxy';
import { createBy } from '../../extends/with';


function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}

// TODO
export default class ShellProxy<
	T extends ShellComponent<any, any>
> extends CustomComponentProxy<any, T, ShellEntity> {
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }

	props: any;
	childNodes: any[];
	src?: any;

	/** 组件槽 */
	readonly slots: Slots = Object.create(null);
	lastSlots: Record<string | symbol, any[]> | undefined;
	/** 结果渲染函数 */
	protected _render: Monitored<any[], []>;

	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	/** 结果渲染函数 */
	protected readonly _stopRender: () => void;

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
		super(originalTag, tag, props, parent, true);
		this.container = parent.container;
		this.componentRoot = parent.componentRoot;
		this.props = props;
		this.childNodes = children;
		const {slots} = this;
		const {delivered} = this;

		const refresh = (f?: () => void): void => { this.refresh(f); };

		const event = this.events;
		const {contextData} = this;

		const context: ShellContext<any> = {
			by: createBy(this.contextData),
			slot: createSlotApi(slots),
			childNodes: () => this.childNodes,
			emit: event.emit,
		};
		const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
			renderer: this.renderer,
			refresh,
			slotRenderFnList: new WeakMap(),
			delivered,
			// TODO
			simpleParent: undefined,
		};
		const render = monitor(
			changed => changed && this.refresh(),
			() => {
				const props = {...this.props};
				event.updateInProps(props);
				const result = isProduction
					? tag(props, context)
					: isProduction
						? runCurrent(
							contextData,
							undefined,
							tag,
							props,
							context,
						)
						:  runCurrentWithLabel(
							contextData,
							undefined,
							l => this.labels = l,
							tag,
							props,
							context,
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
		this._stopRender = render.stop;
		this._render = render;
		this.created = true;
		this.refresh();
		this._nodes = convert(this, this._render());
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
