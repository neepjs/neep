import { Neep } from '../install';
import { getTree } from '../tree';
import App from '../app';
import { Devtools } from '../type';
import { RootExposed } from '@neep/core';

let creating = false;
function create() {
	creating = true;
	try {
		return Neep.render();
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
		Neep.setHook('drawedAll', getData, container.entity);
		Neep.setHook('mounted', () => {
			if (!app) { app = create(); }
			getData();
			app.$mount();
		}, container.entity);
	},
};

export default devtools;
