import { Entity } from './entity';

export interface Ref<
	TExposed extends object | Function,
	TEntity extends Entity<any, any>,
> {
	(
		newNode: TExposed | undefined,
		oldNode: TExposed | undefined,
		entity: TEntity,
		/**
		 * true: 添加
		 * false: 移除
		 */
		state?: boolean,
	): void;
}

export interface RefSet<T extends object> {
	add(value: T): void;
	delete(value: T): void;
	replace?(newNode: T, oldNode: T): void;
}

export interface RefValue<T extends object> extends Ref<T, any> {
	readonly value: T | null
}


export interface RefEntityValue<T extends Entity<any, any>> extends Ref<any, T> {
	readonly value: T | null
}
