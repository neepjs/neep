import Neep from '@neep/core';
import update from '../updateProps';
import getTarget from './getTarget';

export default function updateContainer(
	renderer: Neep.IRenderer,
	container: Element,
	element: Neep.Node,
	{target, ...props}: Record<string, any>,
	emit: Neep.Emit<Record<string, any>>,
	parent?: Neep.IRenderer,
): Neep.UpdateContainerResult {
	update(renderer, container, element?.props || props, emit);
	return getTarget(renderer, container, target, parent);
}
