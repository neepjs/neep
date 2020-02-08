import { NeepComponent, Render, Mark } from '../../type';
import { nameSymbol, typeSymbol, renderSymbol } from './symbols';

/** 组件标记 */
export interface Marks {
	/** 组件名称 */
	[nameSymbol]?: string;
	/** 是否为原生组件 */
	[typeSymbol]?: 'native' | 'simple' | 'default';
	[renderSymbol]?: Render;
}

/**
 * 创建组件标记函数
 */
function mark<S extends keyof Marks>(symbol: S, value: NeepComponent[S]): Mark {
	return component => {
		component[symbol] = value as any;
		return component;
	};
}

/** 标记组件名称 */
export function mName(name: string) {
	return mark(nameSymbol, name);
}

/** 标记组件类型 */
export function mType(type?: 'native' | 'simple' | 'default') {
	return mark(typeSymbol, type);
}
/** 标记为简单组件 */
export function mSimple() {
	return mark(typeSymbol, 'simple');
}
/** 标记为原生组件 */
export function mNative() {
	return mark(typeSymbol, 'native');
}

/** 标记独立的渲染函数 */
export function mRender(fn?: Marks[typeof renderSymbol]) {
	return mark(renderSymbol, fn);
}
