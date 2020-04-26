import { isValue } from '../auxiliary';
const disabledKey = new Set([
	':', '@', '#', '*',
	'!', '%', '^', '~',
	'&', '=', '+', '.',
	'(', ')', '[', ']', '{', '}', '<', '>',
]);
function filter(k: string | number | symbol) {
	if (typeof k !== 'string') { return true; }
	if (disabledKey.has(k[0])) { return false; }
	if (/^n[:-]/.test(k)) { return false; }
	if (/^on[:-]/.test(k)) { return false; }
	return true;
}
export function updateProps(
	obj: any,
	props: any,
	oldProps: any = {},
	define = false,
	isProps = false,
) {
	const keys = Reflect.ownKeys(props);
	const newKeys = new Set(isProps ? keys.filter(filter) : keys);
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
				set(v) { value(v); },
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
