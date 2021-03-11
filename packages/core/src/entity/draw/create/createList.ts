import {
	IRenderer,
	TreeNode,
	MountedNode,

	MountOptions,
} from '../../../types';
import createItem from './createItem';
import drawPlaceholder from './drawPlaceholder';


export default function createList(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNode[],
): MountedNode[] {
	if (source.length) {
		return source.map(it => createItem(renderer, mountOptions, it));
	}
	return [drawPlaceholder(renderer)];
}
