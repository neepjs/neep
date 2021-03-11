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
