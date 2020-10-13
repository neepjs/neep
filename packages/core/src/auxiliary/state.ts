/**
 * 状态管理类 API
 */
import { RefValue, NativeNode, Exposed, Ref, RefSet } from '../type';
import { value } from '../install';
export {
	value, computed, isValue, encase, recover, valueify, asValue,
} from '../install';

export function ref<
	T extends NativeNode | Exposed = NativeNode | Exposed
>(watch?: boolean): RefValue<T>;
export function ref<
	T extends NativeNode | Exposed = NativeNode | Exposed
>(set: RefSet<T>): Ref<T>;
export function ref<
	T extends NativeNode | Exposed = NativeNode | Exposed
>(set?: boolean | RefSet<T>): Ref<T> | RefValue<T> {
	if (set && (typeof set === 'function' || typeof set === 'object')) {
		return function refValue(node: T, isRemove?: boolean): void {
			if (isRemove) {
				set.delete(node);
			} else {
				set.add(node);
			}
		};
	}
	if (set) {
		const obj = value<T | null>(null);
		function refValue(node: T, isRemove?: boolean): void {
			obj.value = isRemove ? null : node;
		}
		Reflect.defineProperty(refValue, 'value', {
			get() { return obj.value; },
			enumerable: true,
			configurable: true,
		});
		return refValue as RefValue<T>;
	}
	let obj: T | null = null;
	function refValue(node: T, isRemove?: boolean): void {
		obj = isRemove ? null : node;
	}
	Reflect.defineProperty(refValue, 'value', {
		get() { return obj; },
		enumerable: true,
		configurable: true,
	});
	return refValue as RefValue<T>;
}
