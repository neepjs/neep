import { MountProps, NeepElement, NeepComponent, RootExposed } from './type';
import Container from './Container';
import { isElement, createElement } from './auxiliary';
import { isProduction } from './constant';
import { devtools } from './install';

export default function render(
	e?: NeepElement | NeepComponent,
	p: MountProps = {},
): RootExposed {
	let children =
		e === undefined ? []
			: isElement(e) ? [e] : [createElement(e)];
	let params = {...p};
	const container =  new Container(params, children);
	if (!isProduction) {
		devtools.renderHook(container);
	}
	const { exposed } = container;
	Reflect.defineProperty(exposed, '$update', {
		value(c: any) {
			children =
				c === undefined ? []
					: isElement(c) ? [c] : [createElement(c)];
			container.update(params, children);
			return exposed;
		},
		configurable: true,
	});
	Reflect.defineProperty(exposed, '$mount', {
		value(target?: any) {
			if (exposed.$mounted) { return exposed; }
			if (target) {
				params.target = target;
				container.update(params, children);
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
