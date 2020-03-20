import devtools from './devtools';

export let Neep: typeof import('@neep/core');
export default function install(neep: typeof import('@neep/core')) {
	neep.install({ devtools });
	Neep = neep;
}
