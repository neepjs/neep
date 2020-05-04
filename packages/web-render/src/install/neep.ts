import { install as NeepInstall } from '@neep/core';

export { isValue, EventEmitter, Error } from '@neep/core';
export default function installNeep(): typeof NeepInstall {
	return NeepInstall;
}
