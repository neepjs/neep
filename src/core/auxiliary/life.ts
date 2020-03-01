/**********************************
 * 上下文环境专用 API
 **********************************/
import { Value, WatchCallback } from 'monitorable';
import { checkCurrent } from '../helper';
import { monitorable } from '../install';
import { setHook } from '../hook';
import { isValue } from './state';


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
	const exposed = checkCurrent('watch');
	if (typeof value !== 'function') { return () => {}; }
	const stop = isValue(value)
		? value.watch(monitorable.merge(cb))
		: monitorable.computed(value)
			.watch(monitorable.merge((v, s) => cb(v(), s)));
	setHook('beforeDestroy', () => stop(), exposed);
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
	const exposed = checkCurrent('setHook');
	return setHook(name, hook, exposed);
}
export function inited(hook: () => void): () => void {
	const exposed = checkCurrent('inited', true);
	return setHook('inited', hook, exposed);
}
export function beforeMount(hook: () => void): () => void {
	const exposed = checkCurrent('beforeMount', true);
	return setHook('beforeMount', hook, exposed);
}
export function mounted(hook: () => void): () => void {
	const exposed = checkCurrent('mounted', true);
	return setHook('mounted', hook, exposed);
}
export function beforeRefresh(hook: () => void): () => void {
	const exposed = checkCurrent('beforeRefresh', true);
	return setHook('beforeRefresh', hook, exposed);
}
export function refreshed(hook: () => void): () => void {
	const exposed = checkCurrent('refreshed', true);
	return setHook('refreshed', hook, exposed);
}
export function beforeDestroy(hook: () => void): () => void {
	const exposed = checkCurrent('beforeDestroy', true);
	return setHook('beforeDestroy', hook, exposed);
}
export function destroyed(hook: () => void): () => void {
	const exposed = checkCurrent('destroyed', true);
	return setHook('destroyed', hook, exposed);
}


/**********************************
 * 配置 API
 **********************************/

/**
 * 将 Value 导出
 * @param name 导出用的名称
 */
export function expose<T>(
	name: string | number | symbol,
	value: Value<T>,
	mix?: boolean,
): void;
/**
 * 将普通值导出
 * @param name 
 * @param value 
 */
export function expose<T>(
	name: string | number | symbol,
	value: T,
): void;
/**
 * 设置基于 getter 的导出
 * @param name 
 * @param getter 
 * @param nonmodifiable 
 */
export function expose<T>(
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
export function expose<T>(
	name: string | number | symbol,
	getter: () => T,
	setter: (value: T) => void,
): void;
export function expose<T>(
	name: string | number | symbol,
	value: T | Value<T> | (() => T),
	opt?: boolean | ((value: T) => void),
): void {
	const exposed = checkCurrent('expose', true);
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
