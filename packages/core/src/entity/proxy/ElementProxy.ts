import {
	TreeNodeList,
	NativeElementNode,
	MountedNode,
	ElementComponent,
	MountOptions,
	ElementEntity,
} from '../../type';
import BaseProxy from './BaseProxy';
import convert, { destroy } from '../convert';
import draw, { getNodes, unmount } from '../draw';
import RefProxy from './RefProxy';
import { createMountedNode } from '../id';
import { componentValueSymbol } from '../../symbols';
import { defineProperty } from '../../install/monitorable';
import { isProduction } from '../../constant';
import EventEmitter from '../../EventEmitter';
import ContainerProxy from './ContainerProxy';
import ComponentProxy from './ComponentProxy';

export default class ElementProxy<
	T extends string | ElementComponent<any, any>
> extends RefProxy<NativeElementNode, T, ElementEntity<NativeElementNode>> {
	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	props: object;
	private __nodes: TreeNodeList;
	node?: NativeElementNode;
	content: (MountedNode | MountedNode[])[] = [];
	private __elementTagData: string | any;
	constructor(
		originalTag: any,
		tag: T,
		props: object,
		children: any[],
		parent: BaseProxy<any>,
	) {
		super(parent.renderer, originalTag, tag, props, parent);
		this.container = parent.container;
		this.componentRoot = parent.componentRoot;
		if (!isProduction) { defineProperty(this, 'content', []); }

		this.props = props;
		// 事件处理
		this.events.updateInProps(props);
		this.__nodes = convert(this, children);
		if (typeof tag === 'string') {
			this.__elementTagData = tag;
		} else {
			this.__elementTagData = (tag as any)[componentValueSymbol];
		}
	}
	requestDraw(): void {
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		this.container.markDraw(this);
	}
	callHook(id: string): void {
	}
	createEntity(events: EventEmitter<any>): ElementEntity<NativeElementNode> {
		const cfg: { [K in keyof ElementEntity<any>]-?:
			{ configurable: true, value: ElementEntity<any>[K], writable?: boolean }
			| { configurable: true, get(): ElementEntity<any>[K] }
		} = {
			data: { configurable: true, value: this.data },
			exposed: { configurable: true, get: () => this.exposed },
			on: { configurable: true, value: events.on },
			emit: { configurable: true, value: events.emit },
		};
		const entity: ElementEntity<any> = Object.create(null, cfg);
		return entity;
	}
	/** 更新属性及子代 */
	_update(props: object, children: any[]): void {
		this.props = props;
		// 事件处理
		this.events.updateInProps(props);
		this.__nodes = convert(this, children, this.__nodes);
		this.requestDraw();
	}

	_destroy(): void {
		if (this.destroyed) { return; }
		this.destroyed = true;
		destroy(this.__nodes);
	}
	_mount(mountOptions: MountOptions): MountOptions | void {
		if (this.node) { return; }
		const { renderer, __elementTagData: tag, props, __nodes } = this;
		const node = renderer.createElement(tag, props, mountOptions);
		if (!node) { return; }
		this.node = node;
		this.setExposed(node);
		const subMountOptions = renderer.getMountOptions(
			node,
			mountOptions,
		) || mountOptions;
		if (__nodes) {
			const content = draw(renderer, subMountOptions, __nodes);
			this.content = content;
			for (const it of getNodes(content)) {
				renderer.insertNode(node, it);
			}
		}
		this.tree = [createMountedNode({ node })];
		renderer.updateProps(
			node,
			tag,
			props,
			this.events.emit,
			subMountOptions,
		);
		return subMountOptions;
	}
	_redrawChildren(mountOptions: MountOptions): void {
		const { renderer, __nodes, content, node } = this;
		if (!node) { return; }
		if (!__nodes.length && content.length) {
			unmount(renderer, content);
			this.content = [];
		} else if (__nodes.length && content.length) {
			this.content = draw(renderer, mountOptions, __nodes, content);
		} else if (__nodes.length && !content.length) {
			const newTree = draw(renderer, mountOptions, __nodes);
			this.content = newTree;
			for (const it of getNodes(newTree)) {
				renderer.insertNode(node, it);
			}
		}
	}
	_redraw(mountOptions: MountOptions): void {
		this._redrawChildren(mountOptions);
		const { renderer, __elementTagData: tag, node, props } = this;
		if (!node) { return; }
		renderer.updateProps(
			node,
			tag,
			props || {},
			this.events.emit,
			mountOptions,
		);
	}
	_unmount(): void {
		const { renderer, tree, node } = this;
		if (!node) { return; }
		renderer.removeNode(node);
		unmount(renderer, tree);
	}
}
