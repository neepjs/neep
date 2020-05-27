import { Entity, EntityConstructor } from '../type';
import { safeify } from '../install';

const constructors: EntityConstructor[] = [];
export function initEntity(
	entity: Entity,
): Entity {
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
