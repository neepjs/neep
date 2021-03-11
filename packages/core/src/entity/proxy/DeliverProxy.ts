import {
	TreeNodeList,
	DeliverComponent,
	MountOptions,
	MountedNode,
} from '../../types';
import BaseProxy from './BaseProxy';
import convert, { destroy } from '../convert';
import NodeProxy from './NodeProxy';
import { deliverKeySymbol } from '../../constant/symbols';
import { markRead, markChange } from '../../install/monitorable';
import draw, { unmount } from '../draw';

export default class DeliverProxy<T> extends NodeProxy<DeliverComponent<T>> {
	private __valueObject: T | undefined;
	private __nodes: TreeNodeList;
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }


	constructor(
		originalTag: any,
		tag: DeliverComponent<T>,
		props: { value?: T;},
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(originalTag, tag, props, children, parent, Object.create(parent.delivered));
		const {value} = props;
		this.__valueObject = value;
		Reflect.defineProperty(this.delivered, tag[deliverKeySymbol], {
			configurable: true,
			enumerable: true,
			get:() => {
				markRead(this, 'value');
				return this.__valueObject;
			},
		});
		this.__nodes = convert(this, children);
		this.created = true;
	}
	/** 更新属性及子代 */
	_update({value}: { value?: T;}, children: any[]): void {
		if (this.__valueObject !== value) {
			this.__valueObject = value;
			markChange(this, 'value');
		}
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
		const { renderer, __nodes, tree } = this;
		this.tree = draw(renderer, mountOptions, __nodes, tree);
	}
	_unmount(): void {
		unmount(this.renderer, this.tree);
	}
}
