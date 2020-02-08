import Entity from '../Entity';
import NeepError from '../Error';

/** 当前正在执行的对象 */
export let current: Entity<any, any> | undefined;
export function setCurrent<T>(fn: () => T, obj: Entity<any, any>): T {
	const old = current;
	current = obj;
	try {
		return fn();
	} finally {
		current = old;
	}
}

export function checkCurrentObject(
	name: string,
	initonly = false,
): Entity<any, any> {
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
