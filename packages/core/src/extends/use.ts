import { isProduction } from '../constant/info';
import { assert } from '../Error';
import { UseData } from '../types';

export interface HookState {
	list: UseData[] | undefined;
	isInit: boolean;
	root?: UseData[];
	runs?: UseData[];
}

const destroyFns: Record<number, (c: any) => void> = Object.create(null);
let nextId = 1;


let isInit = false;
let hookList: UseData[] | undefined;
let root: UseData[] | undefined;
let runs: UseData[] | undefined;


export function hookSafe(): void {
	assert(
		isInit || !hookList || !hookList.length,
		'Inconsistent number of useService executions',
		'life',
	);
}

export function initHook(init: boolean, useData?: UseData[]): HookState {
	const state: HookState = isProduction
		? { list: hookList, isInit }
		: { list: hookList, isInit, root, runs };
	if (!useData) {
		isInit = false;
		hookList = undefined;
		if (!isProduction) {
			root = [];
			runs = [];
		}
		return state;
	}
	isInit = init;
	hookList = init ? useData : [...useData];
	if (!isProduction) {
		root = useData;
		runs = [];
	}
	return state;
}
export function restoreHookState(state: HookState): void {
	if (isProduction) {
		({ list: hookList, isInit } = state);
	} else {
		({ list: hookList, isInit, root, runs } = state);
	}
}
function printError(item?: UseData, isEnd?: boolean): string {
	if (isProduction) {
		// TODO
	} else {
		// TODO
	}
	return '';
}
export function createUse<T, P extends any[]>(p: {
	name: string,
	create?: (...p: P) => T,
	exec?: undefined,
	destroy?: ((c: T) => void),
}): (...p: P) => T;
export function createUse<T, P extends any[], R>(p: {
	name: string,
	create?: (...p: P) => T,
	exec: (c: T, ...p: P) => R,
	destroy?: ((c: T) => void),
}): (...p: P) => R;
export function createUse<T, P extends any[], R>({
	name,
	create = () => ({}) as T,
	destroy,
	exec = ((v: any) => v) as any,
}: {
	name: string,
	create?: (...p: P) => T,
	exec?: (c: T, ...p: P) => R,
	destroy?: ((c: T) => void),
}): (...p: P) => R {
	const id = nextId++;
	if (typeof destroy === 'function') {
		destroyFns[id] = destroy;
	}
	return (...p: P) => {
		assert(
			hookList,
			`Function \`${ name }\` can only be called within a cycle.`,
			'life',
		);
		if (isInit) {
			const list: UseData[] = [];
			const item: UseData = { id, value: create(...p) };
			const parent = hookList;
			hookList = list;
			try {
				return exec(item.value, ...p);
			} finally {
				if (list.length) {
					item.list = list;
				}
				hookList = parent;
			}
		}
		const item = hookList.shift();
		assert(item && item.id === id && item.list, () => printError(item), 'life');
		const { value } = item;

		const list = [...item.list];
		const parent = hookList;
		hookList = list;

		if (isProduction) {
			try {
				const ret = exec(value, ...p);
				assert(!list.length, '');
				return ret;
			} finally {
				hookList = parent;
			}
		} else {
			const runList: UseData[] = [];
			if (runs) {
				runs.push({ id, list: runList, value });
			}
			const runParent = runs;
			runs = runList;
			try {
				const ret = exec(value, ...p);
				assert(!list.length, () => printError(item, true), 'life');
				return ret;
			} finally {
				hookList = parent;
				runs = runParent;
			}
		}

	};
}

export function destroyUseData(data?: UseData[]): void {
	if (!data) { return; }
	for (const {id, value, list} of data) {
		destroyUseData(list);
		if (!(id in destroyFns)) { continue; }
		const destroy = destroyFns[id];
		destroy(value);
	}
}
