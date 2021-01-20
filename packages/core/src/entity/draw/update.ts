import {
	IRenderer,
	NativeNode,
	MountNode,
	TreeNode,
	MountedNode,
	TreeNodeList,
	MountOptions,
} from '../../type';
import { createMountedNode } from '../id';
import { createItem, createList, createPlaceholder, createAll } from './create';
import { getNodes, unmount } from './utils';


type MountedNodes = MountedNode | MountedNode[]
| (MountedNode | MountedNode[])[];
type MountNodes = MountNode | MountNode[]
| (MountNode | MountNode[])[];

function getLastNode(tree: MountNodes): NativeNode {
	if (Array.isArray(tree)) {
		return getLastNode(tree[tree.length - 1]);
	}
	if (tree.node) { return tree.node; }
	return getLastNode(tree.proxy.tree);
}

function getFirstNode(tree: MountNodes): NativeNode {
	if (Array.isArray(tree)) { return getFirstNode(tree[0]); }
	if (tree.node) { return tree.node; }
	return getFirstNode(tree.proxy.tree);
}

export function replace<T extends MountNodes>(
	renderer: IRenderer,
	newTree: T,
	oldTree: MountedNodes,
): T {
	const next = getFirstNode(oldTree);
	if (!next) { return newTree; }
	const parentNode = renderer.getParent(next);
	if (!parentNode) { return newTree; }
	for (const it of getNodes(newTree)) {
		renderer.insertNode(parentNode, it, next);
	}
	unmount(renderer, oldTree);
	return newTree;
}

function updateList(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode[],
	tree: MountedNode | MountedNode[],
): MountedNode[] {
	if (!source.length) {
		const node = createPlaceholder(renderer);
		return [replace(renderer, node, tree)];
	}
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: MountedNode[] = [];
	const list = [...tree];
	const mountedMap = new Map<MountNode, MountNode>();
	for (const src of source) {
		const index = list.findIndex(it =>
			it.tag === src.tag && it.key === src.key && it.proxy === src.proxy);
		if (index >= 0) {
			const old = list[index];
			const item = updateItem(renderer, mountOptions, src, old);
			mountedMap.set(old, item);
			newList.push(item);
			list.splice(index, 1);
		} else {
			const item = createItem(renderer, mountOptions, src);
			newList.push(item);
		}
	}
	if (!mountedMap.size) {
		return replace(renderer, newList, list);
	}
	unmount(renderer, list);
	tree = tree.filter(t => mountedMap.has(t));
	const last = getLastNode(tree.map(t => mountedMap.get(t)).filter(Boolean) as MountNode[]);
	const parentNode = renderer.getParent(last);
	if (!parentNode) { return newList; }
	let next = renderer.nextNode(last);
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
				renderer.insertNode(parentNode, it, next);
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
 * @param renderer Neep 对象
 */
export function updateAll(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNodeList,
	tree: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (source.length === 0) {
		return replace(renderer, createAll(renderer, mountOptions, []), tree);
	}
	let index = 0;
	let length = Math.min(source.length, tree.length);
	const list: (MountedNode | MountedNode[])[] = [];
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			list.push(updateList(renderer, mountOptions, src, tree[index]));
		} else {
			list.push(updateItem(renderer, mountOptions, src, tree[index]));
		}
	}
	length = Math.max(source.length, tree.length);
	if (tree.length > index) {
		// 销毁多余项
		for (; index < length; index++) {
			unmount(renderer, tree[index]);
		}
	}
	if (source.length > index) {
		// 创建多余项
		const last = getLastNode(list[list.length - 1]);
		const parentNode = renderer.getParent(last);
		const next = renderer.nextNode(last);
		for (; index < length; index++) {
			const src = source[index];
			const item = Array.isArray(src)
				? createList(renderer, mountOptions, src)
				: createItem(renderer, mountOptions, src);
			list.push(item);
			if (!parentNode) { continue; }
			for (const it of getNodes(item)) {
				renderer.insertNode(parentNode, it, next);
			}
		}
	}
	return list;
}

/**
 * 更新树节点
 * @param renderer Neep 对象
 * @param tree 已有树
 * @param source 用于替换的源
 */
function updateItem(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode | null,
	tree: MountedNode | MountedNode[],
): MountedNode {
	if (!source) {
		if (Array.isArray(tree)) {
			if (tree.length === 1 && tree[0].tag === null) {
				return tree[0];
			}
		} else if (tree.tag === null) {
			return tree;
		}
		return replace(renderer, createPlaceholder(renderer), tree);
	}
	if (Array.isArray(tree)) {
		const index = tree.findIndex(it =>
			it.tag === source.tag && it.proxy === source.proxy);
		if (index < 0) {
			return replace(renderer, createItem(renderer, mountOptions, source), tree);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		unmount(renderer, all);
	}

	if (source.proxy) {
		const { proxy} = source;
		if (proxy !== tree.proxy) {
			return replace(renderer, createItem(renderer, mountOptions, source), tree);
		}
		return createMountedNode({
			...source,
			node: undefined,
			proxy,
		}, tree.id);
	}
	if (tree.proxy || source.tag !== tree.tag) {
		return replace(renderer, createItem(renderer, mountOptions, source), tree);
	}
	if (source.tag === undefined) { return tree; }
	return replace(renderer, createItem(renderer, mountOptions, source), tree);
}
