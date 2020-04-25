import devtools from '../devtools';
import installNeep from './neep.esm';
export default function install(Neep: typeof import('@neep/core')) {
	installNeep(Neep)({ devtools });
}
