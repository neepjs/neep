
import update from './update';
import { IRender, Native } from '@neep/core';

const render: IRender = {
	type: 'html',
	isNode(v: any): v is Native.Node {
		return v instanceof Node;
	},
	mount({target}, type) {
		const node = document.createElement('div');
		if (typeof target === 'string') {
			target = document.querySelector(target);
		}
		if (target instanceof Element) {
			target.appendChild(node);
			if (type) {
				return [node, document.createComment('')] as any;
			}
			return [node, node] as any;
		}
		if (!type) {
			document.body.appendChild(node);
		}
		return [node, node] as any;
	},
	unmount(container, node, removed) {
		if (container === node && removed) { return; }
		(container as any as Element).remove();
	},
	darw() {},

	create(tag, props) {
		// TODO: NS
		return update(document.createElement(tag), props) as any;
	},
	text(text: string): Native.Text {
		return document.createTextNode(text) as any;
	},
	placeholder(): Native.Placeholder {
		return document.createComment('') as any;
	},
	component(): [Native.Component, Native.Shadow] {
		const node = document.createElement('neep-component');
		node.attachShadow({ mode: 'open' });
		return [node, node.attachShadow({ mode: 'open' })] as any;
	},

	parent(node: Native.Node): Native.Container | null {
		return (node as any).parentNode as Native.Container | null;
	},
	next(node: Native.Node): Native.Node | null {
		return (node as any).nextSibling as Native.Container | null;
	},
	update(node, props): void {
		update(node as any, props);
	},
	insert(parent: Native.Container, node: Native.Node, next: Native.Node | null = null): void {
		(parent as any).insertBefore(node, next);
	},
	remove(node: Native.Node): void {
		const p = render.parent(node);
		if (!p) { return; }
		(p as any).removeChild(node);
	},
};

export default render;
