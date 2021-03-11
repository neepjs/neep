import { NativeNode, MountNode } from '../../../types';


export type MountNodes = MountNode | MountNode[]
| (MountNode | MountNode[])[];


export default function *getNodes(tree: MountNodes): Iterable<NativeNode> {
	if (Array.isArray(tree)) {
		for (const it of tree) {
			yield *getNodes(it);
		}
		return;
	}
	const { node, proxy } = tree;
	if (node) {
		yield node;
		return;
	}
	if (proxy) {
		yield *getNodes(proxy.tree);
	}
}
