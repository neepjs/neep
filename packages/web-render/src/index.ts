import install from './install';
import render from './render';
import * as core from '@neep/core';
interface Render extends core.IRender {
	install(Neep: typeof core): void;
}

export default {
	...render,
	install,
} as Render;
