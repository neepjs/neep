import { Neep } from '../install';
import { getTree } from '../tree';
import App from '../app';
import { Devtools } from '../type';
import { RootExposed } from '@neep/core';

let creating = false;

const devtools: Devtools = {
	renderHook(container) {
		if (creating) { return; }
		let app: RootExposed | undefined;
		try {
			creating = true;
			const getData = () => {
				if (!app) { app = Neep.render(); }
				const tree = [...getTree(container.content)];
				app.$update(Neep.createElement(App, {
					tree,
					value: true,
					tag: true,
					simple: true,
					container: true,
					template: true,
					scopeSlot: true,
					slotRender: true,
				}));
			};
			Neep.setHook('drawedAll', getData, container.exposed);
			Neep.setHook('mounted', () => {
				if (!app) { app = Neep.render(); }
				getData();
				app.$mount();
			}, container.exposed);
		} finally {
			creating = false;
		}
	},
};

export default devtools;
