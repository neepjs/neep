/** 全局钩子 */
export interface Hook {
	(): void
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
