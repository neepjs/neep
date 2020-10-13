import {
	objectTypeSymbol,
	objectTypeSymbolDeliver,
	deliverKeySymbol,
	deliverDefaultSymbol,
} from '../symbols';
import { NeepNode, Context, Deliver } from '../type';
import { assert } from '../Error';


export function createDeliver<T>(def: T): Deliver<T>;
export function createDeliver<T>(def?: T): Deliver<T | undefined>;
export function createDeliver<T, D>(def: D): Deliver<T | D>;
export function createDeliver<T>(def: T): Deliver<T> {
	const symbol = Symbol();

	function Provider (
		_: { value?: T },
		{ childNodes }: Context,
	): NeepNode[] {
		return childNodes;
	}
	Reflect.defineProperty(Provider, objectTypeSymbol, {
		value: objectTypeSymbolDeliver,
	});
	Reflect.defineProperty(Provider, deliverKeySymbol, {
		value: symbol,
	});
	Reflect.defineProperty(Provider, deliverDefaultSymbol, {
		value: def,
	});
	return Provider as Deliver<T>;
}

export function isDeliver(d: any): d is Deliver<any> {
	if (typeof d !== 'function') { return false; }
	return d[objectTypeSymbol] === objectTypeSymbolDeliver;
}

export function getDelivered<T>(delivered: any, Deliver: Deliver<T>): T {
	assert(isDeliver(Deliver), '');
	const value = delivered[Deliver[deliverKeySymbol]];
	return value === undefined ? Deliver[deliverDefaultSymbol] : value;
}
