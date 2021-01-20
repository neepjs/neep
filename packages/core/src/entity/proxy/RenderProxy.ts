import {
	MountOptions,
	TreeNodeList,
	Slots,
	MountedNode,
	Monitored,
} from '../../type';
import BaseProxy from './BaseProxy';
import draw, { unmount } from '../draw';
import NodeProxy from './NodeProxy';
import { isElement, Fragment, Render } from '../../auxiliary';
import convert, { destroy } from '../convert';
import { monitor } from '../../install/monitorable';
import { wait } from '../../extends/refresh';
import { init, NormalizeAuxiliaryObject } from '../normalize';


function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}


export default class RenderProxy extends NodeProxy<typeof Render> {
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }

	childNodes: any[];

	/** 结果渲染函数 */
	private __render: Monitored<any[], []>;
	constructor(
		props: object,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(Render, Render, props, children, parent);
		this.childNodes = children;

		const refresh = (f?: () => void): void => { this.refresh(f); };

		const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
			renderer: this.renderer,
			refresh,
			slotRenderFnList: new WeakMap(),
			delivered: this.delivered,
			// TODO
			simpleParent: undefined,
		};
		const slots: Slots = Object.create(null);
		const initChildNodes = (result: any): any => init(
			normalizeAuxiliaryObject,
			getNodeArray(result),
			slots,
			[],
			false,
			true,
		);
		this.__render = monitor(
			changed => changed && this.refresh(),
			() => {
				const {childNodes} = this;
				if (childNodes.length !== 1) {
					return initChildNodes(childNodes);
				}
				const [f] = childNodes;
				if (typeof f !== 'function') {
					return initChildNodes(childNodes);
				}
				return initChildNodes(f());
			},
		);
		this.created = true;
		this.refresh();
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
