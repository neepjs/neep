import { ComponentEntity } from './entity';
import { SlotApi } from './slot';
import { DeliverComponent } from './component';
import { Emit } from './event';

export interface Delivered {
	<T>(d: DeliverComponent<T>): T;
}
/** 上下文环境 */
export interface Context<
	TExpose extends object,
	TEmit extends Record<string, any>,
	Parent extends ComponentEntity<any, any>,
> {
	isShell: boolean;
	delivered: Delivered;
	refresh(fn?: () => void): void;
	childNodes: any[];
	emit: Emit<TEmit>;
	/** 作用域槽 */
	slot: SlotApi;
	/** 父组件 */
	parent?: Parent;

	expose?(value?: TExpose): void;
	/** 是否已经完成初始化 */
	created?: boolean;
	/** 子组件集合 */
	children?: object[];
}
/** 上下文环境 */
export interface ShellContext<
	TEmit extends Record<string, any>,
	Parent extends ComponentEntity<any, any> = ComponentEntity<any, any>,
> extends Context<never, TEmit, Parent> {
	isShell: true;
	expose?: undefined
	/** 是否已经完成初始化 */
	created?: undefined
	/** 子组件集合 */
	children?: undefined
}
/** 上下文环境 */
export interface ComponentContext<
	TExpose extends object,
	TEmit extends Record<string, any>,
	Parent extends ComponentEntity<any, any> = ComponentEntity<any, any>,
> extends Context<TExpose, TEmit, Parent> {
	isShell: false;
	expose(value?: TExpose): void;
	/** 是否已经完成初始化 */
	created: boolean;
	/** 子组件集合 */
	children: object[];
}

export interface ContextConstructor {
	(context: ShellContext<any>): void;
	(context: ComponentContext<any, any>, entity?: ComponentEntity<any>): void;
	(context: Context<any, any, any>, entity?: ComponentEntity<any>): void;
}
