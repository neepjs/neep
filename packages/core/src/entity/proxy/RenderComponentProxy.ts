import {
	RenderComponent,
	TreeNodeList,
	DeliverComponent,
	Label,
	MountOptions,
	MountedNode,
} from '../../type';
import {
	componentsSymbol,
	componentValueSymbol,
} from '../../symbols';
import { isProduction } from '../../constant';
import { monitor } from '../../install/monitorable';
import { isElement, Fragment, createTemplateElement } from '../../auxiliary';
import { runCurrent } from '../../extends/current';
import { initContext } from '../../extends/context';

import { destroy } from '../convert';
import draw, { unmount } from '../draw';
import {createSlotApi } from '../slot';
import getDelivered from '../getDelivered';

import ComponentProxy, { IRender } from './ComponentProxy';
import { init, NormalizeAuxiliaryObject } from '../normalize';

function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}
function initRender(proxy: RenderComponentProxy< any, any, any, any>): IRender {
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
	const renderFn = tag[componentValueSymbol];

	const renderNode = typeof renderFn !== 'function'
		? () => createTemplateElement(...proxy.childNodes)
		: () => runCurrent(
			entity,
			isProduction ? undefined : (l?: Label[]) => proxy.labels = l,
			() => renderFn(props || {}, context),
		);

	const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
		renderer: proxy.renderer,
		refresh: f => proxy.refresh(f),
		slotRenderFnList: new WeakMap<Function, Function>(),
		delivered: proxy.delivered,
		simpleParent: proxy.entity,
	};
	const components = proxy.tag[componentsSymbol];
	const componentsList = components ? [components] : [];
	const render = monitor(
		c => c && proxy.refresh(),
		() => init(
			normalizeAuxiliaryObject,
			getNodeArray(renderNode()),
			proxy.slots,
			componentsList,
			false,
			false,
		),
	);
	return {
		nodes: render(),
		render,
		stopRender: () => render.stop(),
	};

}
export default class RenderComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends RenderComponent<TProps, TExpose, TEmit>,
> extends ComponentProxy<TProps, TExpose, TEmit, C> {
	get content(): (MountedNode | MountedNode[])[] { return this.tree; }

	/** 原生子代 */
	nativeNodes: TreeNodeList | undefined;

	protected _init(): void {}
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
	_redraw(mountOptions: MountOptions): void {
		const {renderer, _nodes} = this;
		this.tree = draw(renderer, mountOptions, _nodes, this.tree);
	}
	_mount(mountOptions: MountOptions): void {
		const { renderer, _nodes } = this;
		this.tree = draw(renderer, mountOptions, _nodes);
	}
	_unmount(): void {
		const {renderer} = this;
		unmount(renderer, this.tree);
	}
}
