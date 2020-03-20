import { Context, ContextConstructor, Exposed } from '../type';
import { monitorable } from '../install';

const constructors: ContextConstructor[] = [];
export function initContext(
	context: Context,
	exposed?: Exposed,
): Context {
	for (const constructor of constructors) {
		constructor(context, exposed);
	}
	return context;
}
export function addContextConstructor(
	constructor: ContextConstructor
): void {
	constructors.push(monitorable.safeify(constructor));
}