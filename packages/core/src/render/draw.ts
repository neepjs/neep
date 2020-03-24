import { Tags, Template, isValue } from '../auxiliary';
import { IRender, NativeNode, NativeElement } from '../type';
import { createMountedNode, recoveryMountedNode } from './id';
import { TreeNode } from './convert';

/**
 * @description node / component / children 至少一个有效
 */
export interface MountedNode extends TreeNode {
	id: number;
	parent?: this;
	node: undefined | NativeNode;
}


type MountedNodes = MountedNode | MountedNode[]
	| (MountedNode | MountedNode[])[];

function getLastNode(tree: MountedNodes): NativeNode {
	if (Array.isArray(tree)) {
		return getLastNode(tree[tree.length - 1]);
	}
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getLastNode(component.tree); }
	return getLastNode(children);
}

function getFirstNode(tree: MountedNodes): NativeNode {
	if (Array.isArray(tree)) { return getFirstNode(tree[0]); }
	const { component, children, node } = tree;
	if (node) { return node; }
	if (component) { return getFirstNode(component.tree); }
	return getFirstNode(children[0]);
}

export function *getNodes(tree: MountedNodes): Iterable<NativeNode> {
	if (Array.isArray(tree)) {
		for (const it of tree) {
			yield* getNodes(it);
		}
		return;
	}
	const { children, node, component } = tree;
	if (node) {
		yield node;
		return;
	}
	if (component) {
		yield* getNodes(component.tree);
		return;
	}
	yield* getNodes(children);
}

export function unmount(iRender: IRender, tree: MountedNodes): void {
	if (Array.isArray(tree)) {
		tree.forEach(e => unmount(iRender, e));
		return;
	}
	const { component, children, node, ref } = tree;
	recoveryMountedNode(tree);
	if (node) {
		if (ref) { ref(node, true); }
		iRender.remove(node);
		return;
	}
	if (component) {
		if (ref) { ref(component.exposed, true); }
		component.unmount();
		return;
	}
	unmount(iRender, children);
}


function replace<T extends MountedNode | MountedNode[]>(
	iRender: IRender,
	newTree: T,
	oldTree: MountedNode | MountedNode[],
): T {
	const next = getFirstNode(oldTree);
	if (!next) { return newTree; }
	const parent = iRender.parent(next);
	if (!parent) { return newTree; }
	for (const it of getNodes(newTree)) {
		iRender.insert(parent, it, next);
	}
	unmount(iRender, oldTree);
	return newTree;
}

function updateList(
	iRender: IRender,
	source: TreeNode[],
	tree: MountedNode | MountedNode[],
): MountedNode[] {
	if (!source.length) {
		const node = createItem(iRender, {tag: null, children: []});
		return [replace(iRender, node, tree)];
	}
	if (!Array.isArray(tree)) { tree = [tree]; }
	const newList: MountedNode[] = [];
	const list = [...tree];
	const mountedMap = new Map<MountedNode, MountedNode>();
	for (const src of source) {
		const index = list.findIndex(it =>
			it.tag === src.tag && it.key === src.key
		);
		if (index >= 0) {
			const old = list[index];
			const item = updateItem(iRender, src, old);
			mountedMap.set(old, item);
			newList.push(item);
			list.splice(index, 1);
		} else {
			const item = createItem(iRender, src);
			newList.push(item);
		}
	}
	if (!mountedMap.size) {
		return replace(iRender, newList, list);
	}
	unmount(iRender, list);
	tree = tree.filter(t => mountedMap.has(t));
	const last = getLastNode(tree[tree.length - 1]);
	const parent = iRender.parent(last);
	if (!parent) { return newList; }
	let next = iRender.next(last);
	// 调整次序
	for(let i = newList.length - 1; i >= 0; i--) {
		const item = newList[i];
		const index = tree.findIndex(o => mountedMap.get(o) === item);
		if (index >= 0) {
			for (const it of tree.splice(index)) {
				mountedMap.delete(it);
			}
		} else {
			for (const it of getNodes(item)) {
				iRender.insert(parent, it, next);
			}
		}
		next = getFirstNode(item) || next;
	}
	return newList;
}
/**
 * 更新树
 * @param tree 已有树
 * @param source 用于替换的源
 * @param iRender Neep 对象
 */
function updateAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	let index = 0;
	let length = Math.min(source.length, source.length || 1);
	const list: (MountedNode | MountedNode[])[] = [];
	for (; index < length; index++) {
		const src = source[index];
		if (Array.isArray(src)) {
			list.push(updateList(iRender, src, tree[index]));
		} else {
			list.push(updateItem(iRender, src, tree[index]));
		}
	}
	length = Math.max(source.length, tree.length);
	if (tree.length > length) {
			// 销毁多余项
			for (; index < length; index++) {
			unmount(iRender, tree[index]);
		}
	}
	if (source.length > length) {
		// 创建多余项
		const last = getLastNode(list[list.length - 1]);
		const parent = iRender.parent(last);
		const next = iRender.next(last);
		for (; index < length; index++) {
			const src = source[index];
			const item = Array.isArray(src)
				? createList(iRender, src)
				: createItem(iRender, src);
			list.push(item);
			if (!parent) { continue; }
			for (const it of getNodes(item)) {
				iRender.insert(parent, it, next);
			}
		}
	}
	return list;
}

/**
 * 更新树节点
 * @param iRender Neep 对象
 * @param tree 已有树
 * @param source 用于替换的源
 */
function updateItem(
	iRender: IRender,
	source: TreeNode,
	tree: MountedNode | MountedNode[],
): MountedNode {
	if (Array.isArray(tree)) {
		const index = tree.findIndex(it =>
			it.tag === source.tag && it.component === source.component
		);
		if (index < 0) {
			return replace(iRender, createItem(iRender, source), tree);
		}
		const all = tree;
		[tree] = tree.splice(index, 1);
		unmount(iRender, all);
	}
	const { tag, component } = source;
	const ref = source.ref !== tree.ref && source.ref;
	if (tag !== tree.tag || component !== tree.component) {
		return replace(iRender, createItem(iRender, source), tree);
	}
	if (!tag) { return tree; }
	if (typeof tag !== 'string' || tag === Tags.Container) {
		if (!component) {
			// TODO: ref
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: draw(
					iRender,
					source.children,
					tree.children,
				),
			}, tree.id);
		}
		if (ref) { ref(component.exposed); }
		return createMountedNode({
			...source,
			node: undefined,
			component,
			children: [],
		}, tree.id);
	}
	if (tag === Tags.Value) {
		let value = source.value;
		if (isValue(value)) { value = value(); }
		if(tree.value === value) {
			if (ref && tree.node) { ref(tree.node); }
			return createMountedNode({
				...tree,
				...source,
				value,
				children: [],
			}, tree.id);
		}
		return replace(iRender, createValue(iRender, source, value), tree);
	}
	if (tag === Template || tag.substr(0, 5) === 'Neep:') {
		// TODO: ref
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: updateAll(
				iRender,
				source.children,
				tree.children,
			),
		}, tree.id);
	}
	const { node } = tree;
	iRender.update(
		node as NativeElement,
		source.props || {},
		isValue,
	);
	if (ref) { ref(node!); }
	if (!source.children.length && !tree.children.length) {
		return createMountedNode(
			{
				...tree,
				...source,
				children: [],
			},
			tree.id);
	}
	if (!source.children.length && tree.children.length) {
		unmount(iRender, tree.children);
	}
	if (source.children.length && !tree.children.length) {
		const children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insert(node as NativeElement, it);
		}
		return createMountedNode({
			...tree,
			...source,
			children,
		}, tree.id);
	}
	return createMountedNode({
		...tree, ...source,
		children: updateAll(
			iRender,
			source.children,
			tree.children,
		),
	}, tree.id);
}

function createValue(
	iRender: IRender,
	source: TreeNode,
	value: any,
): MountedNode {
	let { ref } = source;
	if (iRender.isNode(value)) {
		if (ref) { ref(value); }
		return createMountedNode({
			...source,
			value,
			node: value,
			children: [],
			component: undefined,
		});
	}
	const type = typeof value;
	let node: NativeNode | undefined;
	if (
		type === 'bigint'
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'string'
		|| type === 'symbol'
		|| value instanceof RegExp
	) {
		node = iRender.text(String(value));
	} else if (value instanceof Date) {
		node = iRender.text(value.toISOString());
	} else if (type === 'object' && value) {
		node = iRender.text(String(value));
		// TODO: 对象处理
	}
	if (!node) { node = iRender.placeholder(); }
	if (ref) { ref(node); }
	return createMountedNode({
		...source,
		value,
		node,
		component: undefined,
		children: [],
	});
}

function createAll(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
): (MountedNode | MountedNode[])[] {
	if (!source.length) {
		return [createMountedNode({
			tag: null,
			node: iRender.placeholder(),
			component: undefined,
			children: [],
		})];
	}

	return source.map(item =>
		Array.isArray(item)
			? createList(iRender, item)
			: createItem(iRender, item)
	);
}

function createList(
	iRender: IRender,
	source: TreeNode[],
): MountedNode[] {
	if (source.length) {
		return source.map(it => createItem(iRender, it));
	}
	return [createMountedNode({
		tag: null,
		node: iRender.placeholder(),
		component: undefined,
		children: [],
	})];
}

function createItem(
	iRender: IRender,
	source: TreeNode,
): MountedNode {
	const { tag, ref, component } = source;
	if (!tag) {
		const node = iRender.placeholder();
		if (ref) { ref(node); }
		return createMountedNode({
			tag: null,
			node,
			component: undefined,
			children: [],
		});
	}
	if (typeof tag !== 'string' || tag === Tags.Container) {
		if (!component) {
			// TODO: ref
			return createMountedNode({
				...source,
				node: undefined,
				component: undefined,
				children: draw(iRender, source.children),
			});
		}
		component.mount();
		if (ref) { ref(component.exposed); }
		return createMountedNode({
			...source,
			node: undefined,
			component, children: [],
		});
	}
	if (tag === Tags.Value) {
		return createValue(iRender, source, source.value);
	}
	if (tag === Template || tag.substr(0, 5) === 'Neep:') {
		// TODO: ref
		return createMountedNode({
			...source,
			node: undefined,
			component: undefined,
			children: createAll(iRender, source.children),
		});
	}
	const node = iRender.create(tag, source.props || {}, isValue);
	if (ref) { ref(node); }
	let children: (MountedNode | MountedNode[])[] = [];
	if (source.children) {
		children = createAll(iRender, source.children);
		for (const it of getNodes(children)) {
			iRender.insert(node, it);
		}
	}
	return createMountedNode({
		...source,
		node,
		component: undefined,
		children,
	});
}

export default function draw(
	iRender: IRender,
	source: (TreeNode | TreeNode[])[],
	tree?: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (tree) {
		return updateAll(iRender, source, tree);
	}
	return createAll(iRender, source);
}
