import { ContextData, WithData } from '../types';
import { runCurrent, checkCurrent } from './current';
const destroyFns: Record<string, (c: any) => void> = Object.create(null);
let nextId = 0;

interface WithState {
	destroyed: boolean;
	isSimple: boolean;
	isShell: boolean;
}
export function createWith<T>(p: {
	name: string,
	create?: (withState: WithState) => T,
	exec?: undefined,
	destroy?: ((c: T) => void),
}): () => T;
export function createWith<T, P extends any[], R>(p: {
	name: string,
	create?: (withState: WithState) => T,
	exec: (c: T, withState: WithState, ...p: P) => R
	destroy?: (c: T) => void,
}): (...p: P) => R;
export function createWith<T, P extends any[], R>(p: {
	name: string,
	create?: (withState: WithState) => T,
	exec?: ((c: T, ...p: P) => R),
	destroy?: ((c: T) => void),
}): ((...p: P) => R) | (() => T);
export function createWith<T, P extends any[], R>({
	name,
	create = () => ({}) as T,
	destroy,
	exec,
}: {
	name: string,
	create?: (withState: WithState) => T,
	exec?: ((c: T, withState: WithState, ...p: P) => R),
	destroy?: ((c: T) => void),
}): ((...p: P) => R) | (() => T) {
	const id = nextId++;
	if (typeof destroy === 'function') {
		destroyFns[id] = destroy;
	}
	if (typeof exec === 'function') {
		return (...p: P) => {
			const current = checkCurrent(name);
			const {withData, destroyed, isSimple, isShell} = current;
			if (!(id in withData)) {
				withData[id] = create({destroyed, isSimple, isShell});
			}
			return exec(withData[id], {destroyed, isSimple, isShell}, ...p);
		};
	}
	return () => {
		const current = checkCurrent(name);
		const {withData} = current;
		if (!(id in withData)) {
			const {destroyed, isSimple, isShell} = current;
			withData[id] = create({destroyed, isSimple, isShell});
		}
		return withData[id];
	};
}

export function destroyContextData(contextData: WithData): void {
	const keys = Object.keys(contextData);
	for (const id of keys) {
		if (!(id in destroyFns)) { continue; }
		const destroy = destroyFns[id];
		destroy(contextData[id]);
	}
}

export function createBy(contextData: ContextData): <P extends any[], R>(fn: (...p: P) => R, ...p: P) => R {
	return function by(fn, ...p) {
		return runCurrent(contextData, undefined, fn, ...p);
	};
}
