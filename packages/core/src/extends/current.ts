import { ComponentEntity, UseHook, Label } from '../type';
import { assert } from '../Error';
import { isProduction } from '../constant';


/** 当前正在执行的对象 */
export let current: ComponentEntity<any, any> | undefined;
let isInit = false;
let root: UseHook[] = [];
let hookList: UseHook[] = [];
let runs: UseHook[] = [];
export function getUseHookValue<T>(
	name: string,
	lib: string,
	init: (entity: ComponentEntity<any, any>) => T,
): T {
	assert(
		current,
		`Function \`${ name }\` can only be called within a cycle.`,
		'life',
	);
	if (isInit) {
		const value = init(current);
		hookList.push({ name, lib, value });
		return value;
	}
	const next = hookList.shift();
	assert(next && next.name === name && next.lib === lib && !next.list, '');
	if (!isProduction) {
		runs.push({ name, lib });
	}
	return next.value;
}
export function execUseHooks<T>(
	name: string,
	lib: string,
	run: (entity: ComponentEntity<any, any>
	) => T,
): T {
	assert(
		current,
		`Function \`${ name }\` can only be called within a cycle.`,
		'life',
	);
	if (isInit) {
		const list: UseHook[] = [];
		hookList.push({ name, lib, list });
		const parent = hookList;
		hookList = list;
		try {
			return run(current);
		} finally {
			hookList = parent;
		}
	}
	const next = hookList.shift();
	assert(next && next.name === name && next.lib === lib && next.list, '');
	const parent = hookList;
	const list = [...next.list];
	hookList = list;

	if (isProduction) {
		try {
			const ret = run(current);
			assert(!list.length, '');
			return ret;
		} finally {
			hookList = parent;
		}
	} else {
		const runList: UseHook[] = [];
		runs.push({ name, lib, list: runList });
		const runParent = runs;
		runs = runList;
		try {
			const ret = run(current);
			assert(!list.length, '');
			return ret;
		} finally {
			hookList = parent;
			runs = runParent;
		}
	}


}

export let setLabels: ((l: Label[] | undefined) => void) | undefined;

export function runShell<T>(
	setLabel: typeof setLabels,
	fn: () => T,
): T {
	if (!isProduction) {
		const oldSetLabel = setLabels;
		setLabels = setLabel;
		try {
			return fn();
		} finally {
			setLabels = oldSetLabel;
		}
	}
	return fn();
}

export function runCurrent<T>(
	entity: ComponentEntity<any, any>,
	setLabel: typeof setLabels,
	fn: () => T,
): T {

	const oldSetLabel = setLabels;
	if (!isProduction) {
		setLabels = setLabel;
	}

	const oldEntity = current;
	current = entity;

	const oldIsInit = isInit;
	isInit = !entity.created;
	const oldRuns = runs;
	runs = [];
	const oldRoot = root;
	root = current.$_useHookValues;
	const oldHookList = hookList;
	hookList = isInit ? root : [...root];

	try {
		const ret = fn();
		assert(
			isInit || !hookList.length,
			'Inconsistent number of useService executions',
			'life',
		);
		return ret;
	} finally {
		current = oldEntity;
		isInit = oldIsInit;
		hookList = oldHookList;
		runs = oldRuns;
		root = oldRoot;

		if (!isProduction) {
			setLabels = oldSetLabel;
		}
	}
}

export function checkCurrent(
	name: string,
	initOnly = false,
): ComponentEntity<any, any> {
	assert(
		current,
		`Function \`${ name }\` can only be called within a cycle.`,
		'life',
	);
	assert(
		!initOnly || !current.created,
		`Function \`${ name }\` can only be called at initialization time.`,
		'life',
	);
	return current;
}
