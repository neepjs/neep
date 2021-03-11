import { IRenderer } from '../../../types';
import unmount, { MountedNodes } from '../unmount';
import getNodes, { MountNodes } from './getNodes';
import getFirstNode from './getFirstNode';


export default function drawReplace<T extends MountNodes>(
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
