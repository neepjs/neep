/**********************************
 * 组件上下文环境专用 API
 * @description 简单组件不支持
 **********************************/
import { Value, WatchCallback, HookName, Service, CancelWatch } from '../type';
import { checkCurrent } from '../extends/current';
import { setHook } from '../hook';
import { isValue, value, computed } from './state';
import { getUseHookValue } from '../extends/current';


/**********************************
 * 状态管理类 API
 **********************************/
/**
 * 监听指定值的变化
 * @description 本质是调用 Value 对象的 watch 方法
 * @description 但是通过此方法进行的观察，会在组件生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 被监听的值
 * @param cb    当监听的值发送变化时调用的函数
 */
export function watch<T>(
	value: Value<T>,
	cb: WatchCallback<T>,
	run?: boolean,
): () => void;
/**
 * 监听指定值的变化
 * @description 本质是创建调用 Value 对象的 watch 方法
 * @description 但是通过此方法进行的观察，会在组件生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 用于计算观测值的函数
 * @param cb    当监听的值发送变化时调用的函数
 */
export function watch<T>(
	value: () => T,
	cb: (v: T, stopped: boolean) => void,
	run?: boolean,
): () => void;
export function watch<T>(
	value: Value<T> | (() => T),
	cb: (v: Value<T> | T, stopped: boolean) => void,
	run?: boolean,
): () => void {
	const entity = checkCurrent('watch');
	if (typeof value !== 'function') { return () => {}; }
	let stop: CancelWatch;
	if (isValue(value)) {
		stop = value.watch(cb);
		cb(value, false);
	} else {
		const v = computed(value);
		stop = v.watch((v, s) => cb(v(), s));
		cb(v(), false);
	}
	setHook('beforeDestroy', () => stop(), entity);
	return stop;
}

export function useValue(): Value<any>;
export function useValue<T>(fn: () => T): T;
export function useValue<T>(fn?: () => T): T | Value<any>;
export function useValue<T>(fn?: () => T): T | Value<any> {
	return getUseHookValue<T | Value<any>>(
		'useValue',
		'core',
		typeof fn === 'function' ? fn : () => value(undefined),
	);

}

/**********************************
 * 服务 API
 **********************************/
export function useService<T, P extends any[]>(
	fn: Service<T, P>,
	...p: P
): T {
	return getUseHookValue<T>(
		'useService',
		'core',
		entity => fn(entity, ...p),
	);
}

export function byService<T, P extends any[]>(
	fn: Service<T, P>,
	...p: P
): T {
	const entity = checkCurrent('byService');
	return fn(entity, ...p);
}


/**********************************
 * 钩子类 API
 **********************************/
/**
 * 为当前组件注册钩子
 * @param name 钩子名称
 * @param hook 钩子
 * @param initOnly 是否仅在初始化时有效
 */
export function hook<H extends HookName>(
	name: H,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void);
export function hook(
	name: string,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void);
export function hook(
	name: string,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void) {
	const entity = checkCurrent('setHook');
	if (initOnly && entity.created) { return undefined; }
	return setHook(name, () => hook(), entity);
}
