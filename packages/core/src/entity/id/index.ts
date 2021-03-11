import { NativeNode, MountNode, MountedNode } from '../../types';
import { isProduction } from '../../constant/info';
import { markRead, markChange } from '../../install/monitorable';

let ids = 0;
const Nodes: {[key: number]: MountNode} = {};
const IdMap = isProduction ? undefined : new WeakMap<NativeNode, number>();
export function createMountedNode(
	n: MountNode,
	id?: number,
): MountedNode {
	if (!isProduction) {
		id = id || ++ids;
		const { node } = n;
		if (node && IdMap) { IdMap.set(node, id); }
		const newNode = {...n, id} as MountedNode;
		Nodes[id] = newNode;
		markChange(Nodes, id);
		return newNode;
	}
	return {...n, id: 0} as MountedNode;
}

export function recoveryMountedNode(node: MountedNode): void {
	if (!isProduction) {
		delete Nodes[node.id];
	}
}

export function getNode(
	id: number | NativeNode,
): MountNode | undefined {
	if (!isProduction) {
		if (typeof id !== 'number') {
			id = IdMap?.get(id) || -1;
		}
		markRead(Nodes, id);
		return Nodes[id];
	}
	return undefined;
}
