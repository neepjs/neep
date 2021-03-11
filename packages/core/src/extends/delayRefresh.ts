let delayedRefresh = 0;
const objectSet = new Set<{refresh(): void}>();
export function wait(obj: {refresh(): void}): boolean {
	if (delayedRefresh <= 0) { return false; }
	objectSet.add(obj);
	return true;
}
function run(): void {
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
function delayRefresh<T>(f: () => T, async?: false): T;
function delayRefresh<T>(
	f: () => PromiseLike<T> | T,
	async: true,
): Promise<T>;
function delayRefresh<T>(
	f: () => PromiseLike<T> | T,
	async?: boolean,
): PromiseLike<T> | T;
function delayRefresh<T>(
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
export default  delayRefresh;
