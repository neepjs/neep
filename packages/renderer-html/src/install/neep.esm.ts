export let isValue: typeof import('@neep/core').isValue;
export let createContainerComponent: typeof import('@neep/core').createContainerComponent;
export let createElement: typeof import('@neep/core').createElement;

export default function installNeep(
	renderer: import('@neep/core').IRenderer,
	Neep: typeof import('@neep/core').default,
): void {
	({
		isValue,
		createContainerComponent,
		createElement,
	} = Neep);
	Neep.install({renderer});
}
