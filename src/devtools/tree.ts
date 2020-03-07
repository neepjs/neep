import {
	Template, ScopeSlot, SlotRender, Value,
	nameSymbol, typeSymbol,
} from '@neep/core';
import { MountedNode } from '../core/render/draw';
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
	label?: [string, string];
	parent: number;
	value?: string;
	valueType?: 'string' | 'value' | 'function'
	| 'native' | 'object' | 'date' | 'regex';
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
		component,
		label = component?.exposed?.$label,
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
				'content' in component ? component.content
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
		const treeValue = tree.value;
		const type = typeof treeValue;
		let valueType: VTreeNode['valueType'] = 'string';
		let value = '';
		if (type === 'string') {
			value = treeValue;
		} else if (treeValue === tree.node) {
			valueType = 'native';
		} else if (type === 'function') {
			valueType ='function';
		} else if (
			type === 'bigint'
			|| type === 'boolean'
			|| type === 'number'
			|| type === 'symbol'
			|| type === 'undefined'
			|| treeValue === null
		) {
			valueType ='value';
			value = String(treeValue);
		} else if (treeValue instanceof RegExp) {
			valueType ='regex';
			value = String(treeValue);
		} else if (treeValue instanceof Date) {
			valueType ='date';
			value = treeValue.toISOString();
		} else if (type === 'object') {
			valueType = 'object';
			value = String(treeValue);
		}
		yield {
			id, parent,
			type: Type.special,
			tag,
			children: [],
			valueType,
			value,
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
