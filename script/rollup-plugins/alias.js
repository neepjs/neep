
import alias from '@rollup/plugin-alias';

export default () => alias({
	entries: {
		'@neep/core': './src/core/index.ts',
		'@neep/web/standalone': './src/web/standalone.ts',
		'@neep/web/full': './src/web/full.ts',
		'@neep/web': './src/web/index.ts',
		'@neep/devtools': './src/devtools/index.ts',
	},
});
