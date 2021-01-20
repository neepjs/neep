
import resolve from './rollup-plugins/resolve';
import babel from './rollup-plugins/babel';
import replace from './rollup-plugins/replace';
import alias from '@rollup/plugin-alias';

export default {
	input: './test/index.tsx',
	output: [
		{
			file: './test/bundle/index.js',
			sourcemap: true,
			format: 'umd',
		},
	],
	plugins: [
		alias({
			entries: {
				'@neep/core': './packages/core/src/index.ts',
				'@neep/renderer-html': './packages/renderer-html/src/index.ts',
			},
		}),
		resolve(),
		babel(),
		replace(false),
	],
};
