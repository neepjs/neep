import * as Tags from './tags';
import * as State from './state';
import * as Life from './life';
import * as Element from './element';
import { mode, isProduction } from '../constant';

export * from './tags';
export * from './state';
export * from './life';
export * from './element';

export { Tags };


/** 辅助 */
export interface Auxiliary extends
	Readonly<typeof Tags>,
	Readonly<typeof State>,
	Readonly<typeof Life>,
	Readonly<typeof Element>
{
	mode: string,
	isProduction: boolean,
}

const auxiliary: Auxiliary = {
	...Tags,
	...State,
	...Life,
	...Element,
	mode,
	isProduction,
};

export function setAuxiliary<T>(
	name: string | number | symbol,
	value: T,
): void {
	Reflect.defineProperty(auxiliary, name, {
		value,
		enumerable: true,
		configurable: true,
	});
}
export function defineAuxiliary<T>(
	name: string | number | symbol,
	get: (this: Auxiliary) => T,
): void {
	Reflect.defineProperty(auxiliary, name, {
		get,
		enumerable: true,
		configurable: true,
	});
}
export default auxiliary;
