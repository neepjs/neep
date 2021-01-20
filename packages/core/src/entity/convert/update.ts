import { Node, TreeNode, ValueElement, TreeNodeList } from '../../type';
import { recursive2iterable } from '../recursive';
import BaseProxy from '../proxy/BaseProxy';
import { toElement, destroy } from './utils';
import { createItem } from './create';

/**
 * 更新树节点
 * @param proxy Neep 对象
 * @param source 用于替换的源
 * @param tree 已有树
 */
function updateList(
	proxy: BaseProxy<any>,
	source: any[],
	tree: TreeNode | null | TreeNode[],
): TreeNode[] {
	if (!tree) { tree = []; }
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: TreeNode[] = [];
	for (const src of recursive2iterable(source)) {
		const node = toElement(src);
		if (!node) { continue; }
		const index = tree.findIndex(it =>
			it.tag === node.tag && it.key === node.key);
		if (index >= 0) {
			const newNode = updateItem(
				proxy,
				node,
				tree[index],
			);
			if (newNode) {
				newList.push(newNode);
			}
			tree.splice(index, 1);
		} else {
			const newNode = createItem(proxy, node);
			if (newNode) {
				newList.push(newNode);
			}
		}
	}
	destroy(tree);
	return newList;
}

/**
 * 更新树节点
 * @param tree 已有树
 * @param source 用于替换的源
 * @param proxy Neep 对象
 */
function updateItem(
	proxy: BaseProxy<any>,
	source: Node | ValueElement,
	tree?: TreeNode | null | TreeNode[],
): TreeNode | null {
	if (!tree) {
		return createItem(proxy, source);
	}
	if (!source) {
		destroy(tree);
		return null;
	}
	if (Array.isArray(tree)) {
		if (!tree.length) {
			return createItem(proxy, source);
		}
		const index = tree.findIndex(it => it.tag === source.tag);
		if (index < 0) {
			destroy(tree);
			return createItem(proxy, source);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		destroy(all);
	}
	if (source.tag !== tree.tag) {
		destroy(tree);
		return createItem(proxy, source);
	}
	if (tree.proxy) {
		const { proxy } = tree;
		const { props = {}, key } = source;
		proxy.update(source.props || {}, source.children || []);
		return { tag: tree.tag, props, key, proxy };
	}
	destroy(tree);
	return createItem(proxy, source);
}


export function *updateAll(
	proxy: BaseProxy<any>,
	source: any,
	tree: TreeNodeList,
): Iterable<TreeNode | null | TreeNode[]> {
	if (!Array.isArray(source)) { source = [source]; }
	let index = 0;
	let length = Math.min(source.length || 1, tree.length);
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			yield updateList(proxy, src, tree[index]);
		} else {
			yield updateItem(proxy, toElement(src), tree[index]);
		}
	}
	length = Math.max(source.length, source.length);
	if (tree.length > index) {
		// 销毁多余项
		for (; index < length; index++) {
			destroy(tree[index]);
		}
	}
	if (source.length > index) {
		// 创建多余项
		for (; index < length; index++) {
			const src = toElement(source[index]);
			if (Array.isArray(src)) {
				yield src.flat(Infinity)
					.map(it => createItem(proxy, it))
					.filter(Boolean) as TreeNode[];
			} else {
				yield createItem(proxy, src);
			}
		}
	}
}
