import { Ref, Entity } from '../types';
import { value } from '../auxiliary';

function createEntitySetRef<T extends Entity<any, any>>(set: ref.Set<T>): Ref<any, T> {
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
function createExposedSetRef<T extends object>(set: ref.Set<T>): Ref<T, any> {
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
function createEntityRefValue<T extends Entity<any, any>>(watch?: boolean): ref.EntityValue<T> {
	const obj =  watch ? value<T | undefined>(undefined) : { value: undefined };
	function refValue(_1: any, _2: any, entity: T, state?: boolean): void {
		obj.value = state === false ? entity : undefined;
	}
	Reflect.defineProperty(refValue, 'value', {
		get() { return obj.value; },
		enumerable: true,
		configurable: true,
	});
	return refValue as unknown as ref.EntityValue<T>;
}
function createExposedRefValue<T extends object>(watch?: boolean): ref.Value<T> {
	const obj =  watch ? value<T | undefined>(undefined) : { value: undefined };
	function refValue(newNode: T | undefined): void {
		obj.value = newNode;
	}
	Reflect.defineProperty(refValue, 'value', {
		get() { return obj.value; },
		enumerable: true,
		configurable: true,
	});
	return refValue as unknown as ref.Value<T>;
}

function ref<T extends object>(watch?: boolean, isEntity?: false): ref.Value<T>;
function ref<T extends Entity<any, any>>(watch: boolean, isEntity: true): ref.EntityValue<T>;
function ref<T extends object>(set: ref.Set<T>, isEntity?: false): Ref<T, any>;
function ref<T extends Entity<any, any>>(set: ref.Set<T>, isEntity: true): Ref<any, T>;
function ref<
	T extends object
>(
	set?: boolean | ref.Set<T>,
	isEntity?: boolean,
): Ref<T, any> | ref.Value<T> | ref.EntityValue<T & Entity<any, any>> | Ref<any, T & Entity<any, any>> {
	if (set && (typeof set === 'function' || typeof set === 'object')) {
		return isEntity ? createEntitySetRef(set as any) : createExposedSetRef(set);
	}
	return isEntity ? createEntityRefValue(set) : createExposedRefValue(set);
}


declare namespace ref {
	export interface Set<T extends object> {
		add(value: T): void;
		delete(value: T): void;
		replace?(newNode: T, oldNode: T): void;
	}
	export interface Value<T extends object> extends Ref<T, any> {
		readonly value: T | null
	}
	export interface EntityValue<T extends Entity<any, any>> extends Ref<any, T> {
		readonly value: T | null
	}
}
export default ref;
