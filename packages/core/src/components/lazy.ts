import { Component, Context, NeepNode } from '../type';
import { value } from '../install';
import { mSimple, mark, mName } from '../create';
import { createElement } from '../auxiliary';

export default function lazy<
	P extends object = object,
	C extends Component<P, any> = Component<P, any>
>(
	component: () => Promise<C | { default: C }>,
	Placeholder?: Component<{ loading: boolean }, any>,
): Component<P> {
	const reslut = value<0 | 1 | -1>(0);
	const ComponentValue = value<undefined | C>(undefined);
	async function load(): Promise<void> {
		if (reslut()) { return; }
		reslut(1);
		try {
			const c = await component();
			if (typeof c === 'function') {
				ComponentValue(c);
				return;
			}
			if (!c) {
				reslut(-1);
				return;
			}
			if (typeof c.default === 'function') {
				ComponentValue(c.default);
				return;
			}
			reslut(-1);
		} catch {
			reslut(-1);
		}
	}
	function Lazy(
		props: P,
		{ childNodes }: Context,
	): NeepNode {
		const com = ComponentValue();
		if (com) { return createElement(com, props, ...childNodes); }
		load();
		if (!Placeholder) { return null; }
		return createElement(Placeholder, { loading: reslut() > 0});
	}
	return mark(Lazy, mSimple, mName('Lazy'));
}
