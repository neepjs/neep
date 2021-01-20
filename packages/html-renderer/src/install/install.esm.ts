import renderer from '../renderer';
import installNeep from './neep.esm';
import init from './init';

export default function install(
	Neep: typeof import('@neep/core'),
): void {
	installNeep(renderer, Neep);
	init();
}
