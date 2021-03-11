import { Node, TreeNode, ValueElement } from '../../../types';
import BaseProxy from '../../proxy/BaseProxy';
import destroy from '../destroy';
import createItem from '../create/createItem';

/**
 * 更新树节点
 * @param tree 已有树
 * @param source 用于替换的源
 * @param proxy Neep 对象
 */
export default function updateItem(
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
