/**********************************
 * 组件上下文环境专用 API
 * @description 简单组件不支持
 **********************************/
import { Value, WatchCallback } from 'monitorable';
import { Hooks, Service } from '../type';
import { checkCurrent } from '../extends';
import NeepError from '../Error';
import { setHook } from '../hook';
import { isValue, value, computed } from './state';


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
): () => void;

export function watch<T>(
	value: Value<T> | (() => T),
	cb: (v: Value<T> | T, stopped: boolean) => void,
): () => void {
	const entity = checkCurrent('watch');
	if (typeof value !== 'function') { return () => {}; }
	const stop = isValue(value)
		? value.watch(cb)
		: computed(value).watch((v, s) => cb(v(), s));
	setHook('beforeDestroy', () => stop(), entity);
	return stop;
}

export function useValue(): Value<any>;
export function useValue<T>(fn: () => T): T;
export function useValue<T>(fn?: () => T): T | Value<any>;
export function useValue<T>(fn?: () => T): T | Value<any> {
	const entity = checkCurrent('useValue');
	const index = entity.$_valueIndex++;
	const values = entity.$_values;
	if (!entity.created) {
		values[index] = undefined;
		const v = typeof fn === 'function' ? fn() : value(undefined);
		return values[index] = v;
	}
	if (index >= values.length) {
		throw new NeepError(
			'Inconsistent number of useValue executions',
			'life',
		);
	}
	return values[index];

}

/**********************************
 * 服务 API
 **********************************/
export function useService<T, P extends any[]>(
	fn: Service<T, P>,
	...p: P
): T {
	const entity = checkCurrent('useService');
	const index = entity.$_serviceIndex++;
	const services = entity.$_services;
	if (!entity.created) {
		services[index] = undefined;
		const v = fn(entity, ...p);
		services[index] = v;
		return v;
	}
	if (index >= services.length) {
		throw new NeepError(
			'Inconsistent number of useService executions',
			'life',
		);
	}
	return services[index];
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
export function hook<H extends Hooks>(
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

/**********************************
 * 配置 API
 **********************************/

function setValue<T>(
	obj: any,
	name: string | number | symbol,
	value: T | Value<T> | (() => T),
	opt?: boolean | ((value: T) => void),
): void {
	if (
		typeof name === 'string'
		&& ['$', '_'].includes(name[0])
	) {
		return;
	}
	if (isValue(value) && opt) {
		Reflect.defineProperty(obj, name, {
			get() { return value(); },
			set(v) { value(v); },
			configurable: true,
			enumerable: true,
		});
		return;
	}
	if (typeof value === 'function' && opt) {
		Reflect.defineProperty(obj, name, {
			get: value as () => T,
			set: typeof opt === 'function' ? opt : undefined,
			configurable: true,
			enumerable: true,
		});
		return;
	}
	Reflect.defineProperty(obj, name, {
		get() { return value; },
		configurable: true,
		enumerable: true,
	});
}


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
 * @param nonModifiable
 */
export function expose<T>(
	name: string | number | symbol,
	getter: () => T,
	nonModifiable: true,
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
	setValue(checkCurrent('expose', true).exposed, name, value, opt);
}
