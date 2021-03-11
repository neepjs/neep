import { Component } from '../../types';
import {
	Fragment,
	Render,
	Slot,
	ScopeSlot,
	Container,
} from '../../constant/tags';
import { components as globalComponents } from '../../register';


export function findComponent(
	tag: any,
	components: Record<string, Component<any>>[],
	native?: boolean,
): Component<any> | string | null {
	if (!tag) { return null; }
	if (typeof tag !== 'string') { return tag; }
	if (/^core:/i.test(tag)) {
		let ltag = tag.toLowerCase();
		if (ltag === Container) { return ltag; }
		if (ltag === ScopeSlot) { return ltag; }
		if (ltag === Render) { return ltag; }
		if (ltag === Slot) { return native ? 'slot' : ScopeSlot; }
		return Fragment;
	}
	if (tag === Fragment) { return tag; }
	if (tag === 'slot') { return tag; }
	for (const list of components) {
		const component = list[tag];
		if (component) { return component; }
	}
	return globalComponents[tag] || tag;
}
