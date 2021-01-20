module.exports = {
	comments: false,
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-do-expressions',
		'@babel/plugin-proposal-function-bind',
		'@babel/plugin-proposal-logical-assignment-operators',
		'@babel/plugin-proposal-numeric-separator',
		'@babel/plugin-proposal-optional-catch-binding',
		'@babel/plugin-proposal-optional-chaining',
		'@babel/plugin-proposal-throw-expressions',
		['@babel/plugin-transform-typescript', {
			isTSX: true,
			jsxPragma: 'Neep',
			allowNamespaces: true,
		}],
		['@babel/plugin-transform-react-jsx', {
			pragma: 'Neep.createElement',
			pragmaFrag: 'Neep.Fragment',
			throwIfNamespace: false,
		}],
	],
};
