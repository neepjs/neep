import { isSimpleComponent } from '../is';
import { isElement } from '../auxiliary';

export default function isSimpleElement(v: any): boolean {
	return isElement(v) && isSimpleComponent(v.tag);
}
