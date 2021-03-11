import { NativeNode } from '../../../types';
import { MountNodes } from './getNodes';


export default function getFirstNode(tree: MountNodes): NativeNode {
	if (Array.isArray(tree)) { return getFirstNode(tree[0]); }
	if (tree.node) { return tree.node; }
	return getFirstNode(tree.proxy.tree);
}
