import { isProduction } from '../../constant/info';
import { Label } from '../../types';
import { checkCurrent } from '../../extends/current';


export default function withLabel(...label: (string | Label)[]): void {
	if (!isProduction) {
		const { setLabels } = checkCurrent('withLabel');
		if (!setLabels) { return; }
		setLabels(label.filter(Boolean).map(t => typeof t === 'string' ? {text: t} : t));
	}
}
