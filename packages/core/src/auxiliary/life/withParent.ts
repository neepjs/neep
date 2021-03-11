import { ComponentEntity } from '../../types';
import { checkCurrent } from '../../extends/current';

function withParent<T extends ComponentEntity<any, any>>(): T | undefined {
	return checkCurrent('withParent').parent as T;
}
export default withParent;
