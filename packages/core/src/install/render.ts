import { IRender } from '../type';
import { assert } from '../Error';

let nextFrameApi: undefined | ((fn: () => void) => void);
export function nextFrame(fn: () => void): void {
	assert(nextFrameApi, 'The basic renderer is not installed', 'install');
	if (nextFrameApi) {
		nextFrameApi(fn);
	}
}

export const renders: Record<string, IRender>
	= Object.create(null);

export function getRender(
	type: string | number | IRender = '',
): IRender {
	if (typeof type === 'object') { return type; }
	return renders[type] || renders.default;
}

export default function installRender(render?: IRender): void {
	if (!render) { return; }
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
