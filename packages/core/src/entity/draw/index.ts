import { IRenderer, TreeNodeList, MountOptions, MountedNode } from '../../type';
import { updateAll } from './update';
import { createAll } from './create';
export { unmount, getNodes } from './utils';

export default function draw(
	renderer: IRenderer,
	mountOptions: MountOptions,
	source: TreeNodeList,
	tree?: (MountedNode | MountedNode[])[],
): (MountedNode | MountedNode[])[] {
	if (!tree) {
		return createAll(renderer, mountOptions, source);
	}
	return updateAll(renderer, mountOptions, source, tree);
}
