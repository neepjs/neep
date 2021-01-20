import Neep from '@neep/core';
import getTarget from './getTarget';
import updateProps from '../updateProps';
import createElement from '../createElement';

export default function mountContainer(
	renderer: Neep.IRenderer,
	element: Neep.Node,
	{target: targetProps, ...props}: Record<string, any>,
	emit: Neep.Emit<Record<string, any>>,
	parent?: Neep.IRenderer,
): Neep.MountContainerResult {
	const container = createElement('div') as any;
	updateProps(renderer, container, element?.props || props, emit);
	return {
		...getTarget(renderer, container, targetProps, parent),
		container,
		exposed: null,
	};
}
