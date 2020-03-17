import NeepError from '../Error';
import { Entity } from '../type';

/** 当前正在执行的对象 */
export let current: Entity | undefined;
export function setCurrent<T>(
	fn: () => T,
	entity: Entity,
): T {
	const oldEntity = current;
	current = entity;
	try {
		return fn();
	} finally {
		current = oldEntity;
	}
}

export function checkCurrent(
	name: string,
	initonly = false,
): Entity {
	if (!current) {
		throw new NeepError(
			`Function \`${name}\` can only be called within a cycle.`,
			'life',
		);
	}
	if (!initonly) {
		return current;
	}
	if (!current.inited) {
		return current;
	}
	throw new NeepError(
		`Function \`${name}\` can only be called at initialization time.`,
		'life',
	);
}
