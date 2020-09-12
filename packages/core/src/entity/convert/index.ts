import { TreeNode } from '../../type';
import EntityObject from '../EntityObject';
import { createAll } from './create';
import { updateAll } from './update';
import { refresh } from '../../extends';
import { postpone } from 'monitorable';

export { destroy } from './utils';

/**
 * 更新树
 * @param source 用于替换的源
 * @param nObject Neep 对象
 * @param tree 已有树
 */
function convert(
	nObject: EntityObject,
	source: any,
	tree?: (TreeNode | TreeNode[])[],
): (TreeNode | TreeNode[])[] {
	return refresh(() => postpone(() => {
		if (!tree) {
			return createAll(nObject, nObject.delivered, source);
		}
		return [...updateAll(nObject, nObject.delivered, source, tree)];
	}));
}


export default convert;
