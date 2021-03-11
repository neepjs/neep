import { TreeNodeList } from '../../types';
import { postpone } from '../../install/monitorable';
import BaseProxy from '../proxy/BaseProxy';
import createAll from './create/createAll';
import updateAll from './update/updateAll';
import delayRefresh from '../../extends/delayRefresh';

export { default as destroy } from './destroy';

/**
 * 更新树
 * @param source 用于替换的源
 * @param proxy Neep 对象
 * @param tree 已有树
 */
export default function convert(
	proxy: BaseProxy<any>,
	source: any[],
	tree?: TreeNodeList,
): TreeNodeList {
	if (!tree) {
		return delayRefresh(() => postpone(() => createAll(proxy, source)));
	}
	return delayRefresh(() => postpone(() => [...updateAll(proxy, source, tree)]));
}
