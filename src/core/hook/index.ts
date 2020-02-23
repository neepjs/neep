import { monitorable } from '../install';
import { Exposed } from '../type';
/** 全局钩子 */
interface Hook {
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
	let hooks = Hooks;
	if (exposed && typeof exposed === 'object') {
		hooks = monitorable.getMapValue<Exposed, typeof Hooks>(
			ExposedHooks,
			exposed,
			() => Object.create(null)
		);
	}
	let set = hooks[id];
	if (!set) {
		set = new Set();
		hooks[id] = set;
	}
	set.add(hook);
	return () => set.delete(hook);
}

export function callHook<H extends Hooks>(id: H, exposed: Exposed): void;
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
