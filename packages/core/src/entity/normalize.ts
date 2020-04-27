import {
	NeepElement, Exposed, Delivered,
	Render, NeepNode, Slots, Context, IRender, Component,
} from '../type';
import { typeSymbol, componentsSymbol } from '../symbols';
import { isProduction } from '../constant';
import auxiliary, { isElement, Tags, valueify } from '../auxiliary';
import { renderSymbol, isElementSymbol } from '../symbols';
import { getLabel } from '../helper/label';
import ComponentEntity from './ComponentEntity';
import { getSlots, setSlots } from './slot';
import { initContext } from '../helper/context';
import { updateProps } from './props';
import EventEmitter from '../EventEmitter';
import { components as globalComponents } from '../register';


function getComponents(
	...components: (Record<string, Component> | undefined)[]
) {
	return components.filter(Boolean) as Record<string, Component>[];
}

function execSimple(
	nObject: ComponentEntity,
	delivered: Delivered,
	node: NeepElement,
	tag: Component,
	components: Record<string, Component>[],
	children: any[],
): NeepElement {
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
	const result = tag(props, context, auxiliary);
	let label: [string, string] | undefined;
	if (!isProduction) { label = getLabel(); }
	const nodes = exec(
		nObject,
		delivered,
		renderNode(
			iRender,
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
		// tag: 'Neep:Simple',
		tag,
		// component: tag,
		children: Array.isArray(nodes) ? nodes : [nodes],
		label,
	};
}

function execSlot(
	nObject: ComponentEntity,
	delivered: Delivered,
	node: NeepElement,
	slots: Slots,
	components: Record<string, Component>[],
	children: any[],
	args: any[] = [{}],
	native: boolean,
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
		children: exec(
			nObject,
			delivered,
			typeof render !== 'function' ? children : render(...args),
			slots,
			components,
			native,
		),
	};
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

function getElement(
	nObject: ComponentEntity,
	delivered: Delivered,
	node: NeepElement,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): NeepElement {
	const { inserted, args = [{}] } = node;
	let tag = findComponent(node.tag, components);
	if (tag === Tags.Deliver) {
		const props = { ...node.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		return {
			...node,
			tag,
			children: node.children.map(n => exec(
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

	const children = node.children
		.map(n => exec(nObject, delivered, n, slots, components, native));

	if (typeof tag === 'function') {
		if (tag[typeSymbol] === 'simple') {
			return execSimple(
				nObject,
				delivered,
				node,
				tag,
				components,
				exec(
					nObject,
					delivered,
					children,
					slots,
					components,
					native,
				),
			);
		}
		return { ...node, children, tag };

	}
	if (tag === Tags.Slot) {
		tag = native ? 'slot' : Tags.ScopeSlot;
	}
	if (tag !== Tags.ScopeSlot || inserted) {
		return { ...node, children, tag };
	}
	return execSlot(
		nObject,
		delivered,
		{ ...node, tag },
		slots,
		components,
		children,
		args,
		native,
	);

}
function exec(
	nObject: ComponentEntity,
	delivered: Delivered,
	node: any,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
): any {
	if (Array.isArray(node)) {
		return node.map(n =>
			exec(nObject, delivered, n, slots, components, native)
		);
	}
	if (!isElement(node)) { return node; }
	return getElement(
		nObject, 
		delivered,
		node,
		slots,
		components,
		native,
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
		return [{ [isElementSymbol]: true, tag: null, key: undefined, children: [] }];
	}
	if (!iRender.isNode(node)
		&& node && typeof node === 'object' && render
	) {
		node = render(node, context, auxiliary);
	}
	if (isElement(node)) { return [node]; }
	if (node === undefined || node === null) {
		return [{ [isElementSymbol]: true, tag: null, key: undefined, children: [] }];
	}
	return [{
		[isElementSymbol]: true,
		key: undefined,
		tag: Tags.Value,
		value: node,
		children: [],
	}];
}

export default function normalize(
	nObject: ComponentEntity,
	result: any,
) {
	const { component } = nObject;
	return exec(
		nObject,
		nObject.delivered,
		renderNode(
			nObject.iRender,
			result,
			nObject.context,
			component[renderSymbol],
		),
		nObject.context.slots,
		getComponents(component[componentsSymbol]),
		Boolean(nObject.native),
	);
}
