
import resolve from 'rollup-plugin-node-resolve';
export default node => resolve({
	extensions: node ? [
		'.node.ts', '.node.tsx', '.node.js', '.node.json',
		'.ts', '.tsx', '.mjs', '.js', '.jsx', '.json',
	] : [
		'.ts', '.tsx', '.mjs', '.js', '.jsx', '.json',
	],
});
