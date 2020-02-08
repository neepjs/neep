import * as monitorableApi from 'monitorable';
import { IRender } from './type';

export let monitorable: typeof monitorableApi;

export const renders: Record<string, IRender>
	= Object.create(null);
export function getRender(
	type: string | number | IRender = ''
	): IRender {
	if (typeof type === 'object') { return type; }
	return renders[type] || renders.default;
}
export default function install(apis: {
	monitorable?: typeof monitorableApi;
	render?: IRender;
	renders?: IRender[];
}) {
	const { render } = apis;
	if (render) {
		renders[render.type] = render;
		if (!renders.default) {
			renders.default = render;
		}
	}
	if (Array.isArray(apis.renders)) {
		for (const render of apis.renders) {
			renders[render.type] = render;
		}
		if (!renders.default) {
			const [render] = apis.renders;
			if (render) { renders.default = render; }
		}
	}
	if (apis.monitorable) {
		monitorable = apis.monitorable;
	}
}
