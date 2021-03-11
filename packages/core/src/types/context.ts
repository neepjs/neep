import { ComponentEntity } from './entity';
import { SlotApi } from './slot';
import { Emit } from './event';
import { Hook } from './hook';

/** 上下文环境 */
export interface Context<
	TExpose extends object,
	TEmit extends Record<string, any>,
> {
	by<P extends any[], R>(fn: (...p: P) => R, ...p: P): R;
	/** 作用域槽 */
	slot: SlotApi;
	emit: Emit<TEmit>;
	childNodes(): any[];

	expose?(value?: TExpose): void;
}
/** 上下文环境 */
export interface ShellContext<
	TEmit extends Record<string, any>,
> extends Context<never, TEmit> {
	expose?: undefined
}
/** 上下文环境 */
export interface ComponentContext<
	TExpose extends object,
	TEmit extends Record<string, any>,
> extends Context<TExpose, TEmit> {
	expose(value?: TExpose): void;
}


export interface HookData {
	hooks?: { [name: string]: Set<Hook>; }
}
export interface UseData {
	id: number;
	value: any;
	list?: UseData[];
}
export interface WithData {
	[k: string]: any;
}

export interface ContextInfo {
	readonly created: boolean;
	readonly destroyed: boolean;
	readonly mounted: boolean;
	readonly unmounted: boolean;
}
export interface ContextData extends HookData {
	delivered: Record<any, any>;
	isShell: boolean;
	isSimple: boolean;
	created: boolean;
	destroyed: boolean;
	withData: WithData;
	useData?: UseData[];
	info?: ContextInfo;
	hooks?: { [name: string]: Set<Hook>; };
	/** 父组件 */
	parent?: ComponentEntity<any, any>;
	getChildren(): any[];
	refresh(): void;
	refresh<T>(f: () => T): T;
	refresh<T>(f?: () =>  T): T | void;
	refresh<T>(f?: () =>  T): T | void;
}
export interface ComponentContextData extends ContextData {
	useData: UseData[];
}
