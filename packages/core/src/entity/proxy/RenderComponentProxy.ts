import {
	RenderComponent,
	TreeNodeList,
	MountOptions,
	MountedNode,
	ComponentContext,
} from '../../types';
import {
	componentsSymbol,
	componentValueSymbol,
} from '../../constant/symbols';
import { isProduction } from '../../constant/info';
import { monitor } from '../../install/monitorable';
import { isElement, createTemplateElement } from '../../auxiliary';
import { Fragment } from '../../constant/tags';
import { runCurrent, runCurrentWithLabel } from '../../extends/current';

import draw, { unmount } from '../draw';

import ComponentProxy, { IRender } from './ComponentProxy';
import { init } from '../normalize';
import { NormalizeAuxiliaryObject } from '../normalize';

function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}
function initRender(
	proxy: RenderComponentProxy<any, any, any, any>,
	context: ComponentContext<any, any>,
): IRender {
	const { tag, props, entity, contextData } = proxy;
	const renderFn = tag[componentValueSymbol];

	const renderNode = typeof renderFn !== 'function'
		? () => createTemplateElement(...proxy.childNodes)
		: isProduction
			? () => runCurrent(
				contextData,
				entity,
				renderFn,
				props || {},
				context,
			)
			: () => runCurrentWithLabel(
				contextData,
				entity,
				l => proxy.labels = l,
				renderFn,
				props || {},
				context,
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
	protected _initRender(context: ComponentContext<any, any>): IRender {
		return initRender(this, context);
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
