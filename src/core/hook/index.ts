import { monitorable } from '../install';
import NeepObject from 'core/Object';
/** 全局钩子 */
interface GHook {
	(nObjcet: NeepObject):void
}
type Hooks = 'beforeInit' | 'inited'
	| 'beforeDestroy' | 'destroyed'
	| 'beforeUpdate' | 'updated'
	| 'beforeMount' | 'mounted'
	| 'beforeDraw' | 'drawed'
	| 'beforeDrawAll' | 'drawedAll'
;
const hooks: Map<any, Set<GHook>> = new Map();

export function setHook<H extends Hooks>(id: H, hook: GHook):() => void;
export function setHook(id: any, hook: GHook):() => void;
export function setHook(id: any, hook: GHook):() => void {
	hook = monitorable.safeify(hook);
	const set = monitorable.getMepValue(hooks, id, () => new Set);
	set.add(hook);
	return () => set.delete(hook);
}

export function callHook<H extends Hooks>(id: H, obj: NeepObject): void;
export function callHook(id: any, obj: NeepObject): void;
export function callHook(id: any, nObjcet: NeepObject): void {
	const list = hooks.get(id);
	if (!list) { return; }
	for (const hook of list) {
		hook(nObjcet);
	}
}
