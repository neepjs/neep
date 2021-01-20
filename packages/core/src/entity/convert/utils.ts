import { Element, TreeNode, ValueElement, TreeNodeList } from '../../type';
import { isElement } from '../../auxiliary';

/** 强制转换为 Element */
export function toElement(t: any): null | Element | ValueElement {
	if (t === false || t === null || t === undefined) {
		return null;
	}
	if (isElement(t)) {
		return t;
	}
	return { key: t, props: {value: t}, children: [] };
}

export function destroy(
	tree: TreeNode | TreeNode[] | null | TreeNodeList,
): void {
	if (!tree) { return; }
	if (Array.isArray(tree)) {
		tree.forEach(t => destroy(t));
		return;
	}
	const { proxy } = tree;
	if (proxy) {
		return proxy.destroy();
	}
}
