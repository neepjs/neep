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
import { isTagName } from './utils';

const render: IRender = {
	type: 'web',
	nextFrame,
	isNode(v): v is NativeNode {
		return v instanceof Node;
	},
	mount({target, class: className, style, tag}, parent) {
		if (!isTagName(tag)) { tag = 'div'; }

		const container =
			render.createElement(tag, { class: className, style });

		if (typeof target === 'string') {
			target = document.querySelector(target);
		}
		if (target instanceof Element) {
			target.appendChild(container as any);
			if (parent) {
				return [container, parent.createPlaceholder()] as any;
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
	drawContainer(container, node, {target, class: className, style, tag}, parent) {
		render.updateProps(container as NativeElement, { class: className, style });
		if (typeof target === 'string') {
			target = document.querySelector(target);
		}
		if (parent !== render && !(target instanceof Element)) {
			target = document.body;
		}
		const oldTarget = parent === render && container === node
			? undefined : render.getParent(node);
		if (oldTarget === target) {
			return [container, node];
		}
		if (parent !== render) {
			target.appendChild(container);
			return [container, node];
		}
		if (!oldTarget) {
			const newNode = parent.createPlaceholder();
			const pNode = parent.getParent(node);
			if (pNode) {
				render.insertNode(pNode, newNode as any, node);
				render.removeNode(node);
			}
			return [container, newNode];
		}
		if (!target) {
			const pNode = parent.getParent(node);
			if (pNode) {
				render.insertNode(pNode, container, node);
				render.removeNode(node);
			}
			return [container, container];

		}
		target.appendChild(node);
		return [container, node];
	},
	drawNode() {},

	createElement(tag, props) {
		return update(createElement(tag), props) as any;
	},
	createText(text: string): NativeText {
		return document.createTextNode(text) as any;
	},
	createPlaceholder(): NativePlaceholder {
		return document.createComment('') as any;
	},
	createComponent(): [NativeComponent, NativeShadow] {
		const node = createElement('neep-component');
		return [node, node.attachShadow({ mode: 'open' })] as any;
	},

	getParent(node: NativeNode): NativeContainer | null {
		return (node as any).parentNode as NativeContainer | null;
	},
	nextNode(node: NativeNode): NativeNode | null {
		return (node as any).nextSibling as NativeContainer | null;
	},
	updateProps(node, props): void {
		update(node as any, props);
	},
	insertNode(
		parent: NativeContainer,
		node: NativeNode,
		next: NativeNode | null = null,
	): void {
		(parent as any).insertBefore(node, next);
	},
	removeNode(node: NativeNode): void {
		const p = render.getParent(node);
		if (!p) { return; }
		(p as any).removeChild(node);
	},
	getRect(node: NativeNode) {
		if (node instanceof Element) {
			const {
				top, right, bottom, left, width, height
			} = node.getBoundingClientRect();
			return { top, right, bottom, left, width, height };
		}
		if (node instanceof ShadowRoot) {
			const {
				top, right, bottom, left, width, height
			} = node.host.getBoundingClientRect();
			return { top, right, bottom, left, width, height };
		}
		return null;
	}
};

export default render;
