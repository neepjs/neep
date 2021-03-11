import {
	IRenderer,

	TreeNode,
	MountedNode,

	MountOptions,
} from '../../../types';
import { createMountedNode } from '../../id';
import createItem from '../create/createItem';
import unmount from '../unmount';
import drawReplace from './drawReplace';
import drawPlaceholder from '../create/drawPlaceholder';

/**
 * 更新树节点
 * @param renderer Neep 对象
 * @param tree 已有树
 * @param source 用于替换的源
 */
export default function updateItem(
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
		return drawReplace(renderer, drawPlaceholder(renderer), tree);
	}
	if (Array.isArray(tree)) {
		const index = tree.findIndex(it => it.tag === source.tag && it.proxy === source.proxy);
		if (index < 0) {
			return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		unmount(renderer, all);
	}

	if (source.proxy) {
		const { proxy } = source;
		if (proxy !== tree.proxy) {
			return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
		}
		return createMountedNode({
			...source,
			node: undefined,
			proxy,
		}, tree.id);
	}
	if (tree.proxy || source.tag !== tree.tag) {
		return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
	}
	if (source.tag === undefined) { return tree; }
	return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
}
