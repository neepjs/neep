import { isProduction } from '../constant';
import { Label } from '../type';
import { setLabels } from '../extends/current';


export function label(...label: (string | Label)[]): void {
	if (!isProduction) {
		const labels = label.filter(Boolean).map(t => typeof t === 'string' ? {text: t} : t);
		if (!setLabels) { return; }
		setLabels(labels);

	}
}
