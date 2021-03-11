import { Element } from '../../types';
import { Render } from '../../constant/tags';
import isElement from './isElement';

export default function isRenderElement(v: any): v is Element<typeof Render> {
	if (!isElement(v)) { return false; }
	const { tag } = v;
	if (typeof tag !== 'string') { return false; }
	return tag.toLowerCase() === Render;
}
