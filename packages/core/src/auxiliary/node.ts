import { NativeNode, Rect } from '../type';
import { renders } from '../install';

export function getRect(n: NativeNode): Rect | null {
	for (const render of [...Object.values(renders)]) {
		if (!render) { continue; }
		if (!render.isNode(n)) { continue; }
		const rect = render.getRect(n);
		if (rect) { return rect; }
	}
	return null;
}
