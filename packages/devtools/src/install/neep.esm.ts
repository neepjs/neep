export let render: typeof import('@neep/core').render;
export let createElement: typeof import('@neep/core').createElement;
export let setHook: typeof import('@neep/core').setHook;
export let isValue: typeof import('@neep/core').isValue;
export let encase: typeof import('@neep/core').encase;


export default function install(Neep: typeof import('@neep/core')) {
	render = Neep.render;
	createElement = Neep.createElement;
	setHook = Neep.setHook;
	isValue = Neep.isValue;
	encase = Neep.encase;
	return Neep.install;
}
