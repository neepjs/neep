import { NeepElement, Slots, Component, NeepNode } from '../../type';
import { isProduction } from '../../constant';
import { isElement, ScopeSlot, Slot, SlotRender } from '../../auxiliary';
import { components as globalComponents } from '../../register';
import { RecursiveItem, RecursiveArray } from '../recursive';


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

function getChildren(children: any[], args: any[]): any {
	if (children.length !== 1) { return children; }
	const [fn] = children;
	if (typeof fn !== 'function') { return children; }
	return fn(...args);
}
function replaceNode<T>(
	node: RecursiveArray<T>,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
	isRoot: boolean,
): RecursiveArray<T | NeepNode>;
function replaceNode<T>(
	node: RecursiveItem<T>,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
	isRoot: boolean,
): RecursiveItem<T | NeepNode>;

function replaceNode<T>(
	node: RecursiveItem<T>,
	slots: Slots,
	components: Record<string, Component>[],
	native: boolean,
	isRoot: boolean,
): RecursiveItem<T | NeepNode> {
	if (Array.isArray(node)) {
		return node.map(n =>
			replaceNode( n, slots, components, native, isRoot));
	}
	if (!isElement(node)) { return node; }
	let { children, props } = node;
	let tag = findComponent(node.tag, components);
	if (tag === SlotRender && isRoot) {
		return null;
	}

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
				isRoot,
			),
		} as NeepElement;
	}
	if (node.tag === ScopeSlot && node.inserted) {
		return node;
	}
	const args = props?.argv && [props.argv]
		|| Array.isArray(props?.args) && props?.args.length && props.args
		|| [{}];
	const slotName = node.props?.name || 'default';
	const slot = slots[slotName];
	if (typeof slot === 'function') {
		return {
			...node,
			...slot(...args),
		} as NeepElement;
	}

	const label: [string, string] | undefined = isProduction
		? undefined
		: [`[${ slotName }]`, '#00F'];

	return {
		...node,
		tag: ScopeSlot,
		label,
		children: replaceNode(
			getChildren(children, args),
			slots,
			components,
			native,
			false,
		),
	} as NeepElement;
}
export default replaceNode;
