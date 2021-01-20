import { install as NeepInstall } from '@neep/core';

export {
	isValue,
	createContainerComponent,
	createElement,
} from '@neep/core';

export default function installNeep(
	renderer: import('@neep/core').IRenderer,
): void {
	NeepInstall({renderer});
}
