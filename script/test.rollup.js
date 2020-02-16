
import resolve from './rollup-plugins/resolve';
import babel from './rollup-plugins/babel';
import replace from './rollup-plugins/replace';
import alias from './rollup-plugins/alias';

export default {
	input: './src/test/index.tsx',
	output: [
		{
			file: './test/index.js',
			sourcemap: true,
			format: 'umd',
		},
	],
	plugins: [
		alias(),
		resolve(),
		babel(),
		replace(true),
	],
};
