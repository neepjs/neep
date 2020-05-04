import { IRender, NativeNode, Exposed, Ref, MountedNode } from '../../type';
import { recoveryMountedNode } from '../id';

let refList: (() => void)[] | undefined;
export function setRefList(list?: (() => void)[]): void {
	refList = list;
}
export function setRef(
	ref?: Ref,
	node?: Exposed | NativeNode,
	isRemove?: boolean,
): void {
	if (typeof ref !== 'function') { return; }
	if (!node) { return; }
	if (!refList) {
		ref(node, isRemove);
	} else {
		refList.push(() => ref(node, isRemove));
	}
}

type MountedNodes = MountedNode | MountedNode[]
| (MountedNode | MountedNode[])[];


export function *getNodes(tree: MountedNodes): Iterable<NativeNode> {
	if (Array.isArray(tree)) {
		for (const it of tree) {
			yield *getNodes(it);
		}
		return;
	}
	const { children, node, component } = tree;
	if (node) {
		yield node;
		return;
	}
	if (component) {
		yield *getNodes(component.tree);
		return;
	}
	yield *getNodes(children);
}

export function unmount(iRender: IRender, tree: MountedNodes): void {
	if (Array.isArray(tree)) {
		tree.forEach(e => unmount(iRender, e));
		return;
	}
	const { component, children, node, ref } = tree;
	recoveryMountedNode(tree);
	if (node) {
		setRef(ref, node, true);
		iRender.removeNode(node);
		return;
	}
	if (component) {
		setRef(ref, component.exposed, true);
		component.unmount();
		return;
	}
	unmount(iRender, children);
}
