import {
	IRenderer,
	TreeNode,
	MountedNode,
	TreeNodeList,
	MountOptions,
} from '../../type';
import { createMountedNode } from '../id';


export function createPlaceholder(renderer: IRenderer): MountedNode {
	const node = renderer.createPlaceholder();
	return createMountedNode({ tag: null, node });
}

export function createItem(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode | null,
): MountedNode {
	if (!source) { return createPlaceholder(renderer); }
	const { proxy } = source;
	proxy.mount(mountOptions);
	return createMountedNode({
		...source,
		node: undefined,
		proxy,
	});
}


export function createList(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode[],
): MountedNode[] {
	if (source.length) {
		return source.map(it => createItem(renderer, mountOptions, it));
	}
	return [createPlaceholder(renderer)];
}

export function createAll(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNodeList,
): (MountedNode | MountedNode[])[] {
	if (!source.length) {
		return [createPlaceholder(renderer)];
	}

	return source.map(item =>
		Array.isArray(item)
			? createList(renderer, mountOptions, item)
			: createItem(renderer, mountOptions, item));
}
