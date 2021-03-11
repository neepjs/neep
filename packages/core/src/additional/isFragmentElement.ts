import { Element } from '../types';
import { isElement } from '../auxiliary';

export default function isFragmentElement(v: any): v is Element<'template'> {
	if (!isElement(v)) { return false; }
	const { tag } = v;
	if (typeof tag !== 'string') { return false; }
	return tag.toLowerCase() === 'template';
}
