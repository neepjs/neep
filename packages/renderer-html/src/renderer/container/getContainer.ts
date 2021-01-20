import Neep from '@neep/core';

export default function getContainer(
	renderer: Neep.IRenderer,
	container: Element,
	target: any,
	next: any,
): [Element | null, Element | null] {
	if (typeof target === 'string') {
		target = document.querySelector(target);
	}
	if (target === null) { return [null, null]; }
	if (!(target instanceof Element)) {
		target = document.body;
	}
	if (typeof next === 'string') {
		next = document.querySelector(next);
	}
	if (!(next instanceof Element) || next.parentElement !== target) {
		next = null;
	}
	return [target, next];
}
