import auxiliary, { Tags, isElement, Value } from './auxiliary';
import { recursive2iterable } from './recursive';
import { NeepNode, TreeNode, NeepElement, NeepComponent } from './type';
import Entity from './Entity';
import Container from './Container';
import { typeSymbol } from './create/mark/symbols';
import { isElementSymbol } from './symbols';
import { getSlots, setSlots } from './utils/slot';
import normalize from './utils/normalize';

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
		tag: Value,
		key: t,
		value: t,
		children: [],
	};
}

export function destroy(
	tree: TreeNode | TreeNode[] | (TreeNode | TreeNode[])[]
) {
	if (Array.isArray(tree)) {
		tree.forEach(t => destroy(t));
		return;
	}
	const { component } = tree;
	if (component) { component.destroy(); }
}


function execSimple(
	nObject: Container | Entity,
	tag: NeepComponent<any, any>,
	{ props, on, children }: NeepElement,
): any[] {
	const { iRender } = nObject.container;
	const slots = Object.create(null);
	getSlots(iRender, children, slots);
	const context = {
		slots: setSlots(iRender, slots),
		get inited() {
			return false;
		},
		get parent() {
			return nObject.exposed;
		},
		get children() {
			return nObject.children;
		},
	};
	const result = tag({...props}, context, auxiliary);
	const nodes = normalize(result, context, tag, iRender);
	return Array.isArray(nodes) ? nodes : [nodes];
}

function createItem(
	nObject: Entity<any, any> | Container,
	source: NeepNode,
): TreeNode {
	if (!source) { return { tag: null, children: [] }; }
	const { tag } = source;
	if (!tag) { return { tag: null, children: [] }; }
	if (typeof tag === 'function' && tag[typeSymbol] === 'simple') {
		return {
			...source,
			children: execSimple(nObject, tag, source),
			component: undefined,
		};
	}
	if (typeof tag !== 'string') {
		return {
			...source, children: [],
			component: new Entity(
				tag,
				source.props || {},
				source.children,
				nObject,
			),
		};
	}
	if (tag === Tags.Value) {
		return { ...source, children: [] };
	}
	if ([Tags.Template, Tags.ScopeSlot].includes(tag)) {
		return {
			...source,
			children: convert(nObject, source.children),
		};
	}
	if (tag.substr(0, 5) === 'Neep:') {
		return { tag: null, children: [] };
	}
	return {...source, children: convert(nObject, source.children) };
}

/**
 * 更新树节点
 * @param nObject Neep 对象
 * @param source 用于替换的源
 * @param tree 已有树
 */
function updateList(
	nObject: Entity<any, any> | Container,
	source: any[],
	tree: TreeNode | TreeNode[],
): TreeNode[] {
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: TreeNode[] = [];
	for (const src of recursive2iterable(source)) {
		const node = toElement(src);
		if (!node) { continue; }
		const index = tree.findIndex(it =>
			it.tag === node.tag && it.key === node.key
		);
		if (index >= 0) {
			newList.push(updateItem(nObject, node, tree[index]));
			tree.splice(index, 1);
		} else {
			newList.push(createItem(nObject, node));
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
	nObject: Entity<any, any> | Container,
	source: NeepNode,
	tree?: TreeNode | TreeNode[],
): TreeNode {
	if (!tree) {
		return createItem(nObject, source);
	}
	if (!source) {
		destroy(tree);
		return { tag: null, children: [] };
	}
	if (Array.isArray(tree)) {
		if (!tree.length) { return createItem(nObject, source); }
		const index = tree.findIndex(it => it.tag === source.tag);
		if (index < 0) {
			destroy(tree);
			return createItem(nObject, source);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		destroy(all);
	}
	const { tag } = source;
	if (tag !== tree.tag) {
		destroy(tree);
		return createItem(nObject, source);
	}
	if (!tag) { return { tag: null, children: [] }; }
	if (typeof tag === 'function' && tag[typeSymbol] === 'simple') {
		return {
			...source,
			children: convert(nObject,
				execSimple(nObject, tag, source),
				tree.children,
			),
			component: undefined,
		};
	}
	if (typeof tag !== 'string') {
		let { component } = tree;
		component!.update(source.props || {}, source.children);
		return { ...source, children: [], component };
	}
	if (tag === Tags.Value) {
		return { ...source, children: [] };
	}
	if ([Tags.Template, Tags.ScopeSlot].includes(tag)) {
		return {
			...source,
			children: convert(
				nObject,
				source.children,
				tree.children,
			),
		};
	}
	if (tag.substr(0, 5) === 'Neep:') {
		return { tag: null, children: [] };
	}
	return {
		...source,
		children: convert(nObject, source.children, tree.children),
	};
}


function createAll(
	nObject: Entity<any, any> | Container,
	source: any[],
): (TreeNode | TreeNode[])[] {
	if (!source.length) { return []; }
	return (source as any[]).map(item => {
		if (!Array.isArray(item)) {
			return createItem(nObject, toElement(item));
		}
		return [...recursive2iterable(item)]
			.map(it => createItem(nObject, toElement(it)));
	});
}
function *updateAll(
	nObject: Entity<any, any> | Container,
	source: any[],
	tree: (TreeNode | TreeNode[])[],
): Iterable<TreeNode | TreeNode[]> {
	let index = 0;
	let length = Math.min(source.length, source.length);
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			yield updateList(nObject, src, tree[index]);
		} else {
			yield updateItem(nObject, toElement(src), tree[index]);
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
			const src = source[index];
			if (Array.isArray(src)) {
				yield [...recursive2iterable(src)]
					.map(it => createItem(nObject, it));
			} else {
				yield createItem(nObject, src);
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
	nObject: Entity<any, any> | Container,
	source: any,
	tree?: (TreeNode | TreeNode[])[],
): (TreeNode | TreeNode[])[] {
	if (!Array.isArray(source)) { source = []; }
	if (!tree) {
		return createAll(nObject, source);
	}
	return [...updateAll(nObject, source, tree)];
}


export default convert;
