
import resolve from '@rollup/plugin-node-resolve';
export default esm => resolve({
	extensions: esm ? [
		'.esm.ts', '.esm.tsx', '.esm.mjs', '.esm.js', '.esm.jsx', '.esm.json',
		'.notype.ts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json',
	] : [
		'.notype.ts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json',
	],
});
