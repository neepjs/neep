/**
 * ref 类 API
 */
import { RefValue, Ref, RefSet, Entity, RefEntityValue } from '../type';
import { value } from '../install/monitorable';

function createEntitySetRef<T extends Entity<any, any>>(set: RefSet<T>): Ref<any, T> {
	return function refValue(_0, _1, entity, state): void {
		if (state === true) {
			set.add(entity);
			return;
		}
		if (state === false) {
			set.delete(entity);
		}
	};
}
function createExposedSetRef<T extends object>(set: RefSet<T>): Ref<T, any> {
	return function refValue(newNode, oldNode): void {
		if (newNode === undefined) {
			if (oldNode !== undefined) {
				set.delete(oldNode);
			}
			return;
		} if (oldNode === undefined) {
			set.add(newNode);
			return;
		} if (typeof set.replace === 'function') {
			set.replace(newNode, oldNode);
			return;
		}
		set.delete(oldNode);
		set.add(newNode);
	};
}
function createEntityRefValue<T extends Entity<any, any>>(watch?: boolean): RefEntityValue<T> {
	const obj =  watch ? value<T | undefined>(undefined) : { value: undefined };
	function refValue(_1: any, _2: any, entity: T, state?: boolean): void {
		obj.value = state === false ? entity : undefined;
	}
	Reflect.defineProperty(refValue, 'value', {
		get() { return obj.value; },
		enumerable: true,
		configurable: true,
	});
	return refValue as unknown as RefEntityValue<T>;
}
function createExposedRefValue<T extends object>(watch?: boolean): RefValue<T> {
	const obj =  watch ? value<T | undefined>(undefined) : { value: undefined };
	function refValue(newNode: T | undefined): void {
		obj.value = newNode;
	}
	Reflect.defineProperty(refValue, 'value', {
		get() { return obj.value; },
		enumerable: true,
		configurable: true,
	});
	return refValue as unknown as RefValue<T>;
}

export function ref<T extends object>(watch?: boolean, isEntity?: false): RefValue<T>;
export function ref<T extends Entity<any, any>>(watch: boolean, isEntity: true): RefEntityValue<T>;
export function ref<T extends object>(set: RefSet<T>, isEntity?: false): Ref<T, any>;
export function ref<T extends Entity<any, any>>(set: RefSet<T>, isEntity: true): Ref<any, T>;
export function ref<
	T extends object
>(
	set?: boolean | RefSet<T>,
	isEntity?: boolean,
): Ref<T, any> | RefValue<T> | RefEntityValue<T & Entity<any, any>> | Ref<any, T & Entity<any, any>> {
	if (set && (typeof set === 'function' || typeof set === 'object')) {
		return isEntity ? createEntitySetRef(set as any) : createExposedSetRef(set);
	}
	return isEntity ? createEntityRefValue(set) : createExposedRefValue(set);
}
