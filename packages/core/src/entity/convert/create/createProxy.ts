import { Element } from '../../../types';
import ContainerProxy from '../../proxy/ContainerProxy';
import BaseProxy from '../../proxy/BaseProxy';
import DeliverProxy from '../../proxy/DeliverProxy';
import GroupProxy from '../../proxy/GroupProxy';
import ElementProxy from '../../proxy/ElementProxy';
import ShellProxy from '../../proxy/ShellProxy';
import { Container, Fragment, ScopeSlot } from '../../../constant/tags';
import {
	isDeliverComponent,
	isSimpleComponent,
	isContainerComponent,
	isShellComponent,
	isRenderComponent,
	isElementComponent,
} from '../../../is';
import SlotProxy from '../../proxy/SlotProxy';
import RenderComponentProxy from '../../proxy/RenderComponentProxy';
import StandardComponentProxy from '../../proxy/StandardComponentProxy';
import { recognize } from '../../../extends/recognizer';

export default function createProxy(
	proxy: BaseProxy<any>,
	{ tag, props, children, isDefault }: Element,
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
