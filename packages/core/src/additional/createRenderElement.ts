import { Element, Node } from '../types';
import { objectTypeSymbol, objectTypeSymbolElement } from '../constant/symbols';
import { Render } from '../constant/tags';


export default function createRenderElement(
	render: (_?: any) => Node,
	{slot, key}: {slot?: string, key?: string} = {},
): Element {
	const node: Element = {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag: Render,
		props: {
			'n:key': key,
			'n:slot': slot,
		},
		children: [render],
		key, slot,
	};
	return node;
}
