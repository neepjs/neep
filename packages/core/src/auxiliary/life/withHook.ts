import { HookName } from '../../types';
import { checkCurrent } from '../../extends/current';
import { setHook } from '../../extends/hook';

/**********************************
 * 钩子类 API
 **********************************/
/**
 * 为当前组件注册钩子
 * @param name 钩子名称
 * @param hook 钩子
 * @param initOnly 是否仅在初始化时有效
 */
function withHook<H extends HookName>(
	name: H,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void);
function withHook(
	name: string,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void);
function withHook(
	name: string,
	hook: () => void,
	initOnly?: boolean,
): undefined | (() => void) {
	const contextData = checkCurrent('withHook');
	if (initOnly && contextData.created) { return undefined; }
	return setHook(name, () => hook(), contextData);
}
export default withHook;
