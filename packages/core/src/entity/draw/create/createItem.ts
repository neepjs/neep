import {
	IRenderer,
	TreeNode,
	MountedNode,

	MountOptions,
} from '../../../types';
import { createMountedNode } from '../../id';
import drawPlaceholder from './drawPlaceholder';


export default function createItem(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode | null,
): MountedNode {
	if (!source) { return drawPlaceholder(renderer); }
	const { proxy } = source;
	proxy.mount(mountOptions);
	return createMountedNode({
		...source,
		node: undefined,
		proxy,
	});
}
