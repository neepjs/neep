import { ComponentContext, Context, ContextConstructor, ComponentEntity, ShellContext } from '../type';
import { safeify } from '../install/monitorable';

const constructors: ContextConstructor[] = [];
export function initContext<
	TContext extends ComponentContext<any, any> | ShellContext<any>,
>(
	context: TContext,
	entity?: TContext extends Context<any, any, any> ? ComponentEntity<any, any> : never,
): TContext {
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
