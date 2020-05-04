import { safeify } from './install';
import { Hook, Hooks, Entity } from './type';
const hooks: Record<string, Set<Hook>> = Object.create(null);

export function setHook<H extends Hooks>(
	id: H,
	hook: Hook,
	entity?: Entity,
): () => void;
export function setHook(
	id: string,
	hook: Hook,
	entity?: Entity,
): () => void;

export function setHook(
	id: string,
	hook: Hook,
	entity?: Entity,
): () => void {
	let list = entity?.$_hooks || hooks;
	if (!list) { return () => {}; }
	hook = safeify(hook);
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
	exposed: Entity,
): void;
export function callHook(id: string, exposed: Entity): void;
export function callHook(id: string, exposed: Entity): void {
	if (!exposed) { return; }
	for (const hook of exposed.$_hooks[id] || []) {
		hook(exposed);
	}
	for (const hook of hooks[id] || []) {
		hook(exposed);
	}
}
