import { NeepComponent, Render, Mark } from '../type';
import { renderSymbol } from './mark/symbols';

export * from './mark';

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
