import Neep from '@neep/core';

export default function unmountContainer(
	renderer: Neep.IRenderer,
	container: Element,
	node: Neep.NativeNode | undefined | null,
): void {
	if (node === null) {
		(container as any as Element).remove();
	}
}
