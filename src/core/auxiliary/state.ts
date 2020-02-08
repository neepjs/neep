/**
 * 状态管理类 API
 */
import { Value, Options } from 'monitorable';
import { monitorable } from '../install';

export function value<T>(value: T, options?: boolean | Options): Value<T> {
	return monitorable.value(value, options);
}
export function computed<T>(getter: () => T, options?: boolean | Options): Value<T> {
	return monitorable.computed(getter, options);
}
export function isValue(v: any): v is Value<any> {
	return monitorable.isValue(v);
}
