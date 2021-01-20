import {
	Node,
	TreeNode,
	Element,
	ValueElement,
	TreeNodeList,
} from '../../type';
import ContainerProxy from '../proxy/ContainerProxy';
import BaseProxy from '../proxy/BaseProxy';
import DeliverProxy from '../proxy/DeliverProxy';
import ValueProxy from '../proxy/ValueProxy';
import GroupProxy from '../proxy/GroupProxy';
import ElementProxy from '../proxy/ElementProxy';
import ShellProxy from '../proxy/ShellProxy';
import { toElement } from './utils';
import { Container, Fragment, ScopeSlot } from '../../auxiliary';
import {
	isDeliverComponent,
	isSimpleComponent,
	isContainerComponent,
	isShellComponent,
	isRenderComponent,
	isElementComponent,
} from '../../is';
import SlotProxy from '../proxy/SlotProxy';
import RenderComponentProxy from '../proxy/RenderComponentProxy';
import StandardComponentProxy from '../proxy/StandardComponentProxy';
import { recognize } from '../../extends/recognizer';

function createProxy(
	proxy: BaseProxy<any>,
	{tag, props, children, isDefault }: Element,
): BaseProxy<any> {
	if (tag === Container) {
		return new ContainerProxy(tag, null, props, children, proxy);
	}
	if (tag === ScopeSlot) {
		return new SlotProxy(children, proxy, isDefault);
	}
	if (tag === Fragment) {
		return new GroupProxy(tag, children, proxy);
	}
	if (typeof tag === 'string') {
		if (tag.substr(0, 5) === 'core:') {
			return new GroupProxy(tag, children, proxy);
		}
		return new ElementProxy(tag, tag, props || {}, children, proxy);
	}
	const componentTag = recognize(tag);
	if (typeof componentTag !== 'function') {
		return new GroupProxy(tag, children, proxy);
	}
	if (isShellComponent(componentTag)) {
		return new ShellProxy(tag, componentTag, props || {}, children, proxy);
	}
	if (isDeliverComponent(componentTag)) {
		return new DeliverProxy(tag, componentTag, props || {}, children, proxy);
	}
	if (isContainerComponent(componentTag)) {
		return new ContainerProxy(tag, componentTag, props, children, proxy);
	}
	if (isElementComponent(componentTag)) {
		return new ElementProxy(tag, componentTag, props || {}, children, proxy);
	}
	if (isSimpleComponent(componentTag)) {
		// TODO: label
		return new GroupProxy(tag, children, proxy);
	}
	if (isRenderComponent(componentTag)) {
		// TODO
		return new RenderComponentProxy(tag, componentTag, props || {}, children, proxy);
	}
	return new StandardComponentProxy(tag, componentTag, props || {}, children, proxy);
}

export function createItem(
	proxy: BaseProxy<any>,
	source: Node | ValueElement,
): TreeNode | null {
	if (!source) { return null; }
	if (!source.tag) {
		const { key, props } = source;
		return { key, props, proxy: new ValueProxy(
			source.props || {},
			proxy,
		) };
	}
	const { tag, key, props } = source;
	return { tag, key, props, proxy: createProxy(proxy, source) };
}

export function createAll(
	proxy: BaseProxy<any>,
	source: any,
): TreeNodeList {
	if (!Array.isArray(source)) { source = [source]; }
	if (!source.length) { return []; }
	return (source as any[]).map(item => {
		if (!Array.isArray(item)) {
			return createItem(proxy, toElement(item));
		}

		return item.flat(Infinity)
			.map(it => createItem(proxy, toElement(it)))
			.filter(Boolean) as TreeNode[];
	});
}
