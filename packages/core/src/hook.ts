import { safeify } from './install/monitorable';
import { Hook, HookName, HookEntity, ComponentEntity, ContainerEntity } from './type';
const hooks: Record<string, Set<Hook>> = Object.create(null);

export function setHook<H extends HookName, T extends HookEntity<any, any>>(
	id: H,
	hook: Hook<T>,
	entity: T,
): () => void;
export function setHook<T extends HookEntity<any, any>>(
	id: string,
	hook: Hook<T>,
	entity: T,
): () => void;
export function setHook<H extends HookName>(
	id: H,
	hook: Hook,
	entity?: HookEntity<any, any>,
): () => void;
export function setHook(
	id: string,
	hook: Hook,
	entity?: HookEntity<any, any>,
): () => void;

export function setHook(
	id: string,
	hook: Hook,
	entity?: HookEntity<any, any>,
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

export function callHook<H extends HookName>(
	id: H,
	entity: ComponentEntity<any, any> | ContainerEntity<any>,
): void;
export function callHook(
	id: string,
	entity: ComponentEntity<any, any> | ContainerEntity<any>,
): void;
export function callHook(
	id: string,
	entity: ComponentEntity<any, any> | ContainerEntity<any>,
): void {
	if (!entity) { return; }
	for (const hook of entity.$_hooks[id] || []) {
		hook(entity);
	}
	for (const hook of hooks[id] || []) {
		hook(entity);
	}
}
