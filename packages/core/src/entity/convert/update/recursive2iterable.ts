type RecursiveItem<T> = T | RecursiveItem<T>[];
export default function *recursive2iterable<T>(
	list: RecursiveItem<T>,
): Iterable<T> {
	if (!Array.isArray(list)) {
		yield list;
		return;
	}
	for (const it of list) {
		yield *recursive2iterable(it);
	}
}
