/**********************************
 * 上下文环境专用 API
 **********************************/
import { checkCurrentObject } from '../helper';
import { Value, WatchCallback } from 'monitorable';
import { isValue } from './state';
import { monitorable } from '../install';


/**********************************
 * 状态管理类 API
 **********************************/
/**
 * 监听指定值的变化
 * @description 本质是调用 Value 对象的 watch 方法，但是通过此方法进行的观察，会在组价生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 被监听的值
 * @param cb    当监听的值发送变化时调用的函数
 */
export function watch<T>(value: Value<T>, cb: WatchCallback<T>): () => void;
/**
 * 监听指定值的变化
 * @description 本质是创建调用 Value 对象的 watch 方法，但是通过此方法进行的观察，会在组价生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 用于计算观测值的函数
 * @param cb    当监听的值发送变化时调用的函数
 */
export function watch<T>(
	value: () => T,
	cb: (v: T, stoped: boolean) => void,
): () => void;

export function watch<T>(
	value: Value<T> | (() => T),
	cb: (v: Value<T> | T, stoped: boolean) => void
): () => void {
	const nObject = checkCurrentObject('watch');
	if (typeof value !== 'function') { return () => {}; }
	const stop = isValue(value)
		? value.watch(monitorable.merge(cb))
		: monitorable.computed(value)
			.watch(monitorable.merge((v, s) => cb(v(), s)));
	nObject.setHook('beforeDestroy', () => stop());
	return stop;
}


/**********************************
 * 钩子类 API
 **********************************/

/**
 * 为当前组件注册钩子
 * @param name 钩子名称
 * @param hook 钩子
 */
export function hook(name: string, hook: () => void): () => void {
	return checkCurrentObject('setHook')
		.setHook(name, hook);
}
export function inited(hook: () => void): () => void {
	return checkCurrentObject('inited', true)
		.setHook('inited', hook);
}
export function beforeMount(hook: () => void): () => void {
	return checkCurrentObject('beforeMount', true)
		.setHook('beforeMount', hook);
}
export function mounted(hook: () => void): () => void {
	return checkCurrentObject('mounted', true)
		.setHook('mounted', hook);
}
export function beforeRefresh(hook: () => void): () => void {
	return checkCurrentObject('beforeRefresh', true)
		.setHook('beforeRefresh', hook);
}
export function refreshed(hook: () => void): () => void {
	return checkCurrentObject('refreshed', true)
		.setHook('refreshed', hook);
}
export function beforeDestroy(hook: () => void): () => void {
	return checkCurrentObject('beforeDestroy', true)
		.setHook('beforeDestroy', hook);
}
export function destroyed(hook: () => void): () => void {
	return checkCurrentObject('destroyed', true)
		.setHook('destroyed', hook);
}


/**********************************
 * 配置 API
 **********************************/

/**
 * 将 Value 导出
 * @param name 导出用的名称
 */
export function exposed<T>(
	name: string | number | symbol,
	value: Value<T>,
	mix?: boolean,
): void;
/**
 * 将普通值导出
 * @param name 
 * @param value 
 */
export function exposed<T>(
	name: string | number | symbol,
	value: T,
): void;
/**
 * 设置基于 getter 的导出
 * @param name 
 * @param getter 
 * @param nonmodifiable 
 */
export function exposed<T>(
	name: string | number | symbol,
	getter: () => T,
	nonmodifiable: true,
): void;
/**
 * 设置基于 getter/setter 的导出
 * @param name 
 * @param getter 
 * @param setter 
 */
export function exposed<T>(
	name: string | number | symbol,
	getter: () => T,
	setter: (value: T) => void,
): void;
export function exposed<T>(
	name: string | number | symbol,
	value: T | Value<T> | (() => T),
	opt?: boolean | ((value: T) => void),
): void {
	const { exposed } = checkCurrentObject('destroyed');
	if (
		typeof name === 'string'
		&& ['$', '_'].includes(name[0])
	) {
		return;
	}
	if (isValue(value) && opt) {
		Reflect.defineProperty(exposed, name, {
			get() { return value(); },
			set(v) { value(v); },
			configurable: true,
			enumerable: true,
		});
		return;
	}
	if (typeof value === 'function' && opt) {
		Reflect.defineProperty(exposed, name, {
			get: value as () => T,
			set: typeof opt === 'function' ? opt : undefined,
			configurable: true,
			enumerable: true,
		});
		return;
	}
	Reflect.defineProperty(exposed, name, {
		get() { return value; },
		configurable: true,
		enumerable: true,
	});
}
