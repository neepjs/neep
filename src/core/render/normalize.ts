import {
	NeepElement, Exposed, Delivered,
	Render, NeepNode, Slots, Context, IRender, Component,
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
import { updateProps } from './props';

function execSimple(
	nObject: Container | Entity,
	delivered: Delivered,
	node: NeepElement,
	tag: Component,
	children: any[],
) {
	const { iRender } = nObject.container;
	const slotMap = Object.create(null);
	getSlots(iRender, children, slotMap);
	const slots = setSlots(slotMap);
	const context: Context = initContext({
		slots,
		created: false,
		parent: nObject.exposed,
		delivered,
		children: new Set<Exposed>(),
		childNodes: children,
		refresh(f) { nObject.refresh(f); }
	});
	if (!isProduction) { getLabel(); }
	const result = tag({...node.props}, context, auxiliary);
	let label: [string, string] | undefined;
	if (!isProduction) { label = getLabel(); }
	const nodes = exec(nObject, delivered, renderNode(
		iRender,
		result,
		context,
		tag[renderSymbol],
	), slots);

	return {
		...node,
		children: Array.isArray(nodes) ? nodes : [nodes],
		label,
	} as NeepElement;
}

function execSlot(
	node: NeepElement,
	slots: Slots,
	children: any[],
	args: any[] = [{}],
): NeepElement {
	const slotName = node.props?.name || 'default';
	const slot = slots[slotName];
	if (typeof slot === 'function') {
		return {
			...node,
			...slot(...args),
		};
	}
	const { render } = node;
	const label: [string, string] | undefined = isProduction
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

function exec(
	nObject: Container | Entity,
	delivered: Delivered,
	node: any,
	slots: Slots,
	native = false,
): any {
	if (Array.isArray(node)) {
		return node.map(n =>
			exec(nObject, delivered, n, slots, native)
		);
	}
	if (!isElement(node)) { return node; }
	let { tag, inserted, args = [{}] } = node;
	if (tag === Tags.Deliver) {
		const props = { ...node.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		const newDelivered = Object.create(delivered);
		updateProps(newDelivered, props || {}, {}, true);
		return {
			...node,
			tag,
			$__neep__delivered: newDelivered,
			children: node.children.map(n => exec(
				nObject,
				newDelivered,
				n,
				slots,
				native,
			)),
		};
	}

	const children = node.children
		.map(n => exec(nObject, delivered, n, slots, native));

	if (typeof tag === 'function') {
		if (tag[typeSymbol] === 'simple') {
			return execSimple(nObject, delivered, node, tag, children);
		}
		return { ...node, $__neep__delivered: delivered, children, tag };

	}
	if (tag === Tags.Slot) {
		tag = native ? 'slot' : Tags.ScopeSlot;
	}
	if (tag !== Tags.ScopeSlot || inserted) {
		return { ...node, children, tag };
	}
	return execSlot(node, slots, children, args);
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
	return exec(
		nObject,
		nObject.delivered,
		renderNode(
			nObject.iRender,
			result,
			nObject.context,
			nObject.component[renderSymbol],
		),
		nObject.context.slots,
		Boolean(nObject.native),
	);
}
