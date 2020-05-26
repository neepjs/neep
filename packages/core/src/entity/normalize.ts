import {
	NeepElement, Exposed, Delivered,
	Render, NeepNode, Slots, Context, IRender, Component,
} from '../type';
import { typeSymbol, componentsSymbol } from '../symbols';
import { isProduction } from '../constant';
import { isElement, ScopeSlot, Deliver, Slot, Value } from '../auxiliary';
import { renderSymbol, isElementSymbol } from '../symbols';
import { getLabel } from '../helper/label';
import ComponentEntity from './ComponentEntity';
import EntityObject from './EntityObject';
import { getSlots, setSlots } from './slot';
import { initContext } from '../helper/context';
import { updateProps } from './props';
import EventEmitter from '../EventEmitter';
import { components as globalComponents } from '../register';


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


function exec(
	nObject: EntityObject,
	delivered: Delivered,
	node: any,
	components: Record<string, Component>[],
): any {
	if (Array.isArray(node)) {
		return node.map(n =>
			exec(nObject, delivered, n, components));
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
				components,
			)),
		};
	}

	if (typeof tag !== 'function' || tag[typeSymbol] !== 'simple') {
		return { ...node, tag, children: children
			.map(n => exec(nObject, delivered, n, components)) };
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

function findComponent(
	tag: any,
	components: Record<string, Component>[],
): Component | string | null {
	if (!tag) { return null; }
	if (typeof tag !== 'string') { return tag; }
	if (tag === 'template') { return tag; }
	if (/^neep:.+/i.test(tag)) { return tag; }
	for (const list of components) {
		const component = list[tag];
		if (component) { return component; }
	}
	return globalComponents[tag] || tag;
}

function replaceNode(
	node: any,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): any {
	if (Array.isArray(node)) {
		return node.map(n =>
			replaceNode( n, slots, components, native));
	}
	if (!isElement(node)) { return node; }
	let { children, args = [{}] } = node;
	let tag = findComponent(node.tag, components);

	if (tag === Slot) {
		tag = native ? 'slot' : ScopeSlot;
	}
	if (tag !== ScopeSlot ) {
		return {
			...node,
			tag,
			children: replaceNode(
				children,
				slots,
				components,
				native,
			),
		} as NeepElement;
	}
	if (node.tag === ScopeSlot && node.inserted) {
		return node;
	}
	const slotName = node.props?.name || 'default';
	const slot = slots[slotName];
	if (typeof slot === 'function') {
		return {
			...node,
			...slot(...args),
		} as NeepElement;
	}
	const { render } = node;

	const label: [string, string] | undefined = isProduction
		? undefined
		: [`[${ slotName }]`, '#00F'];
	return {
		...node,
		tag: ScopeSlot,
		label,
		children: replaceNode(
			typeof render !== 'function' ? children : render(...args),
			slots,
			components,
			native,
		),
	} as NeepElement;
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
			[isElementSymbol]: true,
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
			[isElementSymbol]: true,
			tag: null,
			key: undefined,
			children: [],
		}];
	}
	return [{
		[isElementSymbol]: true,
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
	return exec(
		nObject,
		delivered,
		replaceNode(
			node,
			slots,
			components,
			native,
		),
		components,
	);
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
	)
}
