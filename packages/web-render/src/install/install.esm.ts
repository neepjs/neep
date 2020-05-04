import render from '../render';
import installNeep from './neep.esm';
export default function install(
	Neep: typeof import('@neep/core'),
): void {
	installNeep(Neep)({ render });
}
