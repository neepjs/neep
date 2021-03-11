import { getNodeArray } from './getNodeArray';

export function getChildren(children: any[], args: any): any[] {
	if (children.length !== 1) { return children; }
	const [fn] = children;
	if (typeof fn !== 'function') { return children; }
	return getNodeArray(fn(args));
}
