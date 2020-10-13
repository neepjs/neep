import {
	ScopeSlot, Slot, SlotRender,
	NeepNode, Ref, Emit, EventSet,
} from './exports';

interface Attributes {
	slot?: string;
	ref?: Ref;
	'@'?: Emit | EventSet,
	'n:on'?: Emit | EventSet,
	'n-on'?: Emit | EventSet,
	
}
interface NativeAttributes extends Attributes {
	id?: string;
	class?: string;
}
interface ClassAttributes<T> extends Attributes {

}

interface SlotAttr {
	name?: string;
}
interface ScopeSlotAttr {
	name?: string;
	render?(...params: any[]): NeepNode | NeepNode[];
}
interface SlotRenderAttr {

}


declare global {
	namespace JSX {
		interface IntrinsicAttributes extends NativeAttributes { }
		interface IntrinsicClassAttributes<T> extends ClassAttributes<T> { }

		interface IntrinsicElements {
			[Slot]: SlotAttr & ScopeSlotAttr;
			[SlotRender]: SlotRenderAttr;
			[ScopeSlot]: ScopeSlotAttr;
			slot: SlotAttr;
			[k: string]: any;
		}
	}
}
