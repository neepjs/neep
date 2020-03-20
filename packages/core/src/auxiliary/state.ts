/**
 * 状态管理类 API
 */
import { Value, Options } from 'monitorable';
import { monitorable } from '../install';

export function value<T>(
	value: T,
	options?: boolean | Options,
): Value<T>
export function value(...v: [any]) {
	return monitorable.value(...v);
}
export function computed<T>(
	getter: () => T,
	options?: boolean | Options,
): Value<T>;
export function computed<T>(...v: [any]) {
	return monitorable.computed(...v);
}
export function isValue(v: any): v is Value<any>;
export function isValue(...v: [any]) {
	return monitorable.isValue(...v);
}
export function encase<T>(value: T, nest?: number | boolean): T;
export function encase<T>(...v: [any]): T {
	return monitorable.encase(...v);
}
export function recover<T>(v: T): T;
export function recover<T>(...v: [any]): T {
	return monitorable.recover(...v);
}
