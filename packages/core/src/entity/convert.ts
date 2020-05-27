import { getRender } from '../install';
import { NeepNode, NeepElement, TreeNode, Delivered } from '../type';
import { isElement } from '../auxiliary';
import { isElementSymbol, typeSymbol } from '../symbols';
import { recursive2iterable } from './recursive';
import EntityObject from './EntityObject';
import ComponentEntity from './ComponentEntity';
import ContainerEntity from './ContainerEntity';
import { updateProps } from './props';

/** 强制转换为 NeepElement */
function toElement(t: any): null | NeepElement {
	if (t === false || t === null || t === undefined) {
		return null;
	}
	if (isElement(t)) {
		return t;
	}
	return {
		[isElementSymbol]: true,
		tag: 'Neep:Value',
		key: t,
		value: t,
		children: [],
	};
}

export function destroy(
	tree: TreeNode | TreeNode[] | (TreeNode | TreeNode[])[],
): void {
	if (Array.isArray(tree)) {
		tree.forEach(t => destroy(t));
		return;
	}
	const { component } = tree;
	if (component) { component.destroy(); }
}

function createItem(
	nObject: EntityObject,
	delivered: Delivered,
	source: NeepNode,
): TreeNode {
	if (!source) { return { tag: null, key: undefined, children: [] }; }
	const { tag } = source;
	if (!tag) { return { tag: null, key: undefined, children: [] }; }
	if (typeof tag !== 'string') {
		if (tag[typeSymbol] === 'simple') {
			return {
				...source,
				children: createAll(nObject, delivered, source.children),
				component: undefined,
			};
		}
		return {
			...source, children: [],
			component: new ComponentEntity(
				tag,
				source.props || {},
				source.children,
				nObject,
				delivered,
			),
		};
	}
	const ltag = tag.toLowerCase();
	if (ltag === 'neep:container') {
		const type = source?.props?.type;
		const iRender = type ? getRender(type) : nObject.iRender;
		return {
			...source, children: [],
			component: new ContainerEntity(
				iRender,
				source.props || {},
				source.children,
				nObject,
				delivered,
			),
		};
	}
	if (ltag === 'neep:value') {
		return { ...source, children: [] };
	}
	if (ltag === 'neep:deliver') {
		const props = { ...source.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		const newDelivered = updateProps(
			Object.create(delivered),
			props,
			{},
			true,
		);
		return {
			...source,
			delivered: newDelivered,
			children: createAll(nObject, newDelivered, source.children),
		};
	}

	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		return {
			...source,
			children: createAll(nObject, delivered, source.children),
		};
	}
	return {...source, children: createAll(nObject, delivered, source.children) };
}

/**
 * 更新树节点
 * @param nObject Neep 对象
 * @param source 用于替换的源
 * @param tree 已有树
 */
function updateList(
	nObject: EntityObject,
	delivered: Delivered,
	source: any[],
	tree: TreeNode | TreeNode[],
): TreeNode[] {
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: TreeNode[] = [];
	for (const src of recursive2iterable(source)) {
		const node = toElement(src);
		if (!node) { continue; }
		const index = tree.findIndex(it =>
			it.tag === node.tag && it.key === node.key);
		if (index >= 0) {
			newList.push(updateItem(nObject, delivered, node, tree[index]));
			tree.splice(index, 1);
		} else {
			newList.push(createItem(nObject, delivered, node));
		}
	}
	destroy(tree);
	return newList;
}

/**
 * 更新树节点
 * @param tree 已有树
 * @param source 用于替换的源
 * @param nObject Neep 对象
 */
function updateItem(
	nObject: EntityObject,
	delivered: Delivered,
	source: NeepNode,
	tree?: TreeNode | TreeNode[],
): TreeNode {
	if (!tree) {
		return createItem(nObject, delivered, source);
	}
	if (!source) {
		destroy(tree);
		return { tag: null, key: undefined, children: [] };
	}
	if (Array.isArray(tree)) {
		if (!tree.length) { return createItem(nObject, delivered, source); }
		const index = tree.findIndex(it => it.tag === source.tag);
		if (index < 0) {
			destroy(tree);
			return createItem(nObject, delivered, source);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		destroy(all);
	}
	const { tag } = source;
	if (tag !== tree.tag) {
		destroy(tree);
		return createItem(nObject, delivered, source);
	}
	if (!tag) { return { tag: null, key: undefined, children: [] }; }
	if (typeof tag !== 'string') {
		if (tag[typeSymbol] === 'simple') {
			return {
				...source,
				children: [...updateAll(
					nObject,
					delivered,
					source.children,
					tree.children,
				)],
				component: undefined,
			};
		}
		const { component } = tree;
		if (!component) { return createItem(nObject, delivered, source); }
		component.update(source.props || {}, source.children);
		return { ...source, children: [], component };
	}
	const ltag = tag.toLowerCase();
	if (ltag === 'neep:container') {
		const { component } = tree;
		if (!component) { return createItem(nObject, delivered, source); }
		const type = source?.props?.type;
		const iRender = type ? getRender(type) : nObject.iRender;
		if (iRender !== component.iRender) {
			return createItem(nObject, delivered, source);
		}
		component.update(source.props || {}, source.children);
		return { ...source, children: [], component };
	}
	if (ltag === 'neep:value') {
		return { ...source, children: [] };
	}
	if (ltag === 'neep:deliver') {
		const props = { ...source.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		const newDelivered = updateProps(
			tree.delivered || Object.create(delivered),
			props,
			tree.props,
			true,
		);
		return {
			...source,
			delivered: newDelivered,
			children: [...updateAll(
				nObject,
				newDelivered,
				source.children,
				tree.children,
			)],
		};
	}
	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		return {
			...source,
			children: [...updateAll(
				nObject,
				delivered,
				source.children,
				tree.children,
			)],
		};
	}
	return {
		...source,
		children: [...updateAll(nObject,
			delivered,
			source.children,
			tree.children)],
	};
}


function createAll(
	nObject: EntityObject,
	delivered: Delivered,
	source: any,
): (TreeNode | TreeNode[])[] {
	if (!Array.isArray(source)) { source = [source]; }
	if (!source.length) { return []; }
	return (source as any[]).map(item => {
		if (!Array.isArray(item)) {
			return createItem(nObject, delivered, toElement(item));
		}
		return [...recursive2iterable(item)]
			.map(it => createItem(nObject, delivered, toElement(it)));
	});
}
function *updateAll(
	nObject: EntityObject,
	delivered: Delivered,
	source: any,
	tree: (TreeNode | TreeNode[])[],
): Iterable<TreeNode | TreeNode[]> {
	if (!Array.isArray(source)) { source = [source]; }

	let index = 0;
	let length = Math.min(source.length, source.length);
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			yield updateList(nObject, delivered, src, tree[index]);
		} else {
			yield updateItem(nObject, delivered, toElement(src), tree[index]);
		}
	}
	length = Math.max(source.length, source.length);
	if (tree.length > length) {
		// 销毁多余项
		for (; index < length; index++) {
			destroy(tree[index]);
		}
	}
	if (source.length > length) {
		// 创建多余项
		for (; index < length; index++) {
			const src = toElement(source[index]);
			if (Array.isArray(src)) {
				yield [...recursive2iterable(src)]
					.map(it => createItem(nObject, delivered, it));
			} else {
				yield createItem(nObject, delivered, src);
			}
		}
	}
}


/**
 * 更新树
 * @param source 用于替换的源
 * @param nObject Neep 对象
 * @param tree 已有树
 */
function convert(
	nObject: EntityObject,
	source: any,
	tree?: (TreeNode | TreeNode[])[],
): (TreeNode | TreeNode[])[] {
	if (!tree) {
		return createAll(nObject, nObject.delivered, source);
	}
	return [...updateAll(nObject, nObject.delivered, source, tree)];
}


export default convert;
