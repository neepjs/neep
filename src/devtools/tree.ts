import {
	MountedNode, Container, Template, ScopeSlot, SlotRender, Value,
} from '@neep/core';
import { nameSymbol, typeSymbol } from '../core/create/mark/symbols';
export enum Type {
	tag = 'tag',
	placeholder = 'placeholder',
	standard = 'standard',
	simple = 'simple',
	native = 'native',
	container = 'container',
	special = 'special',
}
export interface VTreeNode {
	id: number;
	type: Type;
	tag: string;
	/** 子节点 */
	children: VTreeNode[];
	props?: { [key: string]: any; };
	/** 列表对比 key */
	key?: any;
	/** 标注 */
	label?: string;
	parent: number;
}

export function *getTree(
	tree: MountedNode | (MountedNode | MountedNode[])[],
	parent: number = 0,
): Iterable<VTreeNode> {
	if (Array.isArray(tree)) {
		for (const it of tree) {
			yield* getTree(it);
		}
		return;
	}
	const {
		id,
		tag,
		props,
		children,
		key,
		label,
		component,
	} = tree;
	if (!tag) {
		yield {
			id, parent,
			type: Type.placeholder,
			tag: 'placeholder',
			children: [],
		};
		return;
	}
	if (typeof tag !== 'string') {
		const name = tag[nameSymbol] || tag.name;
		if (!component) {
			yield {
				id, parent,
				type: Type.simple,
				tag: name,
				children: [...getTree(children)],
				props,
				key,
				label,
			};
			return;
		}
		const isNative = tag[typeSymbol] === 'native';
		yield {
			id, parent,
			type: isNative ? Type.native : Type.standard,
			tag: name,
			children: [...getTree(
				component instanceof Container ? component.content
					: isNative ? component._children : component.tree
			)],
			props,
			key,
			label,
		};
		return;
	}
	if (tag === Template || tag === ScopeSlot || tag === SlotRender) {
		yield {
			id, parent,
			type: Type.special,
			tag,
			children: [...getTree(children)],
			props,
			key,
			label,
		};
		return;
	}
	if (tag === Value) {
		yield {
			id, parent,
			type: Type.special,
			tag,
			children: [],
			props,
			key,
			label,
		};
		return;
	}
	yield {
		id, parent,
		type: Type.tag,
		tag,
		children: [...getTree(children)],
		props,
		key,
		label,
	};

}
