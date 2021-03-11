import {
	TreeNode,
	TreeNodeList,
} from '../../../types';
import BaseProxy from '../../proxy/BaseProxy';
import toElement from '../toElement';
import createItem from './createItem';


export default function createAll(
	proxy: BaseProxy<any>,
	source: any,
): TreeNodeList {
	if (!Array.isArray(source)) { source = [source]; }
	if (!source.length) { return []; }
	return (source as any[]).map(item => {
		if (!Array.isArray(item)) {
			return createItem(proxy, toElement(item));
		}

		return item.flat(Infinity)
			.map(it => createItem(proxy, toElement(it)))
			.filter(Boolean) as TreeNode[];
	});
}
