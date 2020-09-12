import { isValue } from '../../auxiliary';
import { IRender, NativeNode, NativeElement, MountedNode, TreeNode } from '../../type';
import { createMountedNode } from '../id';
import { createItem, createAll, createValue, createList } from './create';
import { getNodes, unmount, setRef } from './utils';


type MountedNodes = MountedNode | MountedNode[]
| (MountedNode | MountedNode[])[];

function getLastNode(tree: MountedNodes): NativeNode {
	if (Array.isArray(tree)) {
		return getLastNode(tree[tree.length - 1]);
	}
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getLastNode(component.tree); }
	return getLastNode(children);
}

function getFirstNode(tree: MountedNodes): NativeNode {
	if (Array.isArray(tree)) { return getFirstNode(tree[0]); }
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getFirstNode(component.tree); }
	return getFirstNode(children[0]);
}

function replace<T extends MountedNode | MountedNode[]>(
	iRender: IRender,
	newTree: T,
	oldTree: MountedNode | MountedNode[],
): T {
	const next = getFirstNode(oldTree);
	if (!next) { return newTree; }
	const parent = iRender.getParent(next);
	if (!parent) { return newTree; }
	for (const it of getNodes(newTree)) {
		iRender.insertNode(parent, it, next);
	}
	unmount(iRender, oldTree);
	return newTree;
}

function updateList(
	iRender: IRender,
	source: TreeNode[],
	tree: MountedNode | MountedNode[],
): MountedNode[] {
	if (!source.length) {
		const node = createItem(iRender, {tag: null, children: []});
		return [replace(iRender, node, tree)];
	}
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: MountedNode[] = [];
	const list = [...tree];
	const mountedMap = new Map<MountedNode, MountedNode>();
	for (const src of source) {
		const index = list.findIndex(it =>
			it.tag === src.tag && it.key === src.key);
		if (index >= 0) {
			const old = list[index];
			const item = updateItem(iRender, src, old);
			mountedMap.set(old, item);
			newList.push(item);
			list.splice(index, 1);
		} else {
			const item = createItem(iRender, src);
			newList.push(item);
		}
	}
	if (!mountedMap.size) {
		return replace(iRender, newList, list);
	}
	unmount(iRender, list);
	tree = tree.filter(t => mountedMap.has(t));
	const last = getLastNode(tree[tree.length - 1]);
	const parent = iRender.getParent(last);
	if (!parent) { return newList; }
	let next = iRender.nextNode(last);
	// 调整次序
	for (let i = newList.length - 1; i >= 0; i--) {
		const item = newList[i];
		const index = tree.findIndex(o => mountedMap.get(o) === item);
		if (index >= 0) {
			for (const it of tree.splice(index)) {
				mountedMap.delete(it);
			}
		} else {
			for (const it of getNodes(item)) {
				iRender.insertNode(parent, it, next);
			}
		}
		next = getFirstNode(item) || next;
	}
	return newList;
}
/**
 * 更新树
 * @param tree 已有树
 * @param source 用于替换的源
 * @param iRender Neep 对象
 */
export function updateAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	let index = 0;
	let length = Math.min(source.length, tree.length);
	const list: (MountedNode | MountedNode[])[] = [];
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			list.push(updateList(iRender, src, tree[index]));
		} else {
			list.push(updateItem(iRender, src, tree[index]));
		}
	}
	length = Math.max(source.length, tree.length);
	if (tree.length > index) {
		// 销毁多余项
		for (; index < length; index++) {
			unmount(iRender, tree[index]);
		}
	}
	if (source.length > index) {
		// 创建多余项
		const last = getLastNode(list[list.length - 1]);
		const parent = iRender.getParent(last);
		const next = iRender.nextNode(last);
		for (; index < length; index++) {
			const src = source[index];
			const item = Array.isArray(src)
				? createList(iRender, src)
				: createItem(iRender, src);
			list.push(item);
			if (!parent) { continue; }
			for (const it of getNodes(item)) {
				iRender.insertNode(parent, it, next);
			}
		}
	}
	return list;
}

/**
 * 更新树节点
 * @param iRender Neep 对象
 * @param tree 已有树
 * @param source 用于替换的源
 */
function updateItem(
	iRender: IRender,
	source: TreeNode,
	tree: MountedNode | MountedNode[],
): MountedNode {
	if (Array.isArray(tree)) {
		const index = tree.findIndex(it =>
			it.tag === source.tag && it.component === source.component);
		if (index < 0) {
			return replace(iRender, createItem(iRender, source), tree);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		unmount(iRender, all);
	}
	const { tag, component } = source;
	const ref = source.ref !== tree.ref && source.ref || undefined;
	if (tag !== tree.tag || component !== tree.component) {
		return replace(iRender, createItem(iRender, source), tree);
	}
	if (!tag) { return tree; }
	const ltag = typeof tag !== 'string' ? '' : tag.toLowerCase();
	if (typeof tag !== 'string' || ltag === 'neep:container') {
		if (!component) {
			// TODO: ref
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: updateAll(
					iRender,
					source.children,
					tree.children,
				),
			}, tree.id);
		}
		setRef(ref, component.exposed);
		return createMountedNode({
			...source,
			node: undefined,
			component,
			children: [],
		}, tree.id);
	}
	if (ltag === 'neep:value') {
		let {value} = source;
		if (isValue(value)) { value = value(); }
		if (tree.value === value) {
			setRef(ref, tree.node);
			return createMountedNode({
				...tree,
				...source,
				value,
				children: [],
			}, tree.id);
		}
		return replace(iRender, createValue(iRender, source, value), tree);
	}
	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		// TODO: ref
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: updateAll(
				iRender,
				source.children,
				tree.children,
			),
		}, tree.id);
	}
	const { node } = tree;
	setRef(ref, node);
	let children: (MountedNode | MountedNode[])[] = [];
	if (!source.children.length && tree.children.length) {
		unmount(iRender, tree.children);
	} else if (source.children.length && tree.children.length) {
		children = updateAll(iRender, source.children, tree.children);
	} else if (source.children.length && !tree.children.length) {
		children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insertNode(node as NativeElement, it);
		}
	}
	iRender.updateProps(node as NativeElement, source.props || {});
	return createMountedNode({...tree, ...source, children}, tree.id);
}
