import {
	Element,
	Component,
	DeliverComponent,
	RenderComponent,
} from '../types';
import {createElementBase} from '../auxiliary';

function createElement<T extends DeliverComponent<any>>(
	tag: T,
	attrs?: (T extends DeliverComponent<infer P> ? {value: P} : never),
	...children: any[]
): Element;
function createElement<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(
	tag: T,
	attrs?: P,
	...children: any[]
): Element;
function createElement<T extends string>(
	tag: T,
	attrs?: Record<string, any>,
	...children: any[]
): Element;

function createElement(
	tag: any,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element;
function createElement(
	tag: any,
	attrs?: Record<string, any> | null,
	...children: any[]
): Element {
	const attrProps = attrs ? {...attrs} : {};
	const props: Record<string, any> = {};
	for (const n of Object.keys(attrProps)) {
		if (n === '@') {
			props['n:on'] = attrProps[n];
			continue;
		}
		if (n[0] === '!') {
			props[`n:${ n.substr(1) }`] = attrProps[n];
			continue;
		}
		if (n[0] === '@') {
			props[`on:${ n.substr(1) }`] = attrProps[n];
			continue;
		}
		if (n.substr(0, 2) === 'n-') {
			props[`n:${ n.substr(2) }`] = attrProps[n];
			continue;
		}
		if (n.substr(0, 3) === 'on-') {
			const fn = attrProps[n];
			if (typeof fn === 'function' || fn === null || fn === undefined) {
				props[`on:${ n.substr(3) }`] = fn;
			}
			continue;
		}
		if (n.substr(0, 5) === 'hook-') {
			const fn = attrProps[n];
			if (typeof fn === 'function' || fn === null || fn === undefined) {
				props[`hook:${ n.substr(5) }`] = fn;
			}
			continue;
		}
		if (n.substr(0, 5) === 'data-') {
			props[`data:${ n.substr(5) }`] = attrProps[n];
		}
		props[n] = attrProps[n];
	}
	return createElementBase(tag, props, ...children);
}

export default createElement;
