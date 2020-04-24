import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import resolve from './rollup-plugins/resolve';
import babel from './rollup-plugins/babel';
import replace from './rollup-plugins/replace';
import fsFn from 'fs';
const name = process.env['NAME'] || 'core';
const dir = `./packages/${ name }`;
const {
	version,
	author,
	license,
} = JSON.parse(fsFn.readFileSync(`${ dir }/package.json`));

const bYear = 2019;
const year = new Date().getFullYear();
const date = bYear === year ? bYear : `${ bYear }-${ year }`;

const isRender = /-render$/.test(name);
const isCore = name === 'core';
const GlobalName = isCore ? 'Neep' : `Neep${name.replace(
	/(?:^|-)([a-z])/g,
	(_, s) => s.toUpperCase()
)}`;
const banner = `\
/*!
 * ${ GlobalName } v${ version }
 * (c) ${ date } ${ author }
 * @license ${ license }
 */`;


const createOutput = (format, min) => ({
	file: [
		`${ dir }/dist/neep`,
		...name.split('-'),
		format === 'esm' ? 'esm' : format === 'cjs' ? 'common' : '',
		min && 'min',
		format === 'mjs' ? 'mjs' : 'js',
	].filter(Boolean).join('.'),
	sourcemap: true,
	format: format === 'mjs' ? 'esm' : format,
	name: GlobalName,
	banner,
	globals: {
		'monitorable': 'Monitorable',
		'@neep/core': 'Neep',
	},
	exports: isRender ? 'default' : 'named',
});

const input = `${ dir }/src/index.ts`;
const browser = `${ dir }/src/browser.ts`;
const external = ['monitorable', '@neep/core'];

const typesOutput = `${ dir }/types.d.ts`;
let config;
if (isRender) {
	config = [
		{
			input: browser,
			output: [ createOutput('cjs'), createOutput('mjs') ],
			external,
			plugins: [ resolve(true), babel(), replace() ],
		},

		{
			input,
			output: [ createOutput('esm') ],
			external,
			plugins: [ resolve(), babel(), replace(true) ],
		},
		{
			input,
			output: [ createOutput('esm', true) ],
			external,
			plugins: [ resolve(), babel(), replace(), terser() ],
		},
		{
			input: browser,
			output: [ createOutput('umd') ],
			external,
			plugins: [ resolve(), babel(), replace(true) ],
		},
		{
			input: browser,
			output: [ createOutput('umd', true) ],
			external,
			plugins: [ resolve(), babel(), replace(), terser() ],
		},
	];
} else if (isCore) {
	config = [
		{
			input,
			output: [ createOutput('cjs'), createOutput('mjs') ],
			external,
			plugins: [ resolve(true), babel(), replace() ],
		},

		{
			input,
			output: [ createOutput('esm') ],
			external,
			plugins: [ resolve(), babel(), replace(true) ],
		},
		{
			input,
			output: [ createOutput('esm', true) ],
			external,
			plugins: [ resolve(), babel(), replace(), terser() ],
		},

		{
			input: browser,
			output: [ createOutput('umd') ],
			external,
			plugins: [ resolve(), babel(), replace(true) ],
		},
		{
			input: browser,
			output: [ createOutput('umd', true) ],
			external,
			plugins: [ resolve(), babel(), replace(), terser() ],
		},
	];
} else {
	config = [
		{
			input,
			output: [ createOutput('cjs'), createOutput('mjs') ],
			external,
			plugins: [ resolve(true), babel(), replace() ],
		},

		{
			input,
			output: [ createOutput('esm') ],
			external,
			plugins: [ resolve(), babel(), replace() ],
		},
		{
			input: browser,
			output: [ createOutput('umd') ],
			external,
			plugins: [ resolve(), babel(), replace() ],
		},
	];
}

export default [
	{
		input,
		output: { file: typesOutput, format: 'esm', banner },
		plugins: [ dts() ],
	},
	...config,
];
