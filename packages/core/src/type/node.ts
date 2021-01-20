import {
	objectTypeSymbol,
	objectTypeSymbolElement,
} from '../symbols';
import { SimpleComponent, Component, RenderComponent } from './component';

type Tags = typeof import('../auxiliary/tags');
type CoreTags = Tags[keyof Tags];
export type Tag<P extends object> = string | CoreTags | Component<P> | RenderComponent<P, any, any>;

export interface Element<T extends Tag<any> = Tag<any>> {
	[objectTypeSymbol]: typeof objectTypeSymbolElement,
	/** 标签名 */
	tag: T;
	/** 属性 */
	props?: { [key: string]: any; };
	/** 子节点 */
	children: any[];
	/** 插槽 */
	slot?: string;
	/** 列表对比 key */
	key?: any;
	/** 槽是否是已插入的 */
	inserted?: boolean;
	/** 是否为槽默认值 */
	isDefault?: boolean;
	/** 简单组件，是否是已经执行的 */
	execed?: boolean;
}

export interface ElementIteratorOptions {
	simple?:
	| boolean
	| SimpleComponent<any, any>[]
	| ((c: SimpleComponent<any, any>) => boolean);
}
/** source 对象 */
export type Node = Element | null;
