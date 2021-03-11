import {
	Element,
} from '../../types';
import { objectTypeSymbol, objectTypeSymbolElement } from '../../constant/symbols';

/**
 * 判读是否为元素
 */
export default function isElement(v: any): v is Element {
	if (!v) { return false; }
	if (typeof v !== 'object') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolElement;
}
