import { Context, ContextConstructor, Entity } from '../type';
import { safeify } from '../install';

const constructors: ContextConstructor[] = [];
export function initContext(
	context: Context,
	entity?: Entity,
): Context {
	for (const constructor of constructors) {
		constructor(context, entity);
	}
	return context;
}
export function addContextConstructor(
	constructor: ContextConstructor,
): void {
	constructors.push(safeify(constructor));
}
