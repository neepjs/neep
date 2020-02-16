
import {
	MountProps,
	NeepElement,
	NeepComponent,
	Container,
	isElement,
	createElement,
} from '@neep/core';
import { getTree } from './tree';
import App from './app';

export function render(
	e: NeepElement | NeepComponent,
	p: MountProps = {},
): void {
	const container = isElement(e)
		? new Container(p, [e])
		: new Container(p, [createElement(e)]);
	const app = new Container({}, []);
	function getData() {
		const tree = [...getTree(container.content)];
		console.log(tree);
		app.update({}, [createElement(App, {
			tree,
			value: true,
			tag: true,
			simple: true,
			container: true,
			template: true,
			// scopeSlot: true,
			slotRender: true,
		})]);
	}
	container.setHook('drawedAll', getData);
	container.mount();
	getData();
	app.mount();
}
