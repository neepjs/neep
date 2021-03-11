import { TreeNode } from '../../../types';
import BaseProxy from '../../proxy/BaseProxy';
import destroy from '../destroy';
import toElement from '../toElement';
import createItem from '../create/createItem';
import updateItem from './updateItem';
import recursive2iterable from './recursive2iterable';

/**
 * 更新树节点
 * @param proxy Neep 对象
 * @param source 用于替换的源
 * @param tree 已有树
 */
export default function updateList(
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
		const index = tree.findIndex(it => it.tag === node.tag && it.key === node.key);
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
