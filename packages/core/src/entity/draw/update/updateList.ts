import {
	IRenderer,
	MountNode,
	TreeNode,
	MountedNode,

	MountOptions,
} from '../../../types';
import createItem from '../create/createItem';
import unmount from '../unmount';
import getNodes from './getNodes';
import drawReplace from './drawReplace';
import drawPlaceholder from '../create/drawPlaceholder';
import getLastNode from './getLastNode';
import getFirstNode from './getFirstNode';
import updateItem from './updateItem';

export default function updateList(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode[],
	tree: MountedNode | MountedNode[],
): MountedNode[] {
	if (!source.length) {
		const node = drawPlaceholder(renderer);
		return [drawReplace(renderer, node, tree)];
	}
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: MountedNode[] = [];
	const list = [...tree];
	const mountedMap = new Map<MountNode, MountNode>();
	for (const src of source) {
		const index = list.findIndex(it => it.tag === src.tag && it.key === src.key && it.proxy === src.proxy);
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
		return drawReplace(renderer, newList, list);
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
