import { NeepElement, TreeNode } from '../../type';
import { isElement } from '../../auxiliary';
import { isElementSymbol } from '../../symbols';

/** 强制转换为 NeepElement */
export function toElement(t: any): null | NeepElement {
	if (t === false || t === null || t === undefined) {
		return null;
	}
	if (isElement(t)) {
		return t;
	}
	return {
		[isElementSymbol]: true,
		tag: 'Neep:Value',
		key: t,
		value: t,
		children: [],
	};
}

export function destroy(
	tree: TreeNode | TreeNode[] | (TreeNode | TreeNode[])[],
): void {
	if (Array.isArray(tree)) {
		tree.forEach(t => destroy(t));
		return;
	}
	const { component } = tree;
	if (component) { component.destroy(); }
}