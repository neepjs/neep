import { NativeNode, Rect } from '../type';
import { renders } from '../install';

export function getRect(n: NativeNode): Rect | null {
	for (const t of Object.keys(renders)) {
		const render = renders[t];
		if (!render) { continue; }
		if (!render.isNode(n)) { continue; }
		const rect = render.getRect(n);
		if (rect) { return rect; }
	}
	return null;
}
