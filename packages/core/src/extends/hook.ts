import { safeify } from '../install/monitorable';
import { Hook, HookName, HookData } from '../types';

export function setHook<H extends HookName>(
	id: H,
	hook: Hook,
	contextData: HookData,
): () => void;
export function setHook(
	id: string,
	hook: Hook,
	contextData: HookData,
): () => void;

export function setHook(
	id: string,
	hook: Hook,
	contextData: HookData,
): () => void {
	let {hooks} = contextData;
	if (!hooks) { return () => {}; }
	hook = safeify(hook);
	let set = hooks[id];
	if (!set) {
		set = new Set();
		hooks[id] = set;
	}
	set.add(hook);
	return () => set.delete(hook);
}

export function callHook<H extends HookName>(
	id: H,
	contextData: HookData,
): void;
export function callHook(
	id: string,
	contextData: HookData,
): void;
export function callHook(
	id: string,
	{hooks}: HookData,
): void {
	if (!hooks) { return; }
	for (const hook of hooks[id] || []) {
		hook();
	}
}
