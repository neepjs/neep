export interface RecursiveArray<T> extends Array<RecursiveItem<T>>{};
export type RecursiveItem<T> = T | RecursiveArray<T>;

export function *recursive2iterable<T>(
	list: RecursiveItem<T>,
): Iterable<T> {
	if (!Array.isArray(list)) {
		yield list;
		return;
	}
	for (const it of list) {
		yield* recursive2iterable(it);
	}
}
