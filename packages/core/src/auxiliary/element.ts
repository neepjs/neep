import { Tag, NeepElement, Component } from '../type';
import { isElementSymbol, typeSymbol } from '../symbols';
import { Value, Template, SlotRender, ScopeSlot, Slot } from './tags';

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
		children: [],
	};
	if ('n:key' in attrs) { node.key = attrs.key; }
	else if ('n-key' in attrs) { node.key = attrs.key; }
	if ('slot' in attrs) { node.slot = attrs.slot; }
	if (typeof attrs.ref === 'function') { node.ref = attrs.ref; }
	if (tag === Value) {
		node.value = attrs.value;
		return node;
	}
	node.children = children;
	if (tag === Template) { return node; }
	if (tag === SlotRender) {
		node.render = attrs.render;
		return node;
	}
	if (tag === ScopeSlot || tag === Slot) {
		const { render, argv, args, name } = attrs;
		node.render = render;
		node.args = argv && [argv]
			|| Array.isArray(args) && args.length && args
			|| [{}];

		if (tag === ScopeSlot) {
			node.props = { name };
			return node;
		}
	}
	node.props = {};
	for (let k in attrs) {
		node.props[k] = attrs[k];
	}
	return node;
}

export interface elementIteratorOptions {
	simple?: boolean | Component[] | ((c: Component) => boolean);
}

export function elements(
	node: any,
	opt: elementIteratorOptions = {},
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
