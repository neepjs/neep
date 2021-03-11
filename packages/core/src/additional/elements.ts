import { Template } from '../constant/tags';
import { isSimpleComponent } from '../is';
import {isElement} from '../auxiliary';
import { SimpleComponent } from '../types';

function elements(
	node: any,
	opt: elements.Option = {},
): any[] {
	if (Array.isArray(node)) {
		const list: any[][] = [];
		for (let n of node) {
			list.push(elements(n, opt));
		}
		return ([] as any[]).concat(...list);
	}
	if (!isElement(node)) { return [node]; }
	let { tag } = node;
	if (!tag) { return [node]; }

	if (tag === Template) {
		return elements(node.children, opt);
	}
	if (!isSimpleComponent(tag)) { return [node]; }
	const { simple } = opt;
	if (Array.isArray(simple)) {
		if (simple.includes(tag)) { return [node]; }
	} else if (typeof simple === 'function') {
		if (simple(tag)) { return [node]; }
	} else if (simple) {
		return [node];
	}
	return elements(node.children, opt);
}
declare namespace elements {
	export interface Option {
		simple?:
		| boolean
		| SimpleComponent<any, any>[]
		| ((c: SimpleComponent<any, any>) => boolean);
	}
}
export default elements;
