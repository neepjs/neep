import { NativeNode } from './renderer';
import { Tag } from './node';
import { ShellComponent, StandardComponent } from './component';
import { Entity, RootEntity } from './entity';


export type BaseProxy<TTag> = import('../entity/proxy/BaseProxy').default<TTag>;
export type RefProxy<
	TExposed extends object, TTag, TEntity extends Entity<any, any>
> = import('../entity/proxy/RefProxy').default<TExposed, TTag, TEntity>;


export type NodeProxy<TTag> = import('../entity/proxy/NodeProxy').default<TTag>;
export type DeliverProxy<T> = import('../entity/proxy/DeliverProxy').default<T>;
export type ElementProxy<
	T extends string
> = import('../entity/proxy/ElementProxy').default<T>;
export type GroupProxy<T> = import('../entity/proxy/GroupProxy').default<T>;
export type ShellProxy<
	T extends ShellComponent<any, any>
> = import('../entity/proxy/ShellProxy').default<T>;
export type ValueProxy = import('../entity/proxy/ValueProxy').default;


export type ComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends StandardComponent<TProps, TExpose, TEmit>,
> = import('../entity/proxy/ComponentProxy').default<TProps, TExpose, TEmit, C>;
export type StandardComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends StandardComponent<TProps, TExpose, TEmit>,
> = import('../entity/proxy/StandardComponentProxy').default<TProps, TExpose, TEmit, C>;
export type RenderComponentProxy<
	TProps extends object,
	TExpose extends object,
	TEmit extends Record<string, any>,
	C extends StandardComponent<TProps, TExpose, TEmit>,
> = import('../entity/proxy/RenderComponentProxy').default<TProps, TExpose, TEmit, C>;
export type ContainerProxy<
	P extends object
> = import('../entity/proxy/ContainerProxy').default<P>;


export interface Devtools {
	renderHook(rootEntity: RootEntity<any>, container: ContainerProxy<any>): void;
}

export interface Label {
	text: string;
	color?: string;
}

export interface ValueElement {
	/** 标签名 */
	tag?: undefined;
	/** 属性 */
	props: {value: any};
	/** 子节点 */
	children?: any[];
	/** 插槽 */
	slot?: undefined;
	/** 列表对比 key */
	key: any;
	/** 是否是已插入的 */
	inserted?: undefined;
	execed?: undefined;

}

export type TreeNodeList = (TreeNode | null | TreeNode[])[];

export interface TreeNode {
	proxy: BaseProxy<any>;
	/** 标签名 */
	tag?: Tag<any> | undefined;
	/** 属性 */
	props?: { [key: string]: any; };
	/** 列表对比 key */
	key?: any;
}
export interface ProxyMountedNode extends TreeNode {
	node?: undefined;
}

export interface ValueMountedNode {
	tag?: undefined | null;
	text?: string;
	key?: any;
	proxy?: undefined;
	children?: undefined;
	node: NativeNode;
}
/**
* @description node / component / children 至少一个有效
*/
export type MountNode = ProxyMountedNode | ValueMountedNode;
export type MountedNode = MountNode & {id: number};
