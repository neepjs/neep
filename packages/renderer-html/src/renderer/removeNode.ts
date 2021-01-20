import Neep from '@neep/core';

export default function removeNode(
	renderer: Neep.IRenderer,
	node: Node,
): void {
	const p = renderer.getParent(node as any) as any;
	if (!p) { return; }
	p.removeChild(node);
}
