import { current } from '../helper';
import { isProduction } from '../constant';
import { setLabel } from '../helper/label';

export function label(text: string, color = '') {
	if (!isProduction) {
		if (!current) {
			setLabel([text, color]);
			return;
		}
		Reflect.defineProperty(current, '$label', {
			value: [text, color],
			configurable: true,
		});
	}
}
