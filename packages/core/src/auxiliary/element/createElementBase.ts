import {
	Tag,
	Element,
	Component,
	DeliverComponent,
	RenderComponent,
} from '../../types';
import { objectTypeSymbol, objectTypeSymbolElement } from '../../constant/symbols';

function createElementBase<T extends DeliverComponent<any>>(
	tag: T,
	attrs?: (T extends DeliverComponent<infer P> ? {value: P} : never),
	...children: any[]
): Element;
function createElementBase<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(
	tag: T,
	attrs?: P,
	...children: any[]
): Element;
function createElementBase<T extends string>(
	tag: T,
	attrs?: Record<string, any>,
	...children: any[]
): Element;
function createElementBase<T extends Tag<any>>(
	tag: T,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element;
function createElementBase<T extends Tag<any>>(
	tag: T,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element {
	const props: Record<string, any> = typeof attrs === 'object' && attrs || {};
	const node: Element = {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag,
		props,
		children,
		key: undefined,
	};
	if ('n:key' in props) { node.key = props['n:key']; }
	if ('n:slot' in props) { node.slot = props['n:slot']; }
	return node;
}
export default createElementBase;
