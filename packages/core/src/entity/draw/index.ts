import { IRender, MountedNode, TreeNode } from '../../type';
import { updateAll } from './update';
import { createAll } from './create';
export { unmount, getNodes, setRefList } from './utils';

export default function draw(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree?: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (tree) {
		return updateAll(iRender, source, tree);
	}
	return createAll(iRender, source);
}
