export * from './component';
export * from './context';
export * from './devtools';
export * from './entity';
export * from './event';
export * from './hook';
export * from './monitorable';
export * from './node';
export * from './recognizer';
export * from './ref';
export * from './renderer';
export * from './slot';
export * from './useHook';

import { ScopeSlot, Slot, Render } from '../auxiliary';
import { Node } from './node';
import { Emit, EventSet } from './event';
import { Ref } from './ref';
import { Value } from './monitorable';

interface Attributes<T extends object> {
	slot?: string;
	'n:ref'?: Ref<T>;
	'n-ref'?: Ref<T>;
	'@'?: Emit | EventSet,
	'n:on'?: Emit | EventSet,
	'n-on'?: Emit | EventSet,

}
interface NativeAttributes extends Attributes<any> {
	id?: string | Value<string>;
	class?: string | Value<string>;
}
interface ClassAttributes<T> extends Attributes<T & object> {

}

interface SlotAttr {
	name?: string;
}
interface ScopeSlotAttr {
	name?: string;
	render?(...params: any[]): Node | Node[];
}
interface SlotRenderAttr {

}
interface CoreIntrinsicElements {
	[Slot]: SlotAttr & ScopeSlotAttr;
	[Render]: SlotRenderAttr;
	[ScopeSlot]: ScopeSlotAttr;
	slot: SlotAttr;
}

type NeepElement = import('./node').Element;

declare global {
	namespace JSX {
		interface IntrinsicAttributes extends NativeAttributes { }
		interface IntrinsicClassAttributes<T> extends ClassAttributes<T> { }

		interface Element extends NeepElement { }

		interface IntrinsicElements extends CoreIntrinsicElements {
			[k: string]: any;
		}
	}
}
