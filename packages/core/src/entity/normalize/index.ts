import {
	NeepElement, Exposed, Delivered,
	Render, NeepNode, Slots, Context, IRender, Component,
} from '../../type';
import {
	renderSymbol,
	typeSymbol,
	componentsSymbol,
	objectTypeSymbol,
	objectTypeSymbolElement,
} from '../../symbols';
import { isProduction } from '../../constant';
import {
	isElement, Deliver, Value, SlotRender,
} from '../../auxiliary';
import { getLabel } from '../../extends/label';
import ComponentEntity from '../ComponentEntity';
import EntityObject from '../EntityObject';
import { getSlots, setSlots } from '../slot';
import { initContext } from '../../extends/context';
import EventEmitter from '../../EventEmitter';
import replaceNode from './replaceNode';
import { isValue, postpone } from '../../install';
import { refresh } from '../../extends';


function getComponents(
	...components: (Record<string, Component> | undefined)[]
): Record<string, Component>[] {
	return components.filter(Boolean) as Record<string, Component>[];
}

function execSimple(
	nObject: EntityObject,
	delivered: Delivered,
	node: NeepElement,
	tag: Component,
	components: Record<string, Component>[],
	children: any[],
): NeepElement {
	if (node.execed) { return node; }
	const { iRender } = nObject;
	const slotMap = Object.create(null);
	getSlots(iRender, children, slotMap);
	const slots = setSlots(slotMap);
	const event = new EventEmitter();
	event.updateInProps(node.props);
	const props = {...node.props};
	const context: Context = initContext({
		slots,
		created: false,
		parent: nObject.exposed,
		delivered,
		children: new Set<Exposed>(),
		childNodes: children,
		refresh(f) { nObject.refresh(f); },
		emit: event.emit,
	});
	if (!isProduction) { getLabel(); }
	const result = tag(props, context);
	let label: [string, string] | undefined;
	if (!isProduction) { label = getLabel(); }
	const nodes = init(
		nObject,
		delivered,
		renderNode(
			nObject.iRender,
			result,
			context,
			tag[renderSymbol],
		),
		slots,
		getComponents(...components, tag[componentsSymbol]),
		false,
	) as NeepNode[];


	return {
		...node,
		tag,
		execed: true,
		children: Array.isArray(nodes) ? nodes : [nodes],
		label,
	};
}


function getSlotRenderFn(
	nObject: EntityObject,
	delivered: Delivered,
	children: any[],
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): null | Function {
	if (children.length !== 1) {
		return null;
	}
	const [renderFn] = children;
	if (isValue(renderFn) || typeof renderFn !== 'function') {
		return null;
	}
	const { slotRenderFnList } = nObject;
	const fn = slotRenderFnList.get(renderFn);
	if (fn) { return fn; }
	const newFn = function(this: any, ...p: any[]): any {
		return init(
			nObject,
			delivered,
			renderFn.call(this, ...p),
			slots,
			components,
			native,
		);
	};
	slotRenderFnList.set(renderFn, newFn);
	return newFn;
}


function exec(
	nObject: EntityObject,
	delivered: Delivered,
	node: any,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): any {
	if (Array.isArray(node)) {
		return node.map(n =>
			exec(nObject, delivered, n, slots, components, native));
	}
	if (!isElement(node)) { return node; }
	let { tag, children } = node;
	if (tag === Deliver) {
		const props = { ...node.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		return {
			...node,
			tag,
			children: children.map(n => exec(
				nObject,
				updateProps(
					Object.create(delivered),
					props || {},
					{},
					true,
				),
				n,
				slots,
				components,
				native,
			)),
		};
	}
	if (tag === SlotRender) {
		const slotRenderFn = getSlotRenderFn(
			nObject,
			delivered,
			children,
			slots,
			components,
			native,
		);
		if (slotRenderFn) {
			return {
				...node,
				children: [slotRenderFn],
			} as NeepElement;
		}
	}

	if (typeof tag !== 'function' || tag[typeSymbol] !== 'simple') {
		return { ...node, tag, children: children
			.map(n => exec(
				nObject,
				delivered,
				n,
				slots,
				components,
				native,
			)) };
	}

	return execSimple(
		nObject,
		delivered,
		node,
		tag,
		components,
		children,
	);
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
		return [{
			[objectTypeSymbol]: objectTypeSymbolElement,
			tag: null,
			key: undefined,
			children: [],
		}];
	}
	if (!iRender.isNode(node)
		&& node && typeof node === 'object' && render
	) {
		node = render(node, context);
	}
	if (isElement(node)) { return [node]; }
	if (node === undefined || node === null) {
		return [{
			[objectTypeSymbol]: objectTypeSymbolElement,
			tag: null,
			key: undefined,
			children: [],
		}];
	}
	return [{
		[objectTypeSymbol]: objectTypeSymbolElement,
		key: undefined,
		tag: Value,
		value: node,
		children: [],
	}];
}
export function init(
	nObject: EntityObject,
	delivered: Delivered,
	node: any,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): any {
	return refresh(() => postpone(() => exec(
		nObject,
		delivered,
		replaceNode(
			node,
			slots,
			components,
			native,
			true,
		),
		slots,
		components,
		native,
	)));
}


export default function normalize(
	nObject: ComponentEntity,
	result: any,
): any {
	const { component } = nObject;
	return init(
		nObject,
		nObject.delivered,
		renderNode(
			nObject.iRender,
			result,
			nObject.context,
			component[renderSymbol],
		),
		nObject.slots,
		getComponents(component[componentsSymbol]),
		Boolean(nObject.native),
	);
}
