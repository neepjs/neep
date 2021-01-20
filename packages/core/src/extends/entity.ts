import {
	ComponentEntity,
	EntityConstructor,
	StandardComponent,
} from '../type';
import { safeify } from '../install/monitorable';

const constructors: EntityConstructor[] = [];
export function initEntity<
	C extends StandardComponent<any, any, any>,
	Parent extends ComponentEntity<any, any> | undefined | never,
>(
	entity: ComponentEntity<C, Parent>,
): ComponentEntity<C, Parent> {
	for (const constructor of constructors) {
		constructor(entity);
	}
	return entity;
}
export function addEntityConstructor(
	constructor: EntityConstructor,
): void {
	constructors.push(safeify(constructor));
}
