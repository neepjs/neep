import { Context, ContextConstructor, Exposed } from '../type';
import { safeify } from '../install';

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
	constructor: ContextConstructor,
): void {
	constructors.push(safeify(constructor));
}
