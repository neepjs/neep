export let isValue: typeof import('@neep/core').isValue;
export let EventEmitter: typeof import('@neep/core').EventEmitter;
export let Error: typeof import('@neep/core').Error;

export default function installNeep(
	Neep: typeof import('@neep/core'),
): typeof Neep.install {
	({isValue, EventEmitter, Error} = Neep);
	return Neep.install;
}
