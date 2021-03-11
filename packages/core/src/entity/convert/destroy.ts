import { TreeNode, TreeNodeList } from '../../types';


export default function destroy(
	tree: TreeNode | TreeNode[] | null | TreeNodeList,
): void {
	if (!tree) { return; }
	if (Array.isArray(tree)) {
		tree.forEach(t => destroy(t));
		return;
	}
	const { proxy } = tree;
	if (proxy) {
		proxy.destroy();
	}
}
