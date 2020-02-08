import dts from 'rollup-plugin-dts';
import { terser } from 'rollup-plugin-terser';
import resolve from './rollup-plugins/resolve';
import babel from './rollup-plugins/babel';
import replace from './rollup-plugins/replace';
import alias from './rollup-plugins/alias';
import fsFn from 'fs';

const {
	name,
	version,
	author,
	license,
} = JSON.parse(fsFn.readFileSync('./package.json'));

const bYear = 2019;
const year = new Date().getFullYear();
const date = bYear === year ? bYear : `${ bYear }-${ year }`;
const banner = `\
/*!
 * ${ name } v${ version }
 * (c) ${ date } ${ author }
 * @license ${ license }
 */`;
const GlobalName = name.replace(
	/(?:^|-)([a-z])/g,
	(_, s) => s.toUpperCase()
);

const createOutput = (dir, format, ...build) => ({
	file: [
		`dist/${ dir }/${ name }`,
		...build.filter(t => typeof t === 'string'),
		format === 'esm' ? 'esm' : format === 'cjs' ? 'common' : '',
		build.includes(true) && 'min',
		'js',
	].filter(Boolean).join('.'),
	sourcemap: true,
	format,
	name: GlobalName,
	banner,
	// exports: 'default',
});


const createDts = (dir, input = 'index', out = 'types') => ({
	input: `src/${ dir }/${ input }.ts`,
	output: { file: `dist/${ dir }/${ out }.d.ts`, format: 'esm', banner },
	plugins: [ dts() ],
});

export default [
	{
		input: 'src/core/index.ts',
		output: [
			createOutput('core', 'esm', 'core'),
			createOutput('core', 'cjs', 'core'),
			createOutput('core', 'umd', 'core'),
		],
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/core/index.ts',
		output: [
			createOutput('core', 'esm', 'core', true),
			createOutput('core', 'umd', 'core', true),
		],
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('core'),

	{
		input: 'src/create/index.ts',
		output: [
			createOutput('create', 'cjs'),
			createOutput('create', 'esm'),
		],
		plugins: [ alias(), resolve(), babel(), replace() ],
	},
	createDts('create'),

	{
		input: 'src/web/render/index.ts',
		output: [
			createOutput('web', 'esm', 'render'),
			createOutput('web', 'cjs', 'render'),
			createOutput('web', 'umd', 'render'),
		],
		plugins: [ alias(), resolve(), babel(), replace() ],
	},
	{
		input: 'src/web/render/index.ts',
		output: [
			createOutput('web', 'esm', 'render', true),
			createOutput('web', 'umd', 'render', true),
		],
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('web', 'render/index', 'render/types'),

	{
		input: 'src/web/index.ts',
		output: [
			createOutput('web', 'esm'),
			createOutput('web', 'cjs'),
			createOutput('web', 'umd'),
		],
		plugins: [ alias(), resolve(), babel(), replace() ],
	},

	{
		input: 'src/web/index.ts',
		output: [
			createOutput('web', 'esm', true),
			createOutput('web', 'umd', true),
		],
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('web'),

	{
		input: 'src/web/full.ts',
		output: [ createOutput('web', 'esm', 'full') ],
		plugins: [ alias(), resolve(), babel(), replace() ],
	},
	{
		input: 'src/web/full.ts',
		output: [ createOutput('web', 'esm', 'full', true) ],
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
];
