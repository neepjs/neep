import devtools from '../devtools';
import installNeep from './neep';
installNeep()({ devtools });
export default function install(Neep: typeof import('@neep/core')) {
}
