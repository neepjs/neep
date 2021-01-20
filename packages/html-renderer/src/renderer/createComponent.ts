import createElement from './createElement';
import Neep from '@neep/core';

export default function createComponent(
	renderer: Neep.IRenderer,
): [Element, ShadowRoot] {
	const node = createElement('neep-component');
	return [node, node.attachShadow({ mode: 'open' })];

}
