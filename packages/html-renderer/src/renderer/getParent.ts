export default function getParent(node: Node): (Node & ParentNode) | null {
	return node.parentNode;
}
