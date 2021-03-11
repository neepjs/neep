import { Element, ValueElement } from '../../types';
import { isElement } from '../../auxiliary';

/** 强制转换为 Element */

export default function toElement(t: any): null | Element | ValueElement {
	if (t === false || t === null || t === undefined) {
		return null;
	}
	if (isElement(t)) {
		return t;
	}
	return { key: t, props: { value: t }, children: [] };
}
