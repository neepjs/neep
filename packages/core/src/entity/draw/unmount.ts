import { IRenderer, MountedNode } from '../../types';
import { recoveryMountedNode } from '../id';


export type MountedNodes = MountedNode | MountedNode[]
| (MountedNode | MountedNode[])[];

export default function unmount(renderer: IRenderer, tree?: MountedNodes): void {
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
