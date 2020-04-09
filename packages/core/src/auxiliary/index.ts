import * as Constant from '../constant';
import * as Tags from './tags';
import * as State from './state';
import * as Life from './life';
import * as Element from './element';
import * as Dev from './dev';

export * from './tags';
export * from './state';
export * from './life';
export * from './element';
export * from './dev';

export { Tags };

/** 辅助 */
export interface Auxiliary extends
	Readonly<typeof Tags>,
	Readonly<typeof State>,
	Readonly<typeof Life>,
	Readonly<typeof Element>,
	Readonly<typeof Dev>,
	Readonly<typeof Constant>
{}

const auxiliary: Auxiliary = {
	...Tags,
	...Life,
	...Element,
	...Dev,
	...Constant,
	get value() { return State.value; },
	get computed() { return State.computed; },
	get isValue() { return State.isValue; },
	get encase() { return State.encase; },
	get recover() { return State.recover; },
};

export function setAuxiliary<T>(
	name: string,
	value: T,
): void {
	Reflect.defineProperty(auxiliary, name, {
		value,
		enumerable: true,
		configurable: true,
	});
}
export function defineAuxiliary<T>(
	name: string,
	get: (this: Auxiliary) => T,
): void {
	Reflect.defineProperty(auxiliary, name, {
		get,
		enumerable: true,
		configurable: true,
	});
}
export default auxiliary;
