import { isProduction } from '../../constant/info';
import { Label } from '../../types';
import { setLabels } from '../../extends/current';


export default function withLabel(...label: (string | Label)[]): void {
	if (!isProduction) {
		const labels = label.filter(Boolean).map(t => typeof t === 'string' ? {text: t} : t);
		if (!setLabels) { return; }
		setLabels(labels);
	}
}
