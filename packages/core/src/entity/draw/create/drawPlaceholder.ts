import {
	IRenderer,

	MountedNode,
} from '../../../types';
import { createMountedNode } from '../../id';


export default function drawPlaceholder(renderer: IRenderer): MountedNode {
	const node = renderer.createPlaceholder();
	return createMountedNode({ tag: null, node });
}
