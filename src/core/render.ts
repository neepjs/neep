import { MountProps, NeepElement, NeepComponent } from './type';
import Container from './Container';
import { isElement, createElement } from './auxiliary';
import { isProduction } from './constant';
import { callHook } from './hook';

export default function render(
	e: NeepElement | NeepComponent,
	p: MountProps = {},
): void {
	const container = isElement(e)
		? new Container(p, [e])
		: new Container(p, [createElement(e)]);
	if (!isProduction) {
		callHook('render', container);
	}
	container.mount();
}
