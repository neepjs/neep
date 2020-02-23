import * as monitorableApi from 'monitorable';
import { IRender } from './type';

export let monitorable: typeof monitorableApi;

export interface InstallOptions {
	monitorable?: typeof monitorableApi;
	render?: IRender;
	renders?: IRender[];
	devtools?: any;
}

export const renders: Record<string, IRender>
	= Object.create(null);

	export function getRender(
	type: string | number | IRender = ''
	): IRender {
	if (typeof type === 'object') { return type; }
	return renders[type] || renders.default;
}

function installRender({ render, renders: list}: InstallOptions) {
	if (render) {
		renders[render.type] = render;
		if (!renders.default) {
			renders.default = render;
		}
	}
	if (Array.isArray(list)) {
		for (const render of list) {
			renders[render.type] = render;
		}
		if (!renders.default) {
			const [render] = list;
			if (render) { renders.default = render; }
		}
	}
}


export default function install(apis: InstallOptions) {
	if (apis.monitorable) {
		monitorable = apis.monitorable;
	}
	installRender(apis);
}
