/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	NativeNode,
	NativeContainerNode,
	MountedNode,
	ContainerComponent,
	MountOptions,
	ContainerEntity,
	Hook,
} from '../../type';
import {
	rendererSymbol,
	componentValueSymbol,
	objectTypeSymbolHookEntity,
	objectTypeSymbol,
} from '../../symbols';
import { getRender } from '../../install';
import { defineProperty } from '../../install/monitorable';
import { createMountedNode } from '../id';
import convert, { destroy } from '../convert';
import draw, { unmount, getNodes } from '../draw';
import BaseProxy, { setCompleteList } from './BaseProxy';
import ComponentProxy from './ComponentProxy';
import { isProduction } from '../../constant';
import { createPlaceholder } from '../draw/create';
import EventEmitter from '../../EventEmitter';
import { markDraw } from '../../extends/nextTick';
import { callHook, setHook } from '../../hook';
import RefProxy from './RefProxy';

function createEntity<P extends object>(
	obj: ContainerProxy<P>,
	events: EventEmitter<ContainerEntity<any>>,
): ContainerEntity<any> {
	const cfg: { [K in keyof ContainerEntity<any>]-?:
		{ configurable: true, value: ContainerEntity<any>[K], writable?: boolean }
		| { configurable: true, get(): ContainerEntity<any>[K] }
	} = {
		[objectTypeSymbol]: { configurable: true, value: objectTypeSymbolHookEntity },
		data: { configurable: true, value: obj.data },
		exposed: { configurable: true, get: () => obj.exposed },
		// component: { configurable: true, value: obj.tag },
		created: { configurable: true, get: () => obj.created },
		destroyed: { configurable: true, get: () => obj.destroyed },
		mounted: { configurable: true, get: () => obj.mounted },
		unmounted: { configurable: true, get: () => obj.unmounted },
		$_hooks: { configurable: true, value: Object.create(null) },
		callHook: { configurable: true, value(h: string) { callHook(h, entity); } },
		setHook: {
			configurable: true,
			value(id: string, hook: Hook<any>) { return setHook(id, hook, entity); },
		},
		on: { configurable: true, value: events.on },
		emit: { configurable: true, value: events.emit },
	};
	const entity: ContainerEntity<any> = Object.create(null, cfg);
	return entity;
}

export default class ContainerProxy<
	P extends object
> extends RefProxy<any, ContainerComponent<P> | null, ContainerEntity<any>> {
	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	setmountedRoot(target?: any, next?: any): void {
		if (this.parentProxy) { return; }
		const container = this.__container;
		if (!container) { return; }
		const {renderer} = this;
		const [r, n] = renderer.getContainer(container, target, next);
		if (!r) { return; }
		for (const it of getNodes(this.tree)) {
			renderer.insertNode(r, it, n);
		}
	}

	private readonly __containerData: any;
	/** 组件树结构 */
	content: (MountedNode | MountedNode[])[] = [];

	readonly rootContainer: ContainerProxy<any> = this;
	constructor(
		originalTag: any,
		component: ContainerComponent<P> | null = null,
		props: Record<string, any> = {},
		children: any[],
		parent?: BaseProxy<any>,
	) {
		super(
			component
				? getRender(component[rendererSymbol], parent?.renderer)
				: getRender(parent?.renderer),
			originalTag,
			component,
			props,
			parent,
		);
		this.container = this;
		this.componentRoot = parent?.componentRoot;

		if (component) {
			this.__containerData = component[componentValueSymbol];
		}
		if (!isProduction) { defineProperty(this, 'content', []); }
		// 事件处理
		this.events.updateInProps(props);
		if (parent) {
			this.rootContainer = parent.container.rootContainer;
		}
		this.__nodes = convert(this, children);
		this.created = true;
	}

	createEntity(events: EventEmitter<any>): ContainerEntity<any> {
		return createEntity(this, events);
	}
	private __nodes: any[] = [];
	setChildren(children: any[]): void {
		if (this.destroyed) { return; }
		this.__nodes = convert(this, children, this.__nodes);
		this.requestDraw();
	}
	/** 更新属性及子代 */
	_update(props: Record<string, any>, children: any[]): void {
		if (this.destroyed) { return; }
		this.__nodes = convert(this, children, this.__nodes);
		// 事件处理
		this.events.updateInProps(props);
		this.requestDraw();
	}
	_destroy(): void { destroy(this.__nodes); }
	callHook(id: string): void { callHook(id, this.entity); }

	requestDraw(): void { this.markDraw(this); }
	private __container: NativeContainerNode | null = null;
	private __placeholder: MountedNode | undefined;
	private __placeholderNode: NativeNode | undefined;
	private __targetNode: NativeContainerNode | null = null;
	private __insertNode: NativeNode | null = null;
	private __nextNode: NativeNode | null = null;
	_mount(opt: MountOptions): MountOptions | undefined {
		const { parentProxy, renderer } = this;
		const parentRenderer = parentProxy?.renderer || renderer;

		const {
			container,
			target: targetNode,
			insert,
			next,
			exposed,
		} = renderer.mountContainer(
			this.__containerData,
			this.attrs,
			this.events.emit,
			parentProxy?.renderer,
		);
		console.log(exposed);
		this.setExposed(exposed);
		const subOpt = renderer.getMountOptions(container, opt) || opt;

		const placeholder = createPlaceholder(parentRenderer);
		this.__placeholder = placeholder;
		const placeholderNode = placeholder.node!;
		this.__placeholderNode = placeholderNode;
		this.__container = container;
		const content = draw(renderer, subOpt, this.__nodes);
		this.content = content;
		this.__insertNode = insert;
		this.__nextNode = next;
		if (!targetNode && parentRenderer === renderer) {
			this.tree = insert
				? [...content, createMountedNode({ node: insert }), placeholder]
				: [...content, placeholder];
			return subOpt;
		}
		const target = targetNode || container;
		this.__targetNode = target;
		for (const it of getNodes(content)) {
			renderer.insertNode(target, it, next);
		}
		this.tree = insert
			? [createMountedNode({ node: insert }), placeholder]
			: [placeholder];
		return subOpt;
	}
	_redrawSelf(): void {
		const { __targetNode, __insertNode, __nextNode } = this;
		const { attrs, parentProxy, renderer } = this;
		const placeholder = this.__placeholder!;
		const placeholderNode = this.__placeholderNode!;
		const container = this.__container!;
		const parentRenderer = parentProxy?.renderer || renderer;

		const {target: targetNode, insert, next} = renderer.updateContainer(
			container,
			__targetNode,
			__insertNode,
			__nextNode,
			this.__containerData,
			attrs,
			this.events.emit,
			parentProxy?.renderer,
		);
		this.__insertNode = insert;
		this.__nextNode = next;
		const parentNode = parentRenderer.getParent(placeholderNode);
		if (insert !== __insertNode) {
			if (__insertNode) { renderer.removeNode(__insertNode); }
			if (insert && parentNode) {
				renderer.insertNode(parentNode, insert, placeholderNode);
			}
		}
		if (!targetNode && parentRenderer === renderer) {
			const { content } = this;
			if (__targetNode && parentNode) {
				const nextNode = insert || placeholderNode;
				for (const it of getNodes(content)) {
					parentRenderer.insertNode(parentNode, it, nextNode);
				}
				this.__targetNode = null;
			}
			this.tree = insert
				? [...content, createMountedNode({ node: insert }), placeholder]
				: [...content, placeholder];
		} else {
			const target = targetNode || container;
			this.__targetNode = target;
			if (target !== __targetNode || next !== __nextNode) {
				for (const it of getNodes(this.content)) {
					renderer.insertNode(target, it, next);
				}
			}
			this.tree = insert
				? [createMountedNode({ node: insert }), placeholder]
				: [placeholder];
		}
		renderer.recoveryContainer(
			container,
			__targetNode,
			__insertNode,
			__nextNode,
			targetNode,
			insert,
			next,
			this.__containerData,
			attrs,
			parentProxy?.renderer,
		);
	}
	_redrawChildren(opts: MountOptions): void {
		const content = draw(this.renderer, opts, this.__nodes, this.content);
		this.content = content;
		if (!this.__targetNode) { return; }
		const placeholder = this.__placeholder!;
		const insertNode = this.__insertNode;
		this.tree = insertNode
			? [...content, createMountedNode({ node: insertNode }), placeholder]
			: [...content, placeholder];
	}
	_redraw(opt: MountOptions): void {
		this._redrawChildren(opt);
		this._redrawSelf();
	}
	_unmount(): void {
		const { parentProxy, renderer, __insertNode } = this;
		const parentRenderer = parentProxy?.renderer || renderer;
		unmount(this.renderer, this.content);
		if (__insertNode) { parentRenderer.removeNode(__insertNode); }
		parentRenderer.removeNode(this.__placeholderNode!);
		renderer.unmountContainer(
			this.__container!,
			this.__targetNode,
			__insertNode,
			this.__nextNode,
			this.__containerData,
			this.attrs,
			parentProxy?.renderer,
		);
	}

	/** 等待重画的项目 */
	private __awaitDraw = new Set<BaseProxy<any>>();
	/** 标记需要绘制的元素 */
	markDraw(proxy: BaseProxy<any>): void {
		if (this.parentProxy?.renderer === this.renderer) {
			this.parentProxy.container.markDraw(proxy);
			return;
		}
		if (proxy === this && this.parentProxy) {
			this.parentProxy.container.markDraw(this);
		} else {
			this.__awaitDraw.add(proxy);
		}
		this.rootContainer.markDrawContainer(this);
	}
	drawContainer(): void {
		if (this.destroyed || !this.__container) { return; }
		const { __awaitDraw } = this;
		const list = [...__awaitDraw];
		__awaitDraw.clear();
		list.map(c => c.redraw());
	}
	private __containers = new Set<ContainerProxy<any>>();
	markDrawContainer(container: ContainerProxy<any>): void {
		this.__containers.add(container);
		markDraw(this);
	}
	drawAll(): void {
		const containers = this.__containers;
		if (!containers.size) { return; }
		const list = [...containers];
		containers.clear();
		const completeList: (() => void)[] = [];
		setCompleteList(completeList);
		list.forEach(c => c.drawContainer());
		completeList.forEach(r => r());
	}
}
