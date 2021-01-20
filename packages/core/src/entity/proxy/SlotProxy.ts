import {
	MountOptions,
	TreeNodeList,
	MountedNode,
} from '../../type';
import BaseProxy from './BaseProxy';
import convert, { destroy } from '../convert';
import draw, { unmount } from '../draw';
import NodeProxy from './NodeProxy';
import { ScopeSlot } from '../../auxiliary';

export default class SlotProxy extends NodeProxy<typeof ScopeSlot> {
	__nodes: TreeNodeList;
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }

	constructor(
		children: any[],
		parent: BaseProxy<any>,
		isDefault?: boolean,
	) {
		super(
			ScopeSlot,
			ScopeSlot,
			{},
			[],
			parent,
		);
		this.__nodes = convert(this, children);
	}
	/** 更新属性及子代 */
	_update(props: object, children: any[]): void {
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
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
