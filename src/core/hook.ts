import { monitorable } from './install';
import { Exposed, Hook, Hooks } from './type';
const hooks: Record<string, Set<Hook>> = Object.create(null);


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
	let list = hooks;
	if (exposed) {
		if (!exposed.$__hooks) {
			list = {}
			Reflect.defineProperty(exposed, '$__hooks', {
				configurable: true,
				value: list,
			});
		} else {
			list = exposed.$__hooks;
		}
	}
	hook = monitorable.safeify(hook);
	let set = list[id];
	if (!set) {
		set = new Set();
		list[id] = set;
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
	if (!exposed) { return; }
	for (const hook of exposed.$__hooks?.[id] || []) {
		hook(exposed);
	}
	for (const hook of hooks[id] || []) {
		hook(exposed);
	}
}
