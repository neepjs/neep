import { Component, Render, Marks } from './type';
import { nameSymbol, typeSymbol, renderSymbol, componentsSymbol, configSymbol } from './symbols';

/** 组件标记函数 */
export interface Mark {
	<N extends Component<any, any>>(component: N): N;
}

/** 创建组件标记函数 */
function Mark<S extends keyof Marks>(
	symbol: S,
	value: Component[S],
): Mark {
	return component => {
		component[symbol] = value as any;
		return component;
	};
}
/** 创建组件标记函数 */
function MarkValue<S extends typeof componentsSymbol | typeof configSymbol>(
	symbol: S,
	key: keyof (NonNullable<Marks[typeof configSymbol]>),
	value: NonNullable<Marks[typeof componentsSymbol]>[typeof key],
): Mark {
	return component => {
		let obj = component[symbol] as any;
		if (!obj) {
			obj = Object.create(null);
			component[symbol] = obj;
		}
		obj[key] = value;
		return component;
	};
}


/** 标记组件名称 */
export function mName(name: string): Mark;
export function mName<N extends Component<any, any>>(
	name: string,
	component: N,
): N;
export function mName<N extends Component<any, any>>(
	name: string,
	component?: N,
): Mark | N {
	if (!component) { return Mark(nameSymbol, name); }
	component[nameSymbol] = name;
	return component;
}

/** 标记组件类型 */
export function mType(type?: 'native' | 'simple' | 'standard'): Mark;
export function mType<N extends Component<any, any>>(
	type: 'native' | 'simple' | 'standard',
	component: N,
): N;
export function mType<N extends Component<any, any>>(
	type?: 'native' | 'simple' | 'standard',
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, type); }
	component[typeSymbol] = type;
	return component;
}
/** 标记为简单组件 */
export function mSimple(): Mark;
export function mSimple<N extends Component<any, any>>(
	component: N,
): N;
export function mSimple<N extends Component<any, any>>(
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, 'simple'); }
	component[typeSymbol] = 'simple';
	return component;
}
/** 标记为原生组件 */
export function mNative(): Mark;
export function mNative<N extends Component<any, any>>(
	component: N,
): N;
export function mNative<N extends Component<any, any>>(
	component?: N,
): Mark | N {
	if (!component) { return Mark(typeSymbol, 'native'); }
	component[typeSymbol] = 'native';
	return component;
}

/** 标记独立的渲染函数 */
export function mRender(fn?: Marks[typeof renderSymbol]): Mark;
export function mRender<N extends Component<any, any>>(
	fn: Marks[typeof renderSymbol] | undefined,
	component: N,
): N;
export function mRender<N extends Component<any, any>>(
	fn?: Marks[typeof renderSymbol] | undefined,
	component?: N,
): Mark | N {
	if (!component) { return Mark(renderSymbol, fn); }
	component[renderSymbol] = fn;
	return component;
}

/** 标记组件配置 */
export function mConfig(name: string, config: any): Mark;
export function mConfig<N extends Component<any, any>>(
	name: string, config: any,
	component: N,
): N;
export function mConfig<N extends Component<any, any>>(
	name: string, config: any,
	component?: N,
): Mark | N {
	const mark = MarkValue(configSymbol, name, config);
	if (!component) { return mark; }
	return mark(component);
}
/** 标记组件类型 */
export function mComponent(name: string, item: Component): Mark;
export function mComponent<N extends Component<any, any>>(
	name: string, item: Component,
	component: N,
): N;
export function mComponent<N extends Component<any, any>>(
	name: string, item: Component,
	component?: N,
): Mark | N {
	const mark = MarkValue(componentsSymbol, name, item);
	if (!component) { return mark; }
	return mark(component);
}

export function create<P extends object>(
	c: Component<P, never>,
): Component<P, never>;
export function create<
	P extends object = object,
	R extends object = object,
>(c: Component<P, R>, r: Render<R>): Component<P, R>;
export function create<T extends Component<any, any>>(
	c: T,
	r?: Render,
): T {
	if (typeof r === 'function') {
		c[renderSymbol] = r;
	}
	return c;
}

export function mark<N extends Component<any, any>>(
	component: N,
	...marks: Mark[]
): N {
	for (const m of marks) { m(component); }
	return component;
}
