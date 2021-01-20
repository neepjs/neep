
import {
	Element,
	Slots,
	SimpleComponent,
	Component,
	ComponentEntity,
	IRenderer,
} from '../../type';
import { isValue, postpone } from '../../install/monitorable';
import { componentsSymbol, objectTypeSymbol, objectTypeSymbolElement } from '../../symbols';
import ComponentProxy from '../proxy/ComponentProxy';
import EventEmitter from '../../EventEmitter';
import { isSimpleComponent } from '../../is';
import { getSlots, setSlots, createSlotApi, setSlot, renderSlot } from '../slot';
import { initContext } from '../../extends/context';

import {
	isElement,
	Fragment,
	Render,
	Slot,
	ScopeSlot,
	Container,
} from '../../auxiliary';
import getDelivered from '../getDelivered';
import refresh from '../../extends/refresh';
import { components as globalComponents } from '../../register';

export function findComponent(
	tag: any,
	components: Record<string, Component<any>>[],
	native?: boolean,
): Component<any> | string | null {
	if (!tag) { return null; }
	if (typeof tag !== 'string') { return tag; }
	if (/^core:/i.test(tag)) {
		let ltag = tag.toLowerCase();
		if (ltag === Container) { return ltag; }
		if (ltag === ScopeSlot) { return ltag; }
		if (ltag === Render) { return ltag; }
		if (ltag === Slot) { return native ? 'slot' : ScopeSlot; }
		return Fragment;
	}
	if (tag === Fragment) { return tag; }
	if (tag === 'slot') { return tag; }
	for (const list of components) {
		const component = list[tag];
		if (component) { return component; }
	}
	return globalComponents[tag] || tag;
}
export function getComponents(
	...components: (Record<string, Component<any>> | undefined | null)[]
): Record<string, Component<any>>[] {
	return components.filter(Boolean) as Record<string, Component<any>>[];
}

function getNodeArray(result: any): any[] {
	if (Array.isArray(result)) { return result; }
	if (!isElement(result)) { return [result]; }
	if (result.tag !== Fragment) { return [result]; }
	return result.children;
}

function execSimple(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	node: Element,
	tag: SimpleComponent<any, any>,
	components: Record<string, Component<any>>[],
	children: any[],
): Element {
	const slotMap = Object.create(null);
	getSlots(normalizeAuxiliaryObject.renderer, children, slotMap);
	const slots = setSlots(slotMap);
	const event = new EventEmitter();
	event.updateInProps(node.props);
	const { refresh, delivered, simpleParent } =  normalizeAuxiliaryObject;

	const result = tag({...node.props}, initContext({
		isShell: true,
		slot: createSlotApi(slots, true),
		parent: simpleParent,
		delivered: deliver => getDelivered(delivered, deliver),
		childNodes: children,
		refresh,
		emit: event.emit,
	}));
	const nodes = init(
		normalizeAuxiliaryObject,
		getNodeArray(result),
		slots,
		getComponents(...components, tag[componentsSymbol]),
		false,
		true,
	);

	return {
		...node,
		tag,
		execed: true,
		children: Array.isArray(nodes) ? nodes : [nodes],
	};
}

function getSlotRenderFn(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	children: any[],
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
): null | Function {
	if (children.length !== 1) {
		return null;
	}
	const [renderFn] = children;
	if (isValue(renderFn) || typeof renderFn !== 'function') {
		return null;
	}
	const { slotRenderFnList } = normalizeAuxiliaryObject;
	const fn = slotRenderFnList.get(renderFn);
	if (fn) { return fn; }
	const newFn = function(this: any, ...p: any[]): any[] {
		return init(
			normalizeAuxiliaryObject,
			renderFn.call(this, ...p),
			slots,
			components,
			native,
			false,
		);
	};
	slotRenderFnList.set(renderFn, newFn);
	return newFn;
}


function exec<T>(
	node: T[],
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
	simpleSlot: boolean,
): (T | Element)[];
function exec<T>(
	node: T,
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
	simpleSlot: boolean,
): T | Element;

function exec<T>(
	node: T | T[],
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
	simpleSlot: boolean,
): (T | Element) | (T | Element)[] {
	if (Array.isArray(node)) {
		return node.map(n => exec(
			n,
			normalizeAuxiliaryObject,
			slots,
			components,
			native,
			simpleSlot,
		));
	}
	if (!isElement(node)) { return node; }
	if (node.tag === ScopeSlot && node.inserted) { return node; }
	const { children } = node;
	const tag = findComponent(node.tag, components, native);
	if (isSimpleComponent(tag)) {
		if (node.execed) { return node; }
		return execSimple(
			normalizeAuxiliaryObject,
			node,
			tag,
			components,
			children.map(n => exec(
				n,
				normalizeAuxiliaryObject,
				slots,
				components,
				native,
				simpleSlot,
			)),
		);
	}
	if (tag === Render) {
		const slotRenderFn = getSlotRenderFn(
			normalizeAuxiliaryObject,
			children,
			slots,
			components,
			native,
		);
		if (slotRenderFn) {
			return {
				...node,
				children: [slotRenderFn],
			} as Element;
		}
	}
	if (tag !== ScopeSlot) {
		return {
			...node,
			tag,
			children: children.map(n => exec(
				n,
				normalizeAuxiliaryObject,
				slots,
				components,
				native,
				simpleSlot,
			)),
		} as Element;
	}

	const { props } = node;
	const args = props?.argv || {};
	const slotName = node.props?.name || 'default';
	const slot = simpleSlot || slotName in slots
		? slots[slotName]
		: setSlot(slots, slotName);
	const el: Element = {
		[objectTypeSymbol]: objectTypeSymbolElement,
		props,
		key: node.key,
		tag: ScopeSlot,
		inserted: true,
		slot: slotName,
		isDefault: !slot,
		children: slot
			? renderSlot(slot, args)
			: getChildren(children, args).map(n => exec(
				n,
				normalizeAuxiliaryObject,
				slots,
				components,
				native,
				simpleSlot,
			)),
	};
	return el;
}
function getChildren(children: any[], args: any): any[] {
	if (children.length !== 1) { return children; }
	const [fn] = children;
	if (typeof fn !== 'function') { return children; }
	return getNodeArray(fn(args));
}


export interface NormalizeAuxiliaryObject {
	refresh: (f?: () => void) => void;
	slotRenderFnList: WeakMap<Function, Function>;
	delivered: Record<any, any>;
	simpleParent: ComponentEntity<any, any> | undefined;
	renderer: IRenderer;
}
export function init(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	node: any[],
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
	simpleSlot: boolean,
): any[] {
	return refresh(() => postpone(() => exec(
		node,
		normalizeAuxiliaryObject,
		slots,
		components,
		native,
		simpleSlot,
	)));
}


export default function normalize(
	proxy: ComponentProxy<any, any, any, any>,
	slotRenderFnList: WeakMap<Function, Function>,
	refresh: (f?: () => void) => void,
	result: any,
	components = proxy.tag[componentsSymbol] || null,
): any[] {
	return init(
		{
			renderer: proxy.renderer,
			refresh,
			slotRenderFnList,
			delivered: proxy.delivered,
			simpleParent: proxy.entity,
		},
		getNodeArray(result),
		proxy.slots,
		getComponents(components),
		Boolean(proxy.isNative),
		false,
	);
}
