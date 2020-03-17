import {
	NeepElement, Exposed,
	Render, NeepNode, Slots, Context, IRender,
} from '../type';
import { typeSymbol } from '../symbols';
import { isProduction } from '../constant';
import auxiliary, { isElement, Tags } from '../auxiliary';
import { renderSymbol, isElementSymbol } from '../symbols';
import { getLabel } from '../helper/label';
import Container from './Container';
import Entity from './Entity';
import { getSlots, setSlots } from './slot';
import { initContext } from '../helper/context';

function execSimple(
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
	const context: Context = initContext({
		slots: setSlots(iRender, slots),
		inited: false,
		parent: nObject.exposed,
		delivered: nObject.delivered,
		children: new Set<Exposed>(),
		childNodes: children,
		refresh(f) { nObject.refresh(f); }
	});
	if (!isProduction) { getLabel(); }
	const result = tag({...node.props}, context, auxiliary);
	const nodes = slotless(renderNode(
		iRender,
		result,
		context,
		tag[renderSymbol],
	), context.slots);

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

function slotless(
	node: any,
	slots: Slots,
	native = false,
): any {
	if (Array.isArray(node)) {
		return node.map(n => slotless(n, slots, native));
	}
	if (!isElement(node)) { return node; }

	const children = node.children
		.map(n => slotless(n, slots, native));

	let { tag, inserted, args = [{}] } = node;
	if (tag === Tags.Slot) {
		tag = native ? 'slot' : Tags.ScopeSlot;
	}
	if (tag !== Tags.ScopeSlot || inserted) {
		return { ...node, children, tag };
	}
	const slotName = node.props?.name || 'default';
	const slot = slots[slotName];
	if (typeof slot === 'function') {
		return {
			...node,
			...slot(...args),
		};
	}
	const { render } = node;
	const label = isProduction
		? undefined
		: [`[${ slotName }]`, '#00F'];
	return {
		...node,
		tag: Tags.ScopeSlot,
		label,
		children:
			typeof render !== 'function' ? children : render(...args),
	};
}

function renderNode<R extends object = object>(
	iRender: IRender,
	node: R | NeepNode | NeepNode[] | undefined | null,
	context: Context,
	render?: Render,
): NeepNode[] {
	if (Array.isArray(node)) { return node; }
	if (isElement(node)) { return [node]; }
	if (node === undefined || node === null) {
		return [{ [isElementSymbol]: true, tag: null, children: [] }];
	}
	if (!iRender.isNode(node) && typeof node === 'object' && render) {
		node = render(node, context, auxiliary);
	}
	if (isElement(node)) { return [node]; }
	if (node === undefined || node === null) {
		return [{ [isElementSymbol]: true, tag: null, children: [] }];
	}
	return [{
		[isElementSymbol]: true,
		tag: Tags.Value,
		value: node,
		children: [],
	}];
}


export default function normalize(
	nObject: Entity,
	result: any,
) {
	return execSimple(
		nObject,
		slotless(
			renderNode(
				nObject.container.iRender,
				result,
				nObject.context,
				nObject.component[renderSymbol],
			),
			nObject.context.slots,
			Boolean(nObject.native),
		),
	);
}
