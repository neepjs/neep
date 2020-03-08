import {
	MountProps,
	NeepElement,
	Component,
	RootExposed,
} from '../type';
import { isElement, createElement } from '../auxiliary';
import { isProduction } from '../constant';
import { devtools } from '../install';
import Container from './Container';

export default function render(
	e?: NeepElement | Component,
	p: MountProps = {},
): RootExposed {
	let params = {...p};
	const container =  new Container(params, e === undefined ? []
		: isElement(e) ? [e] : [createElement(e)]);
	if (!isProduction) {
		devtools.renderHook(container);
	}
	const { exposed } = container;
	Reflect.defineProperty(exposed, '$update', {
		value(c?: NeepElement | Component) {
			container.setChildren(c === undefined ? []
				: isElement(c) ? [c] : [createElement(c)]);
			return exposed;
		},
		configurable: true,
	});
	Reflect.defineProperty(exposed, '$mount', {
		value(target?: any) {
			if (exposed.$mounted) { return exposed; }
			if (target) {
				params.target = target;
				container.setProps(params);
			}
			container.mount();
			return exposed;
		},
		configurable: true,
	});
	if (params.target) {
		container.mount();
	}
	return exposed as any as RootExposed;
}
