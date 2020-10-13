import { isValue } from '../../auxiliary';
import { IRender, NativeNode, MountedNode, TreeNode } from '../../type';
import { createMountedNode } from '../id';
import { setRef, getNodes } from './utils';
import { isDeliver } from '../../auxiliary/deliver';

export function createValue(
	iRender: IRender,
	source: TreeNode,
	value: any,
): MountedNode {
	let { ref } = source;
	if (iRender.isNode(value)) {
		setRef(ref, value);
		return createMountedNode({
			...source,
			value,
			node: value,
			children: [],
			component: undefined,
		});
	}
	const type = typeof value;
	let node: NativeNode | undefined;
	if (
		type === 'bigint'
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'string'
		|| type === 'symbol'
		|| value instanceof RegExp
	) {
		node = iRender.createText(String(value));
	} else if (value instanceof Date) {
		node = iRender.createText(value.toISOString());
	} else if (type === 'object' && value) {
		node = iRender.createText(String(value));
		// TODO: 对象处理
	}
	if (!node) { node = iRender.createPlaceholder(); }
	setRef(ref, node);
	return createMountedNode({
		...source,
		value,
		node,
		component: undefined,
		children: [],
	});
}

export function createAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
): (MountedNode | MountedNode[])[] {
	if (!source.length) {
		return [createMountedNode({
			tag: null,
			node: iRender.createPlaceholder(),
			component: undefined,
			children: [],
		})];
	}

	return source.map(item =>
		Array.isArray(item)
			? createList(iRender, item)
			: createItem(iRender, item));
}

export function createList(
	iRender: IRender,
	source: TreeNode[],
): MountedNode[] {
	if (source.length) {
		return source.map(it => createItem(iRender, it));
	}
	return [createMountedNode({
		tag: null,
		node: iRender.createPlaceholder(),
		component: undefined,
		children: [],
	})];
}

export function createItem(
	iRender: IRender,
	source: TreeNode,
): MountedNode {
	const { tag, ref, component } = source;
	if (!tag) {
		const node = iRender.createPlaceholder();
		setRef(ref, node);
		return createMountedNode({
			tag: null,
			node,
			component: undefined,
			children: [],
		});
	}

	if (isDeliver(tag)) {
		// TODO: ref
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: createAll(iRender, source.children),
		});
	}

	const ltag = typeof tag !== 'string' ? '' : tag.toLowerCase();
	if (typeof tag !== 'string' || ltag === 'neep:container') {
		if (!component) {
			// TODO: ref
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: createAll(iRender, source.children),
			});
		}
		component.mount();
		setRef(ref, component.exposed);
		return createMountedNode({
			...source,
			node: undefined,
			component, children: [],
		});
	}
	if (ltag === 'neep:value') {
		let {value} = source;
		if (isValue(value)) { value = value(); }
		return createValue(iRender, source, value);
	}
	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		// TODO: ref
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: createAll(iRender, source.children),
		});
	}
	const node = iRender.createElement(tag);
	setRef(ref, node);
	let children: (MountedNode | MountedNode[])[] = [];
	if (source.children?.length) {
		children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insertNode(node, it);
		}
	}
	iRender.updateProps(node, source.props || {});
	return createMountedNode({
		...source,
		node,
		component: undefined,
		children,
	});
}
