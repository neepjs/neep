import { IRenderer, TreeNodeList, MountOptions, MountedNode } from '../../types';
import updateAll from './update/updateAll';
import createAll from './create/createAll';
export { default as  unmount } from './unmount';
export { default as getNodes } from './update/getNodes';
export { default as drawReplace } from './update/drawReplace';
export { default as drawPlaceholder } from './create/drawPlaceholder';

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
