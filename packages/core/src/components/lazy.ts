import {
	Component,
	SimpleComponent,
} from '../type';
import { value } from '../install/monitorable';
import {
	createElement,
} from '../auxiliary';
import {
	createSimpleComponent,
} from '../create';

const LOADING = 0;
type LOADING = typeof LOADING;
const FAILING = -1;
type FAILING = typeof FAILING;
const COMPLETE = 1;
type COMPLETE = typeof COMPLETE;

export default function lazy<
	P extends object,
	C extends Component<P>
>(
	component: () => Promise<C | { default: C }>,
	Placeholder?: Component<{ loading: boolean }>,
): SimpleComponent<P, any> {
	const reslut = value<LOADING | FAILING | COMPLETE>(LOADING);
	let isLoad = false;
	const ComponentValue = value<undefined | C>(undefined);
	async function load(): Promise<void> {
		if (isLoad) { return; }
		isLoad = true;
		if (reslut()) { return; }
		reslut(COMPLETE);
		try {
			const c = await component();
			if (typeof c === 'function') {
				ComponentValue(c);
				return;
			}
			if (!c) {
				reslut(FAILING);
				return;
			}
			if (typeof c.default === 'function') {
				ComponentValue(c.default);
				return;
			}
			reslut(FAILING);
		} catch (e) {
			console.error(e);
			reslut(FAILING);
		}
	}
	return createSimpleComponent((props, { childNodes }) => {
		const com = ComponentValue();
		if (com) { return createElement(com, props, ...childNodes); }
		load();
		if (!Placeholder) { return null; }
		return createElement(Placeholder, { loading: reslut() === LOADING});
	}, {name: 'Lazy'});
}
