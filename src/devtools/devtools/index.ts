import { Neep } from '../install';
import { getTree } from '../tree';
import App from '../app';
import { Devtools } from '../type';

let creating = false;

const devtools: Devtools = {
	renderHook(container) {
		if (creating) { return; }
		try {
			creating = true;
			const app = Neep.render();
			const getData = () => {
				const tree = [...getTree(container.content)];
				console.log(tree);
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
				getData();
				app.$mount();
			}, container.exposed);
		} finally {
			creating = false;
		}
	},
};

export default devtools;
