import * as monitorableApi from 'monitorable';
import { IRender } from './type';
import { isProduction } from './constant';

import { Devtools } from '../../devtools/src/type';
import { assert } from './Error';

export let monitorable: typeof monitorableApi;

export let value: typeof monitorableApi.value;
export let computed: typeof monitorableApi.computed;
export let isValue: typeof monitorableApi.isValue;
export let encase: typeof monitorableApi.encase;
export let recover: typeof monitorableApi.recover;

function installMonitorable(api?: typeof monitorableApi) {
	if (!api) { return; }
	monitorable = api;
	value = monitorable.value;
	computed = monitorable.computed;
	isValue = monitorable.isValue;
	encase = monitorable.encase;
	recover = monitorable.recover;
}

export interface InstallOptions {
	monitorable?: typeof monitorableApi;
	render?: IRender;
	renders?: IRender[];
	devtools?: any;
}


let nextFrameApi: undefined | ((fn: () => void) => void);
export function nextFrame(fn: () => void): void {
	assert(nextFrameApi, 'The basic renderer is not installed', 'install');
	nextFrameApi!(fn);
}

export const renders: Record<string, IRender>
	= Object.create(null);

export function getRender(
	type: string | number | IRender = ''
	): IRender {
	if (typeof type === 'object') { return type; }
	return renders[type] || renders.default;
}

function addRender(render?: IRender): void {
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
function installRender({ render, renders}: InstallOptions) {
	addRender(render);
	if (!Array.isArray(renders)) { return; }
	for (const render of renders) {
		addRender(render);
	}
}


export const devtools: Devtools = {
	renderHook(){},
};

function installDevtools(tools?: Partial<Devtools>) {
	if (!tools) { return; }
	if (typeof tools !== 'object') { return; }
	const { renderHook } = tools;
	if (typeof renderHook === 'function') {
		devtools.renderHook = renderHook;
	}
}


export default function install(apis: InstallOptions) {
	installMonitorable(apis.monitorable);
	installRender(apis);
	if (!isProduction) {
		installDevtools(apis.devtools);
	}
}
