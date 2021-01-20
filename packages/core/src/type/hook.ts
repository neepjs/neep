import { HookEntity } from './entity';

/** 全局钩子 */
export interface Hook<T extends HookEntity<any, any> = HookEntity<any, any>> {
	(entity: T): void
}

type HookNames = 'beforeCreate' | 'created'
| 'beforeDestroy' | 'destroyed'
| 'beforeUpdate' | 'updated'
| 'beforeMount' | 'mounted'
| 'beforeDraw' | 'drawn'
| 'beforeDrawAll' | 'drawnAll'
;

export {
	HookNames as HookName,
};
