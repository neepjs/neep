
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
				'monitorable': '../../monitorable.js/src/index.ts',
				'@neep/core': './packages/core/src/index.ts',
				'@neep/web-render': './packages/web-render/src/index.ts',
			},
		}),
		resolve(),
		babel(),
		replace(false),
	],
};
