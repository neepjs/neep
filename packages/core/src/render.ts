import {
	MountProps,
	NeepElement,
	Component,
	RootExposed,
} from './type';
import { isElement, createElement } from './auxiliary';
import { isProduction } from './constant';
import { devtools, getRender } from './install';
import ContainerEntity from './entity/ContainerEntity';


export default function render(
	e?: NeepElement | Component,
	p: MountProps = {},
): RootExposed {
	let params = {...p};
	const container =  new ContainerEntity(
		getRender(p.type),
		params,
		e === undefined ? [] : isElement(e) ? [e] : [createElement(e)],
	);
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
	Reflect.defineProperty(exposed, '$unmount', {
		value() {
			if (!exposed.$mounted) { return; }
			if (exposed.$unmounted) { return; }
			if (exposed.$destroyed) { return container.destroy(); }
			container.unmount();
		},
		configurable: true,
	});
	if (params.target) {
		container.mount();
	}
	return exposed as any as RootExposed;
}
