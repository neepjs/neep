import { encase } from '../install';
import { isElement } from '../auxiliary';
import { CustomEqual } from '../type';

const NativeTypes = [
	Date, RegExp, Set, Map, WeakMap, WeakSet,
	ArrayBuffer, SharedArrayBuffer, DataView,
	Uint8Array, Uint16Array, Uint32Array, BigUint64Array,
	Int8Array, Int16Array, Int32Array, BigInt64Array,
	Float64Array, Float32Array, Uint8ClampedArray,
];

class Stack extends Map<object, Set<object>> {
	compared(a: object, b: object): boolean {
		let compared = true;
		let set = this.get(a);
		if (!set) {
			compared = false;
			this.set(a, new Set([b]));
		} else if (!set.has(b)) {
			compared = false;
			set.add(b);
		}
		set = this.get(b);
		if (!set) {
			compared = false;
			this.set(b, new Set([a]));
		} else if (!set.has(a)) {
			compared = false;
			set.add(a);
		}
		return compared;
	}
}

const customEquals = new Set<CustomEqual>();

export function equalItem(a: any, b: any, stack: Stack): boolean {
	if (typeof a !== typeof b) { return false; }
	if (a === b) { return true; }
	if (typeof a === 'function') { return false; }
	if (!a) { return false; }
	if (!b) { return false; }
	if (encase(a) !== a) { return false; }
	if (encase(b) !== b) { return false; }
	for (const T of NativeTypes) {
		if (a instanceof T) { return false; }
		if (b instanceof T) { return false; }
	}
	if (stack.compared(a, b)) { return true; }
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) { return false; }
		if (a.length !== b.length) { return false; }
		for (let i = a.length - 1; i >= 0; i--) {
			if (!equalItem(a[i], b[i], stack)) { return false; }
		}
		return true;
	}
	if (Array.isArray(b)) {
		return false;
	}
	if (isElement(a)) {
		if (!isElement(b)) { return false; }
		if (a.tag !== b.tag) { return false; }
		if (a.execed !== b.execed) { return false; }
		if (a.inserted !== b.inserted) { return false; }
		if (a.ref !== b.ref) { return false; }
		if (a.value !== b.value) { return false; }
		if (a.key !== b.key) { return false; }
		if (a.slot !== b.slot) { return false; }
		return equalItem(a.props, b.props, stack)
			&& equalItem(a.children, b.children, stack);
	}
	if (isElement(b)) {
		return false;
	}
	for (const customEqual of new Set(customEquals)) {
		const r = customEqual(a, b, (x, y) => equalItem(x, y, stack));
		if (typeof r === 'boolean') {
			return r;
		}
	}
	const aKeys = new Set(Reflect.ownKeys(a));
	const bKeys = Reflect.ownKeys(b);
	if (aKeys.size !== bKeys.length) { return false; }
	for (const k of bKeys) {
		if (!aKeys.has(k)) { return false; }
	}
	for (const k of bKeys) {
		if (!equalItem(a[k], b[k], stack)) { return false; }
	}
	return equalItem(Reflect.getPrototypeOf(a), Reflect.getPrototypeOf(b), stack);
}

export default function equal(a: any, b: any): boolean {
	return equalItem(a, b, new Stack());
}

export function setCustomEqual(f: CustomEqual): () => void {
	if (typeof f !== 'function') { return () => {}; }
	customEquals.add(f);
	return () => {
		customEquals.delete(f);
	};
}
