import { Native } from '../type';
import { isProduction } from '../constant';
import { MountedNode } from 'core/draw';

let ids = 0;
const Nodes: {[key: number]: MountedNode} = {};
let IdMap: undefined | Map<Native.Node, number>;
if (!isProduction) {
	IdMap = new Map();
}
export function createMountedNode(
	n: Omit<MountedNode, 'id'>,
	id?: number,
): MountedNode {
	if (!isProduction) {
		id = id || ++ids;
		const { node } = n;
		if (node && IdMap) { IdMap.set(node, id); }
		return Nodes[id] = {...n, id};
	}
	return {...n, id: 0};
}

export function recoveryMountedNode(node: MountedNode): void {
	if (!isProduction) {
		delete Nodes[node.id];
	}
}

export function getNode(
	id: number | Native.Node,
): MountedNode | undefined {
	if (!isProduction) {
		if (typeof id !== 'number') {
			id = IdMap?.get(id) || -1;
		}
		return Nodes[id];
	}
	return undefined;
}
