import { Tag, NeepElement, Component } from '../type';
import { isElementSymbol, typeSymbol } from '../symbols';
import * as Tags from './tags';

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
	attrs?: {[key:string]: any},
	...children: any[]
): NeepElement {
	attrs = attrs ? {...attrs} : {};
	const node: NeepElement = {
		[isElementSymbol]: true,
		tag,
		children: [],
	};
	if ('key' in attrs) { node.key = attrs.key; }
	if ('slot' in attrs) { node.slot = attrs.slot; }
	if (typeof attrs.ref === 'function') { node.ref = attrs.ref; }
	if (tag === Tags.Value) {
		node.value = attrs.value;
		return node;
	}
	node.children = children;
	if (tag === Tags.Template) { return node; }
	if (tag === Tags.SlotRender) {
		node.render = attrs.render;
		return node;
	}
	if (tag === Tags.ScopeSlot || tag === Tags.Slot) {
		const { render, argv, args, name } = attrs;
		node.render = render;
		node.args = argv && [argv]
			|| Array.isArray(args) && args.length && args
			|| [{}];

		if (tag === Tags.ScopeSlot) {
			node.props = { name };
			return node;
		}
	}
	node.on = {};
	node.props = {};
	for (let k in attrs) {
		/** 事件 */
		const onInfo = /^(::|@|on:)([a-zA-Z0-9].*)$/.exec(k);
		if (onInfo) {
			node.on[onInfo[2]] = attrs[k];
			continue;
		}
		// TODO: data
		const nCmd = /^n([:-])([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)$/i.exec(k);
		/** 普通属性 */
		if (!nCmd) {
			node.props[k] = attrs[k];
			continue;
		}
	}
	return node;
}

export interface elementIteratorOptions {
	simple?: boolean | Component[] | ((c: Component) => boolean);
}

export function *elementIterator(
	node: any,
	opt: elementIteratorOptions = {},
): Iterable<any> {
	if (Array.isArray(node)) {
		for (let n of node) {
			yield * elementIterator(n, opt);
		}
		return;
	}
	if (!isElement(node)) { return yield node; }
	let { tag } = node;
	if (!tag) { return; }

	if (([Tags.Template, Tags.ScopeSlot] as Tag[]).includes(tag)) {
		yield* elementIterator(node.children, opt);
		return;
	}
	if (typeof tag !== 'function') { return yield node; }
	if (tag[typeSymbol] !== 'simple') { return yield node; }
	const { simple } = opt;
	if (!simple) { return yield node; }
	if (Array.isArray(simple)) {
		if (simple.includes(tag)) { return yield node; }
	} else if (typeof simple === 'function') {
		if (!simple(tag)) { return yield node; }
	}
	yield* elementIterator(node.children, opt);
}
