import { TreeNode, TreeNodeList } from '../../../types';
import BaseProxy from '../../proxy/BaseProxy';
import destroy from '../destroy';
import toElement from '../toElement';
import createItem from '../create/createItem';
import updateItem from './updateItem';
import updateList from './updateList';


export default function *updateAll(
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
