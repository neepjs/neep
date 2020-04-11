import {
	IRender,
	NativeNode,
	NativeText,
	NativePlaceholder,
	NativeComponent,
	NativeShadow,
	NativeContainer,
	NativeElement,
} from '@neep/core';
import update from './update';
import nextFrame from './nextFrame';
import createElement from './createElement';

const render: IRender = {
	type: 'web',
	nextFrame,
	isNode(v): v is NativeNode {
		return v instanceof Node;
	},
	mount({target, class: className, style, tag}, isValue, parent) {
		if (!(
			typeof tag === 'string' &&
			/^[a-z][a-z0-9]*(?:\-[a-z0-9]+)?(?:\:[a-z0-9]+(?:\-[a-z0-9]+)?)?$/i.test(tag)
		)) {
			tag = 'div';
		}
		const container = render.create(tag, { class: className, style }, isValue);
		if (typeof target === 'string') {
			target = document.querySelector(target);
		}
		if (target instanceof Element) {
			target.appendChild(container as any);
			if (parent) {
				return [container, parent.placeholder] as any;
			}
			return [container, container];
		}
		if (parent !== render) {
			document.body.appendChild(container as any);
			return [container, container] as any;
		}
		return [container, container] as any;
	},
	unmount(container, node, removed) {
		if (container === node && removed) { return; }
		(container as any as Element).remove();
	},
	drawContainer(container, node, {target, class: className, style, tag}, isValue, parent) {
		render.update(container as NativeElement, { class: className, style }, isValue);
		if (typeof target === 'string') {
			target = document.querySelector(target);
		}
		if (parent !== render && !(target instanceof Element)) {
			target = document.body;
		}
		const oldTarget = parent === render && container === node ? undefined : render.parent(node);
		if (oldTarget === target) {
			return [container, node];
		}
		if (parent !== render) {
			target.appendChild(container);
			return [container, node];
		}
		if (!oldTarget) {
			const newNode = parent.placeholder();
			const pNode = parent.parent(node);
			if (pNode) {
				render.insert(pNode, newNode as any, node);
				render.remove(node);
			}
			return [container, newNode];
		}
		if (!target) {
			const pNode = parent.parent(node);
			if (pNode) {
				render.insert(pNode, container, node);
				render.remove(node);
			}
			return [container, container];

		}
		target.appendChild(node);
		return [container, node];
	},
	draw() {},

	create(tag, props, isValue) {
		return update(createElement(tag), props, isValue) as any;
	},
	text(text: string): NativeText {
		return document.createTextNode(text) as any;
	},
	placeholder(): NativePlaceholder {
		return document.createComment('') as any;
	},
	component(): [NativeComponent, NativeShadow] {
		const node = createElement('neep-component');
		return [node, node.attachShadow({ mode: 'open' })] as any;
	},

	parent(node: NativeNode): NativeContainer | null {
		return (node as any).parentNode as NativeContainer | null;
	},
	next(node: NativeNode): NativeNode | null {
		return (node as any).nextSibling as NativeContainer | null;
	},
	update(node, props, isValue): void {
		update(node as any, props, isValue);
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
