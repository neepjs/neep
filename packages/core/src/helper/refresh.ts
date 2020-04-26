import { EntityObject } from '../entity';

let delayedRefresh = 0;
const objectSet = new Set<EntityObject>();
export function wait(obj: EntityObject) {
	if (delayedRefresh <= 0) { return false; }
	objectSet.add(obj);
	return true;
}
function run() {
	if (delayedRefresh > 0) { return; }
	const list = [...objectSet];
	objectSet.clear();
	list.forEach(o => o.refresh());
}
async function asyncRefresh<T>(f: () => PromiseLike<T> | T): Promise<T> {
	try {
		delayedRefresh++;
		return await f();
	} finally {
		delayedRefresh--;
		run();
	}
}
export default function refresh<T>(f: () => T, async?: false): T;
export default function refresh<T>(
	f: () => PromiseLike<T> | T,
	async: true,
): Promise<T>;
export default function refresh<T>(
	f: () => PromiseLike<T> | T,
	async?: boolean,
): PromiseLike<T> | T;
export default function refresh<T>(
	f: () => PromiseLike<T> | T,
	async?: boolean,
): PromiseLike<T> | T {
	if (async) { return asyncRefresh(f); }
	try {
		delayedRefresh++;
		return f();
	} finally {
		delayedRefresh--;
		run();
	}
}
