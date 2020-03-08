import { monitorable } from './install';
import { Exposed } from './type';
/** 全局钩子 */
export interface Hook {
	(nObjcet: Exposed): void
}
export type Hooks = 'beforeInit' | 'inited'
	| 'beforeDestroy' | 'destroyed'
	| 'beforeUpdate' | 'updated'
	| 'beforeMount' | 'mounted'
	| 'beforeDraw' | 'drawed'
	| 'beforeDrawAll' | 'drawedAll'
;
const Hooks: Record<string, Set<Hook>> = Object.create(null);
const ExposedHooks: WeakMap<Exposed, typeof Hooks> = new WeakMap();

function getHooks(key?: Exposed): typeof Hooks {
	if (!(key && typeof key === 'object')) { return Hooks; }
	let value = ExposedHooks.get(key);
	if (!value) {
		value = Object.create(null) as typeof Hooks;
		ExposedHooks.set(key, value);
	}
	return value;
}


export function setHook<H extends Hooks>(
	id: H,
	hook: Hook,
	exposed?: Exposed,
):() => void;
export function setHook(
	id: string,
	hook: Hook,
	exposed?: Exposed,
): () => void;

export function setHook(
	id: string,
	hook: Hook,
	exposed?: Exposed,
):() => void {
	hook = monitorable.safeify(hook);
	const hooks = getHooks(exposed);
	let set = hooks[id];
	if (!set) {
		set = new Set();
		hooks[id] = set;
	}
	set.add(hook);
	return () => set.delete(hook);
}

export function callHook<H extends Hooks>(
	id: H,
	exposed: Exposed,
): void;
export function callHook(id: string, exposed: Exposed): void;
export function callHook(id: string, exposed: Exposed): void {
	const exposedhooks = ExposedHooks.get(exposed);
	const exposedList = exposedhooks?.[id];
	for (const hook of exposedList || []) {
		hook(exposed);
	}
	for (const hook of Hooks[id] || []) {
		hook(exposed);
	}
}
