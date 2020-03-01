import { NeepComponent, Render, Marks } from './type';
import { nameSymbol, typeSymbol, renderSymbol } from './symbols';

/** 组件标记函数 */
export interface Mark {
	<N extends NeepComponent<any, any>>(component: N): N;
}

/**
 * 创建组件标记函数
 */
function Mark<S extends keyof Marks>(symbol: S, value: NeepComponent[S]): Mark {
	return component => {
		component[symbol] = value as any;
		return component;
	};
}


/** 标记组件名称 */
export function mName(name: string): Mark;
export function mName<N extends NeepComponent<any, any>>(
	name: string,
	component: N,
): N;
export function mName<N extends NeepComponent<any, any>>(
	name: string,
	component?: N,
): Mark | N {
	if (!component) { return Mark(nameSymbol, name); }
	component[nameSymbol] = name;
	return component;
}

/** 标记组件类型 */
export function mType(type?: 'native' | 'simple' | 'standard'): Mark;
export function mType<N extends NeepComponent<any, any>>(
	type: 'native' | 'simple' | 'standard',
	component: N,
): N;
export function mType<N extends NeepComponent<any, any>>(
	type?: 'native' | 'simple' | 'standard',
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, type); }
	component[typeSymbol] = type;
	return component;
}
/** 标记为简单组件 */
export function mSimple(): Mark;
export function mSimple<N extends NeepComponent<any, any>>(
	component: N,
): N;
export function mSimple<N extends NeepComponent<any, any>>(
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, 'simple'); }
	component[typeSymbol] = 'simple';
	return component;
}
/** 标记为原生组件 */
export function mNative(): Mark;
export function mNative<N extends NeepComponent<any, any>>(
	component: N,
): N;
export function mNative<N extends NeepComponent<any, any>>(
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, 'native'); }
	component[typeSymbol] = 'native';
	return component;
}

/** 标记独立的渲染函数 */
export function mRender(fn?: Marks[typeof renderSymbol]): Mark;
export function mRender<N extends NeepComponent<any, any>>(
	fn: Marks[typeof renderSymbol] | undefined,
	component: N,
): N;
export function mRender<N extends NeepComponent<any, any>>(
	fn?: Marks[typeof renderSymbol] | undefined,
	component?: N,
): Mark | N {
	if (!component) { return Mark(renderSymbol, fn); }
	component[renderSymbol] = fn;
	return component;
}

export function create<P extends object>(
	c: NeepComponent<P, never>,
): NeepComponent<P, never>;
export function create<
	P extends object = object,
	R extends object = object,
>(c: NeepComponent<P, R>, r: Render<R>): NeepComponent<P, R>;
export function create<T extends NeepComponent<any, any>>(c: T, r?: any): T {
	if (typeof r === 'function') {
		c[renderSymbol] = r;
	}
	return c;
}

export function mark<N extends NeepComponent<any, any>>(
	component: N,
	...marks: Mark[]
): N {
	for (const m of marks) { m(component); }
	return component;
}
