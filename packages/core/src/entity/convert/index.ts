import { TreeNodeList } from '../../type';
import BaseProxy from '../proxy/BaseProxy';
import { createAll } from './create';
import { updateAll } from './update';
import refresh from '../../extends/refresh';
import { postpone } from '../../install/monitorable';

export { destroy } from './utils';

/**
 * 更新树
 * @param source 用于替换的源
 * @param proxy Neep 对象
 * @param tree 已有树
 */
function convert(
	proxy: BaseProxy<any>,
	source: any[],
	tree?: TreeNodeList,
): TreeNodeList {
	return refresh(() => postpone(() => {
		if (!tree) {
			return createAll(proxy, source);
		}
		return [...updateAll(proxy, source, tree)];
	}));
}


export default convert;
