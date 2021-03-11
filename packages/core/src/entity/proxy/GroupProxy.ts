import {
	MountOptions,
	TreeNodeList,
	MountedNode,
} from '../../types';
import BaseProxy from './BaseProxy';
import convert, { destroy } from '../convert';
import draw, { unmount } from '../draw';
import NodeProxy from './NodeProxy';

export default class GroupProxy<T> extends NodeProxy<T> {
	private __nodes: TreeNodeList;

	get content(): (MountedNode | MountedNode[])[] { return this.tree; }
	constructor(
		tag: T,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(tag, tag, {}, children, parent);
		this.__nodes = convert(this, children);
	}
	/** 更新属性及子代 */
	_update(props: object, children: any[]): void {
		this.__nodes = convert(this, children, this.__nodes);
		this.requestDraw();
	}

	_destroy(): void {
		destroy(this.__nodes);
	}
	_mount(mountOptions: MountOptions): void {
		this.tree = draw(this.renderer, mountOptions, this.__nodes);
	}
	_redraw(mountOptions: MountOptions): void {
		this.tree = draw(this.renderer, mountOptions, this.__nodes, this.tree);
	}
	_unmount(): void {
		unmount(this.renderer, this.tree);
	}
}
