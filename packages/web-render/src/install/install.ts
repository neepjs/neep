import render from '../render';
import installNeep from './neep';

installNeep()({ render });

export default function install(
	Neep: typeof import('@neep/core'),
): void {
}
