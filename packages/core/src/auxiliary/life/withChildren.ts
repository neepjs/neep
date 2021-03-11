import { checkCurrent } from '../../extends/current';

function withChildren<T>(): T[] {
	return checkCurrent('withChildren').getChildren() as T[];
}
export default withChildren;
