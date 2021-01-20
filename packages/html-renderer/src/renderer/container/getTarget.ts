import Neep from '@neep/core';
import { isValue } from '../../install/neep';

export default function getTarget(
	renderer: Neep.IRenderer,
	container: Element,
	target: any,
	parent?: Neep.IRenderer,
): Neep.UpdateContainerResult {
	if (isValue(target)){ target = target.value; }
	if (target === null) {
		return {
			target: container as any,
			insert: null,
			next: null,
		};
	 }
	if (typeof target === 'string') {
		target = document.querySelector(target);
	}
	if (target instanceof Element) {
		return {
			target,
			insert: null,
			next: null,
		} as any;
	}
	return {
		target: null,
		insert: null,
		next: null,
	};

}
