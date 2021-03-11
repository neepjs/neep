import {
	IRenderer,
	MountedNode,
	TreeNodeList,
	MountOptions,
} from '../../../types';
import createItem from './createItem';
import createList from './createList';
import drawPlaceholder from './drawPlaceholder';


export default function createAll(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNodeList,
): (MountedNode | MountedNode[])[] {
	if (!source.length) {
		return [drawPlaceholder(renderer)];
	}

	return source.map(item =>
		Array.isArray(item)
			? createList(renderer, mountOptions, item)
			: createItem(renderer, mountOptions, item));
}
