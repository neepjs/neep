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


const createOutput = (format, prod) => ({
	file: [
		`${ dir }/dist/neep`,
		...name.split('-'),
		...(format === 'cjs' || format === 'mjs' ? [] : [
			format === 'esm' ? 'esm' : 'browser',
			prod && 'min',
		]),
		format === 'mjs' ? 'mjs' : 'js',
	].filter(Boolean).join('.'),
	// sourcemap: true,
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
const external = ['monitorable', '@neep/core'];

const typesOutput = `${ dir }/types.d.ts`;

export default [
	{
		input,
		output: [ createOutput('cjs'), createOutput('mjs') ],
		external,
		plugins: [ resolve(), babel(), replace() ],
	},

	{
		input,
		output: [ createOutput('umd') ],
		external,
		plugins: [ resolve(), babel(), replace(false) ],
	},
	{
		input,
		output: [ createOutput('umd', true) ],
		external,
		plugins: [ resolve(), babel(), replace(true), terser() ],
	},


	{
		input,
		output: [ createOutput('esm') ],
		external,
		plugins: [ resolve(true), babel(), replace(false) ],
	},
	{
		input,
		output: [ createOutput('esm', true) ],
		external,
		plugins: [ resolve(true), babel(), replace(true), terser() ],
	},

	{
		input,
		output: { file: typesOutput, format: 'esm', banner },
		plugins: [ dts() ],
	},
];
