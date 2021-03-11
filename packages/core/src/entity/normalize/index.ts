
import {
	Element,
	Slots,
	SimpleComponent,
	Component,
	ContextData,
	ComponentEntity,
	IRenderer,
} from '../../types';
import {
	componentsSymbol,
	objectTypeSymbol,
	objectTypeSymbolElement,
} from '../../constant/symbols';
import { Render, ScopeSlot } from '../../constant/tags';
import { isValue, postpone } from '../../install/monitorable';

import { isSimpleComponent } from '../../is';

import { isElement } from '../../auxiliary';
import delayRefresh from '../../extends/delayRefresh';
import { createBy } from '../../extends/with';
import { runCurrent } from '../../extends/current';

import ComponentProxy from '../proxy/ComponentProxy';
import {
	createSlotApi,
	setSlot,
	renderSlot,
} from '../slot';

import createSimpleEmit from './createSimpleEmit';
import getComponents from './getComponents';
import { getNodeArray } from './getNodeArray';
import { findComponent } from './findComponent';
import { getChildren } from './getChildren';
import { createSimpleSlots } from './createSimpleSlots';

export interface NormalizeAuxiliaryObject {
	refresh: (f?: () => void) => void;
	slotRenderFnList: WeakMap<Function, Function>;
	delivered: Record<any, any>;
	simpleParent: ComponentEntity<any, any> | undefined;
	renderer: IRenderer;
}

function createSimpleContextData(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
): ContextData {
	return {
		isShell: false,
		isSimple: true,
		created: false,
		destroyed: true,
		delivered: normalizeAuxiliaryObject.delivered,
		withData: {},
		refresh: normalizeAuxiliaryObject.refresh,
		parent: normalizeAuxiliaryObject.simpleParent,
		getChildren: () => [],
	};
}

function execSimple(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	node: Element,
	tag: SimpleComponent<any, any>,
	components: Record<string, Component<any>>[],
	children: any[],
): Element {
	const slots = createSimpleSlots(normalizeAuxiliaryObject, children);
	const contextData = createSimpleContextData(normalizeAuxiliaryObject);

	const result = runCurrent(contextData, undefined, tag, {...node.props}, {
		by: createBy(contextData),
		slot: createSlotApi(slots, true),
		childNodes: () => children,
		emit: createSimpleEmit(node.props),
	});
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
	if (children.length !== 1) { return null; }
	const [renderFn] = children;
	if (isValue(renderFn) || typeof renderFn !== 'function') { return null; }
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
			return { ...node, children: [slotRenderFn] } as Element;
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
export function init(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	node: any[],
	slots: Slots,
	components: Record<string, Component<any>>[],
	native: boolean,
	simpleSlot: boolean,
): any[] {
	return delayRefresh(() => postpone(() => exec(
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
