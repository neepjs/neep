import Neep from '@neep/core';
import createComponent from './createComponent';
import createElement from './createElement';
import createPlaceholder from './createPlaceholder';
import createText from './createText';
import getParent from './getParent';
import insertNode from './insertNode';
import updateProps from './updateProps';
import nextFrame from './nextFrame';
import mountContainer from './container/mountContainer';
import unmountContainer from './container/unmountContainer';
import updateContainer from './container/updateContainer';
import removeNode from './removeNode';
import getContainer from './container/getContainer';

const renderer: Neep.IRenderer = {
	type: 'html',
	nextFrame,
	isNode(v): v is Neep.NativeNode {
		return v instanceof Node;
	},
	getContainer(container, target, next) {
		return getContainer(this, container as any, target, next) as any;
	},
	mountContainer(data, props, emit, parent) {
		return mountContainer(this, data, props, emit, parent) as any;
	},
	updateContainer(container, target, insert, next, data, props, emit, parent) {
		return updateContainer(this, container as any, data, props, emit, parent) as any;
	},
	recoveryContainer() {},
	unmountContainer(container, data, props, parent) {
		return unmountContainer(this, container as any, data);
	},
	getMountOptions(){},

	createElement(data) {
		if (!data || typeof data !== 'string') { return null;  }
		return createElement(data) as any;
	},
	createText(text: string): Neep.NativeTextNode {
		return createText(text) as any;
	},
	createPlaceholder(): Neep.NativePlaceholderNode {
		return createPlaceholder() as any;
	},
	createComponent(): [Neep.NativeComponentNode, Neep.NativeShadowNode] {
		return createComponent(this) as any;
	},

	getParent(node: Neep.NativeNode): Neep.NativeContainerNode | null {
		return getParent(node as any) as Neep.NativeContainerNode | null;
	},
	nextNode(node: Neep.NativeNode): Neep.NativeNode | null {
		return (node as any).nextSibling as Neep.NativeContainerNode | null;
	},
	updateProps(node, data, props, emit) {
		updateProps(this, node as any, props, emit);
	},
	insertNode(
		parent: Neep.NativeContainerNode,
		node: Neep.NativeNode,
		next: Neep.NativeNode | null = null,
	): void {
		return insertNode(parent as any, node as any, next as any);
	},
	removeNode(node: Neep.NativeNode): void {
		return removeNode(this, node as any);
	},
};

export default renderer;
