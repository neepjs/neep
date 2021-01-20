import { IRenderer } from '../type';
import { assert } from '../Error';

let nextFrameApi: undefined | ((fn: () => void) => void);
export function nextFrame(fn: () => void): void {
	assert(nextFrameApi, 'The basic renderer is not installed', 'install');
	nextFrameApi(fn);
}

export const renderers: Record<string, IRenderer>
	= Object.create(null);

export function getRender(
	type: string | number | IRenderer = '',
	def = renderers.default,
): IRenderer {
	if (typeof type === 'object') { return type; }
	return renderers[type] || def;
}

export default function installRender(renderer?: IRenderer): void {
	if (!renderer) { return; }
	renderers[renderer.type] = renderer;
	if (nextFrameApi) { return; }
	if (!renderers.default) {
		renderers.default = renderer;
	}
	if (!nextFrameApi && renderer.nextFrame) {
		renderers.default = renderer;
		nextFrameApi = renderer.nextFrame.bind(renderer);
	}

}
