import { nameSymbol, typeSymbol, MountedNode, ComponentEntity, ContainerEntity } from '@neep/core';

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
	isNative?: boolean;
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
		return yield {
			id, parent,
			type: Type.placeholder,
			tag: 'placeholder',
			children: [],
		};
	}
	if (typeof tag !== 'string') {
		const name = tag[nameSymbol] || tag.name;
		if (!component) {
			return yield {
				id, parent,
				type: Type.simple,
				tag: name,
				children: [...getTree(children)],
				props,
				key,
				label,
			};
		}
		const isNative = tag[typeSymbol] === 'native';
		return yield {
			id, parent,
			type: isNative ? Type.native : Type.standard,
			tag: name,
			children: [...getTree(
				'content' in component ? (component as ContainerEntity).content
					: isNative ? (component as ComponentEntity).nativeTree : component.tree
			)],
			props,
			key,
			label,
		};
	}
	const ltag = tag.toLowerCase();
	if (ltag === 'neep:value') {
		const treeValue = tree.value;
		return yield {
			id, parent,
			type: Type.special,
			tag,
			children: [],
			isNative: treeValue === tree.node,
			value: treeValue,
			props,
			key,
			label,
		};
	}
	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		return yield {
			id, parent,
			type: Type.special,
			tag,
			children: [...getTree(children)],
			props,
			key,
			label,
		};
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
