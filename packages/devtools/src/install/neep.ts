import devtools from '../devtools';
import { install as NeepInstall } from '@neep/core';
NeepInstall({ devtools });

export {
	render,
	createElement,
	setHook,
	isValue,
	encase,
} from '@neep/core';

export default function install(Neep: typeof import('@neep/core')) {
}
