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

const standaloneExternal = ['monitorable'];
const external = [...standaloneExternal, '@neep/core'];

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
	globals: {
		'monitorable': 'Monitorable',
		'@neep/core': 'Neep',
	},
	// exports: 'default',
});
const createRenderOutput = (dir, format, ...build) => ({
	...createOutput(dir, format, 'render', ...build),
	name: `${ GlobalName }${dir.replace(
		/(?:^|-)([a-z])/g,
		(_, s) => s.toUpperCase()
	)}`,
	exports: 'default',
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
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/core/index.ts',
		output: [
			createOutput('core', 'esm', 'core', true),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	{
		input: 'src/core/browser.ts',
		output: [
			createOutput('core', 'umd', 'core'),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/core/browser.ts',
		output: [
			createOutput('core', 'umd', 'core', true),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('core'),

	{
		input: 'src/web/index.ts',
		output: [
			createRenderOutput('web', 'esm', 'web'),
			createRenderOutput('web', 'cjs', 'web'),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/web/index.ts',
		output: [
			createRenderOutput('web', 'esm', 'web', true),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	{
		input: 'src/web/browser.ts',
		output: [
			createRenderOutput('web', 'umd', 'web'),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/web/browser.ts',
		output: [
			createRenderOutput('web', 'umd', 'web', true),
		],
		external,
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('web'),

	{
		input: 'src/web/index.ts',
		output: [
			createOutput('web', 'esm', 'web', 'standalone'),
			createOutput('web', 'umd', 'web', 'standalone'),
		],
		external: standaloneExternal,
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/web/index.ts',
		output: [
			createOutput('web', 'esm', 'web', 'standalone', true),
			createOutput('web', 'umd', 'web', 'standalone', true),
		],
		external: standaloneExternal,
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('web', 'standalone', 'standalone/types'),

	{
		input: 'src/web/full.ts',
		output: [
			createOutput('web', 'esm', 'web', 'full'),
			createOutput('web', 'umd', 'web', 'full'),
		],
		plugins: [ alias(), resolve(), babel(), replace(true) ],
	},
	{
		input: 'src/web/full.ts',
		output: [
			createOutput('web', 'esm', 'web', 'full', true),
			createOutput('web', 'umd', 'web', 'full', true),
		],
		plugins: [ alias(), resolve(), babel(), replace(), terser() ],
	},
	createDts('web', 'full', 'full/types'),
];
