import { Devtools } from '../../../devtools/src/type';

export const devtools: Devtools = {
	renderHook(){},
};

export default function installDevtools(tools?: Partial<Devtools>) {
	if (!tools) { return; }
	if (typeof tools !== 'object') { return; }
	const { renderHook } = tools;
	if (typeof renderHook === 'function') {
		devtools.renderHook = renderHook;
	}
}
