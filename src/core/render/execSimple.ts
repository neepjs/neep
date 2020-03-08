import { typeSymbol } from '../symbols';
import { isProduction } from '../constant';
import { NeepElement, Exposed } from '../type';
import auxiliary, { isElement } from '../auxiliary';
import { getLabel } from '../helper/label';
import normalize from './normalize';
import Container from './Container';
import Entity from './Entity';
import { getSlots, setSlots } from './slot';


export function execSimple(
	nObject: Container | Entity,
	node: any,
): any {
	if (Array.isArray(node)) {
		return node.map(n => execSimple(nObject, n));
	}
	if (!isElement(node)) { return node; }
	let { tag } = node;
	if (typeof tag !== 'function' || tag[typeSymbol] !== 'simple') {
		return {
			...node,
			children: execSimple(nObject, node.children),
		};
	}
	const { children } = node;
	const { iRender } = nObject.container;
	const slots = Object.create(null);
	getSlots(iRender, children, slots);
	const childrenSet = new Set<Exposed>();
	const context = {
		slots: setSlots(iRender, slots),
		get inited() { return false; },
		get parent() { return nObject.exposed; },
		get children() { return childrenSet; },
		get childNodes() { return children; },
	};
	if (!isProduction) { getLabel(); }
	const result = tag({...node.props}, context, auxiliary);
	const nodes = normalize(result, context, tag, iRender);
	let label: [string, string] | undefined;
	if (!isProduction) { label = getLabel(); }
	return {
		...node,
		children: execSimple(
			nObject,
			Array.isArray(nodes) ? nodes : [nodes],
		),
		label,
	} as NeepElement;
}
