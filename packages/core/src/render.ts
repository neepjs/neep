import {
	Element,
	StandardComponent,
	RootEntity,
	ContainerComponent,
	Component,
	Value,
} from './type';
import { isElement, createElement } from './auxiliary';
import { isProduction } from './constant';
import { devtools, getRender } from './install';
import ContainerProxy from './entity/proxy/ContainerProxy';
import { isContainerComponent } from './is';
import { monitor, value } from './install/monitorable';
import { init, NormalizeAuxiliaryObject } from './entity/normalize';
import { wait } from './extends/refresh';
import { rendererSymbol } from './symbols';

function createContainerEntity(
	e: Element | Component<any> | undefined,
	p: Record<string, any>,
): [ContainerProxy<any>, Value<any[]>] {
	if (e === undefined) {
		return createRender(null, p);
	}
	if (isContainerComponent(e)) {
		return createRender(e, p);
	}
	if (!isElement(e)) {
		return createRender(null, p, [createElement(e)]);
	}
	if (isContainerComponent(e.tag)) {
		const params = {...e.props, ...p};
		return createRender(e.tag, params);
	}
	return createRender(null, p, [e]);
}

function createRender(
	tag: ContainerComponent<any, any> | null,
	props: Record<string, any>,
	childNodes: any[] = [],
): [ContainerProxy<any>, Value<any[]>] {
	const children = value(childNodes);

	const normalizeAuxiliaryObject: NormalizeAuxiliaryObject = {
		renderer: tag ? getRender(tag[rendererSymbol]) :  getRender(),
		refresh,
		slotRenderFnList: new WeakMap(),
		delivered: Object.create(null),
		// TODO
		simpleParent: undefined,
	};

	let __needRefresh = false;
	let __refreshing = false;

	let container: ContainerProxy<any> | undefined;
	function refresh(): void {
		if (!container) {
			__needRefresh = true;
			return;
		}
		if (container.destroyed) { return; }
		__needRefresh = true;
		if (!container.created) { return; }

		if (__refreshing) { return; }
		__refreshing = true;

		let nodes: any[] | undefined;
		for (;;) {
			if (wait(refreshObj)) { break; }
			if (!__needRefresh) { break; }
			__needRefresh = false;
			nodes = _render();
			if (container.destroyed) { return; }
		}
		__refreshing = false;
		if (wait(refreshObj)) { return; }
		if (!nodes) { return; }

		if (!container.mounted) { return; }
		if (container.destroyed) { return; }
		if (container.unmounted) { return; }
		container.setChildren(nodes);
	}
	const refreshObj = { refresh };
	const slots = Object.create(null);
	const _render = monitor(
		c => c && refresh(),
		() => init(
			normalizeAuxiliaryObject,
			children.value,
			slots,
			[],
			false,
			false,
		),
	);
	container = new ContainerProxy(tag, tag, props, _render());
	if (__needRefresh) { refresh(); }
	return [container, children];
}

function render(
	e?: Element | Component<any>,
	p: Record<string, any> = {},
): RootEntity<any> {
	const [container, children] =  createContainerEntity(e, p);
	const entity: RootEntity<any> = Object.create(container.entity, {
		update: {
			configurable: true,
			value(c?: Element | StandardComponent<any, any, any>) {
				if (container.destroyed) { return entity; }
				children(c === undefined ? []
					: isElement(c) ? [c] : [createElement(c)]);
				return entity;
			},
		},
		mount: {
			configurable: true,
			value(target?: any, next?: any) {
				if (container.destroyed) { return entity; }
				if (container.mounted) { return entity; }
				container.mount({});
				container.setmountedRoot(target, next);
				return entity;
			},
		},
		unmount: {
			configurable: true,
			value() {
				if (!container.mounted) { return; }
				if (container.unmounted) { return; }
				if (!container.destroyed) { container.destroy(); }
				container.unmount();
				return entity;
			},
		},
	});
	if (!isProduction) {
		devtools.renderHook(entity, container);
	}
	return entity;
}

export default render;
