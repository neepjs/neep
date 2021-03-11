import { NativeNode } from '../../../types';
import { MountNodes } from './getNodes';

export default function getLastNode(tree: MountNodes): NativeNode {
	if (Array.isArray(tree)) {
		return getLastNode(tree[tree.length - 1]);
	}
	if (tree.node) { return tree.node; }
	return getLastNode(tree.proxy.tree);
}
