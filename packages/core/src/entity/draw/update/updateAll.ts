import {
	IRenderer,
	MountedNode,
	TreeNodeList,
	MountOptions,
} from '../../../types';
import createAll from '../create/createAll';
import createList from '../create/createList';
import createItem from '../create/createItem';
import unmount from '../unmount';
import getNodes from './getNodes';
import drawReplace from './drawReplace';
import getLastNode from './getLastNode';
import updateItem from './updateItem';
import updateList from './updateList';

/**
 * 更新树
 * @param tree 已有树
 * @param source 用于替换的源
 * @param renderer Neep 对象
 */


export default function updateAll(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNodeList,
	tree: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (source.length === 0) {
		return drawReplace(renderer, createAll(renderer, mountOptions, []), tree);
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
