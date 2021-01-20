import {
	StandardComponent,
	Node,
	NativeShadowNode,
	MountedNode,
	DeliverComponent,
	MountOptions,
	Component,
	NativeComponentNode,
	Label,
} from '../../type';
import {
	componentsSymbol,
	componentValueSymbol,
} from '../../symbols';
import { isProduction } from '../../constant';
import { exec, monitor, defineProperty } from '../../install/monitorable';
import { isElement, isRenderElement } from '../../auxiliary';
import { runCurrent } from '../../extends/current';
import { initContext } from '../../extends/context';
import { isNativeComponent, isRenderComponent } from '../../is';

import { destroy } from '../convert';
import draw, { unmount, getNodes } from '../draw';
import normalize from '../normalize';
import { createSlotApi } from '../slot';
import getDelivered from '../getDelivered';
import { createMountedNode } from '../id';

import ComponentProxy, { IRender } from './ComponentProxy';


function createResponsiveRender(
	proxy: ComponentProxy<any, any, any, any>,
	func: Function,
	components?: Record<string, Component<any>> | null,
): IRender {
	// 响应式
	const slotRenderFns = new WeakMap<Function, Function>();
	const render = monitor(
		c => c && proxy.refresh(),
		() => normalize(
			proxy,
			slotRenderFns,
			f => proxy.refresh(f),
			(func as () => Node)(),
			components,
		),
	);
	return {
		nodes: render(),
		render,
		stopRender: () => render.stop(),
	};
}

function initRender(proxy: StandardComponentProxy< any, any, any, any>): IRender {

	const { tag, props, entity } = proxy;
	const context = initContext({
		isShell: false,
		slot: createSlotApi(proxy.slots),
		expose: t => proxy.setExposed(t),
		get created() { return proxy.created; },
		get parent() { return proxy.parentComponentProxy?.entity; },
		get children() { return [...proxy.children].map(t => t.exposed); },
		get childNodes() { return proxy.childNodes; },
		get emit() { return proxy.emit; },
		delivered<T>(deliver: DeliverComponent<T>): T{
			return getDelivered(proxy.delivered, deliver);
		},
		refresh(f) { proxy.refresh(f); },
	}, entity);
	const refresh = (changed: boolean): void => {
		if (!changed) { return; }
		proxy.refresh();
	};
	const setLabel = isProduction
		? undefined
		: (l?: Label[]) => proxy.labels = l;
	// 初始化执行
	const result = exec(
		refresh,
		{ resultOnly: true },
		() => runCurrent(entity, setLabel, () => tag(props, context)),
	);
	if (typeof result === 'function') {
		return createResponsiveRender(proxy, result);
	}
	if (isRenderElement(result)) {
		const { children } = result;
		if (children?.length === 1 && typeof children[0] === 'function') {
			return createResponsiveRender(proxy, children[0]);
		}
	}

	if (isElement(result) && isRenderComponent(result.tag)) {
		const {tag} = result;
		const render = tag[componentValueSymbol];
		if (typeof render === 'function') {
			return createResponsiveRender(
				proxy,
				(): Node => render(result.props || {}, context),
				result.tag[componentsSymbol] || null,
			);
		}
	}


	const normalizeRefresh = (f?: () => void): void => { proxy.refresh(f); };
	const slotRenderFns = new WeakMap<Function, Function>();

	const render = monitor(
		refresh,
		() => normalize(proxy, slotRenderFns, normalizeRefresh, runCurrent(
			entity,
			setLabel,
			() => tag(props, context),
		)),
	);
	return {
		nodes: exec(
			refresh,
			() => normalize(proxy, slotRenderFns, normalizeRefresh, result),
			{ resultOnly: true },
		),
		render,
		stopRender: () => render.stop(),
	};
}
export default class StandardComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends StandardComponent<TProps, TExpose, TEmit>,
> extends ComponentProxy<TProps, TExpose, TEmit, C> {
	content: (MountedNode | MountedNode[])[] = [];
	/** 原生组件 */
	native: NativeComponentNode | undefined;

	shadowTree: (MountedNode | MountedNode[])[] = [];
	nativeTree: (MountedNode | MountedNode[])[] = [];
	private _shadow: NativeShadowNode | undefined;

	protected _init(): void {
		if (!isProduction) { defineProperty(this, 'content', []); }

		if (!isNativeComponent(this.tag)) { return; }
		const value = this.renderer.createComponent?.();
		if (!value) { return; }
		[this.native, this._shadow] = value;
	}
	protected _initRender(): IRender {
		return initRender(this);
	}

	_destroy(): void {
		this._stopRender();
		destroy(this._nodes);
	}

	childNodes: any[] = [];


	/** 刷新 */
	requestDraw(): void {
		this.container.markDraw(this);
	}
	private __nativeTreeNountOptions: MountOptions | undefined;
	_mount(mountOptions: MountOptions): MountOptions | void {
		const { nativeNodes, renderer, _shadow, native, _nodes } = this;
		if (!native || !nativeNodes || !_shadow) {
			this.tree = this.content = draw(renderer, mountOptions, _nodes);
			return;
		}
		this.tree = [createMountedNode({node:native })];
		const subMountOptions = renderer.getMountOptions(
			_shadow,
			mountOptions,
		) || mountOptions;
		this.content = draw(renderer, subMountOptions, _nodes);
		for (const it of getNodes(this.content)) {
			renderer.insertNode(_shadow, it);
		}

		const nativeTreeNountOptions = renderer.getMountOptions(
			native,
			mountOptions,
		) || mountOptions;
		this.nativeTree = draw(renderer, nativeTreeNountOptions, nativeNodes);
		for (const it of getNodes(this.nativeTree)) {
			renderer.insertNode(native, it);
		}
		this.__nativeTreeNountOptions = nativeTreeNountOptions;
		return subMountOptions;
	}
	_redraw(mountOptions: MountOptions): void {
		const {nativeNodes, renderer, __nativeTreeNountOptions, _nodes} = this;
		this.content = draw(renderer, mountOptions, _nodes, this.content);
		if (!nativeNodes || !__nativeTreeNountOptions) {
			this.tree = this.content;
			return;
		}
		this.nativeTree = draw(
			renderer,
			__nativeTreeNountOptions,
			nativeNodes,
			this.nativeTree,
		);
	}
	_unmount(): void {
		const {renderer, nativeTree} = this;
		unmount(renderer, this.tree);
		if (!nativeTree) { return; }
		unmount(renderer, nativeTree);
	}
}
