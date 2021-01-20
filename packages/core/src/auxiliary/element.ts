import {
	Tag,
	Element,
	ElementIteratorOptions,
	Component,
	DeliverComponent,
	RenderComponent,
	Node,
} from '../type';
import {
	objectTypeSymbol,
	objectTypeSymbolElement,
} from '../symbols';
import {
	Template, Render,
} from './tags';
import {
	isSimpleComponent,
} from '../is';

/**
 * 判读是否为元素
 */
export function isElement(v: any): v is Element {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolElement;
}
export function isFragmentElement(v: any): v is Element<'template'> {
	if (!isElement(v)) { return false; }
	const { tag } = v;
	if (typeof tag !== 'string') { return false; }
	return tag.toLowerCase() === 'template';
}
export function isRenderElement(v: any): v is Element<typeof Render> {
	if (!isElement(v)) { return false; }
	const { tag } = v;
	if (typeof tag !== 'string') { return false; }
	return tag.toLowerCase() === Render;
}
export function isSimpleElement(v: any): boolean {
	return isElement(v) && isSimpleComponent(v.tag);
}

export function createElement<T extends DeliverComponent<any>>(
	tag: T,
	attrs?: (T extends DeliverComponent<infer P> ? {value: P} : never),
	...children: any[]
): Element;
export function createElement<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(
	tag: T,
	attrs?: P,
	...children: any[]
): Element;
export function createElement<T extends string>(
	tag: T,
	attrs?: Record<string, any>,
	...children: any[]
): Element;

export function createElement(
	tag: any,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element;
export function createElement(
	tag: any,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element {
	const attrProps = attrs ? {...attrs} : {};
	const props: Record<string, any> = {};
	for (const n of Object.keys(attrProps)) {
		if (n === '@') {
			props['n:on'] = attrProps[n];
			continue;
		}
		if (n[0] === '!') {
			props[`n:${ n.substr(1) }`] = attrProps[n];
			continue;
		}
		if (n[0] === '@') {
			props[`on:${ n.substr(1) }`] = attrProps[n];
			continue;
		}
		if (n.substr(0, 2) === 'n-') {
			props[`n:${ n.substr(2) }`] = attrProps[n];
			continue;
		}
		if (n.substr(0, 3) === 'on-') {
			const fn = attrProps[n];
			if (typeof fn === 'function' || fn === null || fn === undefined) {
				props[`on:${ n.substr(3) }`] = fn;
			}
			continue;
		}
		if (n.substr(0, 5) === 'hook-') {
			const fn = attrProps[n];
			if (typeof fn === 'function' || fn === null || fn === undefined) {
				props[`hook:${ n.substr(5) }`] = fn;
			}
			continue;
		}
		if (n.substr(0, 5) === 'data-') {
			props[`data:${ n.substr(5) }`] = attrProps[n];
		}
		props[n] = attrProps[n];
	}
	return createElementBase(tag, props, ...children);
}


export function createElementBase<T extends DeliverComponent<any>>(
	tag: T,
	attrs?: (T extends DeliverComponent<infer P> ? {value: P} : never),
	...children: any[]
): Element;
export function createElementBase<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(
	tag: T,
	attrs?: P,
	...children: any[]
): Element;
export function createElementBase<T extends string>(
	tag: T,
	attrs?: Record<string, any>,
	...children: any[]
): Element;
export function createElementBase<T extends Tag<any>>(
	tag: T,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element;
export function createElementBase<T extends Tag<any>>(
	tag: T,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element {
	const props: Record<string, any> = typeof attrs === 'object' && attrs || {};
	const node: Element = {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag,
		props,
		children,
		key: undefined,
	};
	if ('n:key' in props) { node.key = props['n:key']; }
	if ('n:slot' in props) { node.slot = props['n:slot']; }
	return node;
}

export function createRenderElement(
	render: (_?: any) => Node,
	{slot, key}: {slot?: string, key?: string} = {},
): Element {
	const node: Element = {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag: Render,
		props: {
			'n:key': key,
			'n:slot': slot,
		},
		children: [render],
		key, slot,
	};
	return node;
}


export function elements(
	node: any,
	opt: ElementIteratorOptions = {},
): any[] {
	if (Array.isArray(node)) {
		const list: any[][] = [];
		for (let n of node) {
			list.push(elements(n, opt));
		}
		return ([] as any[]).concat(...list);
	}
	if (!isElement(node)) { return [node]; }
	let { tag } = node;
	if (!tag) { return [node]; }

	if (tag === Template) {
		return elements(node.children, opt);
	}
	if (!isSimpleComponent(tag)) { return [node]; }
	const { simple } = opt;
	if (Array.isArray(simple)) {
		if (simple.includes(tag)) { return [node]; }
	} else if (typeof simple === 'function') {
		if (simple(tag)) { return [node]; }
	} else if (simple) {
		return [node];
	}
	return elements(node.children, opt);
}
export function equal(a: any, b: any): boolean {
	if (Object.is(a, b)) { return true; }
	if (!a) { return false; }
	if (!b) { return false; }
	if (typeof a !== 'object') { return false; }
	if (typeof b !== 'object') { return false; }
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) { return false; }
		if (a.length !== b.length) { return false; }
		for (let i = a.length - 1; i >= 0; i--) {
			if (!equal(a[i], b[i])) { return false; }
		}
		return true;
	}
	if (Array.isArray(b)) { return false; }
	if (!isElement(a)) { return false; }
	if (!isElement(b)) { return false; }
	if (a.tag !== b.tag) { return false; }
	if (a.execed !== b.execed) { return false; }
	if (a.inserted !== b.inserted) { return false; }
	if (a.isDefault !== b.isDefault) { return false; }
	if (a.key !== b.key) { return false; }
	if (a.slot !== b.slot) { return false; }
	const aprops = a.props;
	const bprops = b.props;
	if (Object.is(aprops, bprops)) { return equal(a.children, b.children); }
	if (!aprops) { return false; }
	if (!bprops) { return false; }
	if (typeof aprops !== 'object') { return false; }
	if (typeof bprops !== 'object') { return false; }
	const aKeys = new Set(Object.keys(aprops));
	const bKeys = Object.keys(bprops);
	if (aKeys.size !== bKeys.length) { return false; }
	for (const k of bKeys) {
		if (!aKeys.has(k)) { return false; }
		if (aprops[k] !== bprops[k]) { return false; }
	}
	return equal(a.children, b.children);
}

export function createTemplateElement(...children: any[]): Element {
	return {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag: Template,
		children,
	};
}
