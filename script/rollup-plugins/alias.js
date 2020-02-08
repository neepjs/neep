
import alias from '@rollup/plugin-alias';

export default () => alias({
	entries: {
		'@neep/core': './src/core/index.ts',
		'@neep/web': './src/web/index.ts',
		'@neep/create': './src/create/index.ts',
		'@neep/devtools': './src/devtools/index.ts',
		'@neep/web/render': './src/web/render/index.ts',
	},
});
