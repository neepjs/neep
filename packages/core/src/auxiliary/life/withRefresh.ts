import { checkCurrent } from '../../extends/current';

function withRefresh(): void;
function withRefresh<T>(f: () => T): T;
function withRefresh<T>(f?: () =>  T): T | void;
function withRefresh<T>(f?: () =>  T): T | void {
	return checkCurrent('withRefresh').refresh(f);
}

export default withRefresh;
