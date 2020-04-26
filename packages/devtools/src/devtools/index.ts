import { render, createElement, setHook } from '../install/neep';
import { getTree } from '../tree';
import App from '../app';
import { RootExposed, Devtools } from '@neep/core';

let creating = false;
function create() {
	creating = true;
	try {
		return render();
	} finally {
		creating = false;
	}
}

const devtools: Devtools = {
	renderHook(container) {
		if (creating) { return; }
		let app: RootExposed | undefined;
		const getData = () => {
			if (!app) { app = create(); }
			const tree = [...getTree(container.content)];
			app.$update(createElement(App, {
				tree,
				value: true,
				tag: true,
				// simple: true,
				// container: true,
				// template: true,
				// scopeSlot: true,
				// slotRender: true,
				// deliver: true,
			}));
		};
		setHook('drawnAll', getData, container.entity);
		setHook('mounted', () => {
			if (!app) { app = create(); }
			getData();
			app.$mount();
		}, container.entity);
	},
};

export default devtools;
