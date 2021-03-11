import {
	Node,
	TreeNode,
	ValueElement,
} from '../../../types';
import BaseProxy from '../../proxy/BaseProxy';
import ValueProxy from '../../proxy/ValueProxy';
import createProxy from './createProxy';


export default function createItem(
	proxy: BaseProxy<any>,
	source: Node | ValueElement,
): TreeNode | null {
	if (!source) { return null; }
	if (!source.tag) {
		const { key, props } = source;
		return {
			key, props, proxy: new ValueProxy(
				source.props || {},
				proxy,
			),
		};
	}
	const { tag, key, props } = source;
	return { tag, key, props, proxy: createProxy(proxy, source) };
}
