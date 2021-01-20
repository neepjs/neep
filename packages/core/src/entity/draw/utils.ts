import { IRenderer, NativeNode, MountedNode, MountNode } from '../../type';
import { recoveryMountedNode } from '../id';


type MountedNodes = MountedNode | MountedNode[]
| (MountedNode | MountedNode[])[];


type MountNodes = MountNode | MountNode[]
| (MountNode | MountNode[])[];


export function *getNodes(tree: MountNodes): Iterable<NativeNode> {
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

export function unmount(renderer: IRenderer, tree?: MountedNodes): void {
	if (!tree) { return; }
	if (Array.isArray(tree)) {
		tree.forEach(e => unmount(renderer, e));
		return;
	}
	recoveryMountedNode(tree);
	if (tree.proxy) {
		const { proxy } = tree;
		proxy.unmount();
		return;
	}
	if (tree.node) {
		const { node } = tree;
		renderer.removeNode(node);
	}
	unmount(renderer, tree.children);
}
