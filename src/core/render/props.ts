import { isValue } from '../auxiliary';

export function updateProps(
	obj: any,
	props: any,
	oldProps: any = {},
	define = false,
) {
	const newKeys = new Set(Reflect.ownKeys(props));
	for (const k of Reflect.ownKeys(obj)) {
		if (!newKeys.has(k)) {
			delete obj[k];
		}
	}
	if (!define) {
		for (const k of newKeys) {
			obj[k] = props[k];
		}
		return obj;
	}
	for (const k of newKeys) {
		const value = props[k];
		if (k in oldProps && oldProps[k] === value) {
			continue;
		}
		if (isValue(value)) {
			Reflect.defineProperty(obj, k, {
				configurable: true,
				enumerable: true,
				get() { return value(); },
				set(v) { value(v); }
			});
			continue;
		}
		Reflect.defineProperty(obj, k, {
			configurable: true,
			enumerable: true,
			value,
		});
	}
	return obj;
}