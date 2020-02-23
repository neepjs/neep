import NeepError from '../Error';
import { Exposed } from '../type';

/** 当前正在执行的对象 */
export let current: Exposed | undefined;
export function setCurrent<T>(fn: () => T, obj: Exposed): T {
	const old = current;
	current = obj;
	try {
		return fn();
	} finally {
		current = old;
	}
}

export function checkCurrent(
	name: string,
	initonly = false,
): Exposed {
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
