import { Element } from './node';

/** 槽列表 */
export interface Slots {
	readonly [name: string]: any[] | undefined;
}

export interface SlotApi {
	(name?: string, argv?: any): Element;
	has(name?: string): boolean;
}
