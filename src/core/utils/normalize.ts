import {
	NeepComponent, Render, NeepNode, Slots, Context, IRender,
} from '../type';
import auxiliary, { isElement, Tags } from '../auxiliary';
import { renderSymbol } from '../create/mark/symbols';
import { isElementSymbol } from '../symbols';


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
	return {
		...node,
		tag: Tags.Template,
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


export default function normalize<R extends object = object>(
	result: any,
	context: Context,
	component: NeepComponent<any, R>,
	iRender: IRender,
	native = false,
) {
	return slotless(renderNode(
		iRender,
		result,
		context,
		component[renderSymbol],
	), context.slots, native);
}
