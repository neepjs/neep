export default function insertNode(
	parent: Node & ParentNode,
	node: Node,
	next: Node | null = null,
): void {
	parent.insertBefore(node, next);
}
