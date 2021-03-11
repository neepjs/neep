import { checkCurrent, runCurrent } from '../../extends/current';

function withCallback<R, P extends any[]>(fn: (...p: P) =>  R): (...p: P) =>  R {
	const current = checkCurrent('withCallback');
	return (...p) => runCurrent(current, undefined, fn, ...p);
}

export default withCallback;
