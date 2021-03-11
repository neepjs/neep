import { ComponentEntity, ContextData } from '../types';
import { assert } from '../Error';
import { hookSafe, initHook, restoreHookState } from './use';


let current: ContextData | undefined;

export function runCurrent<P extends any[], R>(
	newContextData: ContextData,
	entity: ComponentEntity<any> | undefined,
	fn: (...p: P) => R,
	...p: P
): R {


	const oldCurrent = current;
	current = newContextData;

	const hookState = initHook(
		!newContextData.created,
		entity && newContextData.useData,
	);

	try {
		const ret = fn(...p);
		if (entity) { hookSafe(); }
		return ret;
	} finally {
		current = oldCurrent;
		restoreHookState(hookState);
	}
}

export function checkCurrent(
	name: string,
): ContextData {
	assert(
		current,
		`Function \`${ name }\` can only be called within a cycle.`,
		'life',
	);
	return current;
}
