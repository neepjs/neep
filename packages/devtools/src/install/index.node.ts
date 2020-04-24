import devtools from '../devtools';

export {
	render,
	createElement,
	setHook,
	isValue,
	encase,
} from '@neep/core';
import { install as NeepInstall } from '@neep/core';
NeepInstall({ devtools });

export default function install(Neep: typeof import('@neep/core')) {
}
