import { Tag, NeepElement, ElementIteratorOptions } from '../type';
import { isElementSymbol, typeSymbol } from '../symbols';
import { Value, Template, ScopeSlot } from './tags';

/**
 * 判读是否为元素
 */
export function isElement(v: any): v is NeepElement {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	return v[isElementSymbol] === true;
}

export function createElement(
	tag: Tag,
	attrs?: {[key: string]: any},
	...children: any[]
): NeepElement {
	attrs = attrs ? {...attrs} : {};
	const node: NeepElement = {
		[isElementSymbol]: true,
		tag,
		key: undefined,
		props: attrs,
		children,
	};
	if ('n:key' in attrs) { node.key = attrs.key; }
	else if ('n-key' in attrs) { node.key = attrs.key; }
	if ('slot' in attrs) { node.slot = attrs.slot; }
	if (typeof attrs['n:ref'] === 'function') {
		node.ref = attrs['n:ref'];
	} else if (typeof attrs['n-ref'] === 'function') {
		node.ref = attrs['n-ref'];
	} else if (typeof attrs.ref === 'function') {
		node.ref = attrs.ref;
	}
	if (tag === Value) {
		node.value = attrs.value;
	}
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

	if (([Template, ScopeSlot] as Tag[]).includes(tag)) {
		return elements(node.children, opt);
	}
	if (typeof tag !== 'function') { return [node]; }
	if (tag[typeSymbol] !== 'simple') { return [node]; }
	const { simple = true } = opt;
	if (!simple) { return [node]; }
	if (Array.isArray(simple)) {
		if (simple.includes(tag)) { return [node]; }
	} else if (typeof simple === 'function') {
		if (!simple(tag)) { return [node]; }
	}
	return elements(node.children, opt);
}

export function equalProps(a?: any, b?: any): boolean {
	if (a === b) { return true; }
	if (!a) { return false; }
	if (!b) { return false; }
	if (typeof a !== 'object') { return false; }
	if (typeof b !== 'object') { return false; }
	const aKeys = new Set(Reflect.ownKeys(a));
	const bKeys = Reflect.ownKeys(b);
	if (aKeys.size !== bKeys.length) { return false; }
	for (const k of bKeys) {
		if (!aKeys.has(k)) { return false; }
		if (a[k] !== b[k]) { return false; }
	}
	return true;
}
export function equal(a: any, b: any): boolean {
	if (typeof a !== typeof b) { return false; }
	if (a === b) { return true; }
	if (typeof a === 'function') { return false; }
	if (!a) { return false; }
	if (!b) { return false; }
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) { return false; }
		if (a.length !== b.length) { return false; }
		for (let i = a.length - 1; i >= 0; i--) {
			if (!equal(a[i], b[i])) { return false; }
		}
		return true;
	}
	if (Array.isArray(b)) {
		return false;
	}
	if (!isElement(a)) { return false; }
	if (!isElement(b)) { return false; }
	if (a.tag !== b.tag) { return false; }
	if (a.execed !== b.execed) { return false; }
	if (a.inserted !== b.inserted) { return false; }
	if (a.ref !== b.ref) { return false; }
	if (a.value !== b.value) { return false; }
	if (a.key !== b.key) { return false; }
	if (a.slot !== b.slot) { return false; }
	return equalProps(a.props, b.props)
		&& equal(a.children, b.children);
}
