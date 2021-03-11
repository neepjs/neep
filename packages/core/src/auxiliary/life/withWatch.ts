import { Value, WatchCallback, CancelWatch } from '../../types';
import { checkCurrent } from '../../extends/current';
import { setHook } from '../../extends/hook';
import { isValue, computed } from '../state';


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
function withWatch<T>(
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
function withWatch<T>(
	value: () => T,
	cb: (v: T, stopped: boolean) => void,
	run?: boolean,
): () => void;
function withWatch<T>(
	value: Value<T> | (() => T),
	cb: (v: Value<T> | T, stopped: boolean) => void,
	run?: boolean,
): () => void {
	const contextData = checkCurrent('withWatch');
	if (typeof value !== 'function') { return () => {}; }
	let stop: CancelWatch;
	if (isValue(value)) {
		stop = value.watch(cb);
		if (run) {
			cb(value, false);
		}
	} else {
		const v = computed(value);
		stop = v.watch((v, s) => cb(v(), s));
		if (run) {
			cb(v(), false);
		}
	}
	setHook('beforeDestroy', () => stop(), contextData);
	return stop;
}
export default withWatch;
