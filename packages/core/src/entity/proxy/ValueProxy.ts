import {
	TreeNodeList,
	MountOptions,
	MountedNode,
	Monitored,
} from '../../type';
import BaseProxy from './BaseProxy';
import draw, { unmount } from '../draw';
import { createMountedNode } from '../id';
import { isValue } from '../../install/monitorable';
import { replace } from '../draw/update';
import NodeProxy from './NodeProxy';
import { markRead, markChange } from '../../install/monitorable';
import { isElement, Fragment } from '../../auxiliary';
import convert, { destroy } from '../convert';
import { monitor } from '../../install/monitorable';
import { wait } from '../../extends/refresh';
import { init, NormalizeAuxiliaryObject } from '../normalize';
import { createPlaceholder } from '../draw/create';
import { isProduction } from '../../constant';
import { defineProperty } from '../../install/monitorable';


function getText(
	value: any,
): string | null {
	if (value === undefined || value === null) { return null; }
	if (value instanceof Date) { return value.toISOString(); }
	if (value instanceof RegExp) { return String(value); }
	return String(value);
}


function getNodeArray(result: any): any[] {
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}
export default class ValueProxy extends NodeProxy<null> {

	get content(): (MountedNode | MountedNode[])[] { return this.tree; }
	__value: any;
	text?: string | null;
	isValue?: boolean;
	set value(v) {
		const k = v !== this.__value;
		this.__value = v;
		if (k) {
			markChange(this, 'value');
		}
	}
	get value(): any {
		markRead(this, 'value');
		let v = this.__value;
		while (isValue(v)) { v = v(); }
		return v;
	}
	__nodes?: TreeNodeList;
	src?: any;
	/** 结果渲染函数 */
	private __render: Monitored<boolean, []>;
	constructor(
		attrs: any,
		parent: BaseProxy<any>,
	) {
		super(null, null, attrs, [], parent);
		const {value} = attrs;
		this.__value = value;
		if (!isProduction) {
			defineProperty(this, 'text', undefined);
			defineProperty(this, 'isValue', isValue(value));
		}
		const slots = Object.create(null);
		const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
			renderer: this.renderer,
			refresh: () => this.refresh(),
			slotRenderFnList: new WeakMap(),
			delivered: this.delivered,
			// TODO
			simpleParent: undefined,
		};
		this.__render = monitor(
			changed => changed && this.refresh(),
			() => {
				let {value} = this;
				if (isElement(value) || Array.isArray(value)) {
					this.__nodes = convert(
						this,
						init(
							normalizeAuxiliaryObject,
							getNodeArray(value),
							slots,
							[],
							false,
							false,
						),
						this.__nodes,
					);
					return true;
				}
				if (this.__nodes) {
					destroy(this.__nodes);
					this.__nodes = undefined;
				} else if (this.src === value) {
					return false;
				}
				this.src = value;
				return true;
			},
		);
		this.created = true;
		this.refresh();
	}

	/** 是否为刷新中 */
	private __refreshing = false;
	/** 是否需要继续刷新 */
	private __needRefresh = false;


	refresh(): void {
		if (this.destroyed) { return; }
		this.__needRefresh = true;
		if (!this.created) { return; }

		if (this.__refreshing) { return; }
		this.__refreshing = true;

		let needDraw = false;
		while (this.__needRefresh && !wait(this)) {
			this.__needRefresh = false;
			needDraw = this.__render() || needDraw;
			if (this.destroyed) { return; }
		}
		this.__refreshing = false;
		if (!needDraw) { return; }
		if (wait(this)) { return; }
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		if (this.unmounted) { return; }
		this.requestDraw();
	}

	_update({value}: any): void {
		this.value = value;
		if (!isProduction) {
			this.isValue = isValue(value);
		}
	}
	_destroy(): void {
		this.__render.stop();
		const { __nodes } = this;
		if (!__nodes) {
			return;
		}
		destroy(__nodes);
	}
	_mount(mountOptions: MountOptions): void {
		const { renderer, __nodes, src } = this;
		if (__nodes) {
			this.tree = draw(renderer, mountOptions, __nodes);
			return;
		}
		if (renderer.isNode(src)) {
			this.tree = [createMountedNode({ node: src })];
			return;
		}
		const text = getText(src);
		if (!isProduction) { this.text = text; }
		const node = typeof text === 'string'
			? createMountedNode({ node: renderer.createText(text) })
			: createPlaceholder(renderer);
		this.tree = [node];
	}
	_redraw(mountOptions: MountOptions): void {
		const { renderer, __nodes, src } = this;
		if (__nodes) {
			this.tree = draw(renderer, mountOptions, __nodes, this.tree);
			return;
		}
		if (renderer.isNode(src)) {
			this.tree = [createMountedNode({ node: src })];
			if (!isProduction) {
				this.text = undefined;
			}
			return;
		}
		const text = getText(src);
		if (!isProduction) { this.text = text; }
		const node = typeof text === 'string'
			? createMountedNode({ node: renderer.createText(text) })
			: createPlaceholder(renderer);
		this.tree =	replace(renderer, [node], this.tree);
	}
	_unmount(): void {
		const { renderer, tree } = this;
		unmount(renderer, tree);
	}
}
