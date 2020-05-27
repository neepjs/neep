import { isProduction } from '../constant';
import { current } from '../extends';
import { setLabel } from '../extends/label';

export function label(text: string, color = ''): void {
	if (!isProduction) {
		if (!current) {
			setLabel([text, color]);
			return;
		}
		Reflect.defineProperty(current.exposed, '$label', {
			value: [text, color],
			configurable: true,
		});
	}
}
