
import update from './update';
import {
	IRender,
	NativeNode,
	NativeText,
	NativePlaceholder,
	NativeComponent,
	NativeShadow,
	NativeContainer,
} from '@neep/core';

const render: IRender = {
	type: 'html',
	isNode(v): v is NativeNode {
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
	text(text: string): NativeText {
		return document.createTextNode(text) as any;
	},
	placeholder(): NativePlaceholder {
		return document.createComment('') as any;
	},
	component(): [NativeComponent, NativeShadow] {
		const node = document.createElement('neep-component');
		node.attachShadow({ mode: 'open' });
		return [node, node.attachShadow({ mode: 'open' })] as any;
	},

	parent(node: NativeNode): NativeContainer | null {
		return (node as any).parentNode as NativeContainer | null;
	},
	next(node: NativeNode): NativeNode | null {
		return (node as any).nextSibling as NativeContainer | null;
	},
	update(node, props): void {
		update(node as any, props);
	},
	insert(
		parent: NativeContainer,
		node: NativeNode,
		next: NativeNode | null = null,
	): void {
		(parent as any).insertBefore(node, next);
	},
	remove(node: NativeNode): void {
		const p = render.parent(node);
		if (!p) { return; }
		(p as any).removeChild(node);
	},
};

export default render;
