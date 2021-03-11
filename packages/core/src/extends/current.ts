import { ComponentEntity, Label, ContextData } from '../types';
import { assert } from '../Error';
import { hookSafe, HookState, initHook, restoreHookState } from './use';


export let setLabels: ((l: Label[] | undefined) => void) | undefined;
let current: ContextData | undefined;

export function runCurrent<P extends any[], R>(
	newContextData: ContextData,
	entity: ComponentEntity<any> | undefined,
	fn: (...p: P) => R,
	...p: P
): R {


	const oldCurrent = current;
	current = newContextData;

	const hookState: HookState = entity
		? initHook(!newContextData.created, newContextData.useData)
		: initHook(false);

	try {
		const ret = fn(...p);
		if (entity) { hookSafe(); }
		return ret;
	} finally {
		current = oldCurrent;
		restoreHookState(hookState);
	}
}
export function runCurrentWithLabel<P extends any[], R>(
	newContextData: ContextData,
	entity: ComponentEntity<any> | undefined,
	setLabel: typeof setLabels,
	fn: (...p: P) => R,
	...p: P
): R {
	const oldCurrent = current;
	current = newContextData;

	const hookState: HookState = entity
		? initHook(!newContextData.created, newContextData.useData)
		: initHook(false);

	const oldSetLabel = setLabels;
	setLabels = setLabel;

	try {
		const ret = fn(...p);
		if (entity) { hookSafe(); }
		return ret;
	} finally {
		current = oldCurrent;
		restoreHookState(hookState);
		setLabels = oldSetLabel;
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
