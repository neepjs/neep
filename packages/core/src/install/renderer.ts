import { IRender } from '../type';
import EventEmitter from '../EventEmitter';
import NeepError, { assert } from '../Error';

import { isValue } from './monitorable';
import { InstallOptions } from '.';

let nextFrameApi: undefined | ((fn: () => void) => void);
export function nextFrame(fn: () => void): void {
	assert(nextFrameApi, 'The basic renderer is not installed', 'install');
	nextFrameApi!(fn);
}

const renders: Record<string, IRender>
	= Object.create(null);

export function getRender(
	type: string | number | IRender = ''
	): IRender {
	if (typeof type === 'object') { return type; }
	return renders[type] || renders.default;
}

function addRender(render?: IRender): void {
	if (!render) { return; }
	if (render.install) {
		render.install({
			get isValue() { return isValue; },
			EventEmitter,
			Error: NeepError,
		});
	}
	renders[render.type] = render;
	if (nextFrameApi) { return; }
	if (!renders.default) {
		renders.default = render;
	}
	if (!nextFrameApi && render.nextFrame) {
		renders.default = render;
		nextFrameApi = render.nextFrame;
	}

}

export default function installRender({ render, renders}: InstallOptions) {
	addRender(render);
	if (!Array.isArray(renders)) { return; }
	for (const render of renders) {
		addRender(render);
	}
}
