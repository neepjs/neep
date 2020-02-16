import { ScopeSlot, Slot, SlotRender, Value, Template, NeepElement, Node } from './core';

interface Attributes {
	slot?: string;
	'n-ref'?: any;
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
	render?(...params: any[]): Node | Node[];
}
interface SlotRenderAttr {
	
}


declare global {
	namespace JSX {
		// type Element = NeepElement;
	//     interface ElementClass extends React.Component<any> {
	//         render(): React.ReactNode;
	//     }
	//     interface ElementAttributesProperty { props: {}; }
	//     interface ElementChildrenAttribute { children: {}; }

	//     // We can't recurse forever because `type` can't be self-referential;
	//     // let's assume it's reasonable to do a single React.lazy() around a single React.memo() / vice-versa
	//     type LibraryManagedAttributes<C, P> = C extends React.MemoExoticComponent<infer T> | React.LazyExoticComponent<infer T>
	//         ? T extends React.MemoExoticComponent<infer U> | React.LazyExoticComponent<infer U>
	//             ? ReactManagedAttributes<U, P>
	//             : ReactManagedAttributes<T, P>
	//         : ReactManagedAttributes<C, P>;

		// tslint:disable-next-line:no-empty-interface
		interface IntrinsicAttributes extends NativeAttributes { }
		// tslint:disable-next-line:no-empty-interface
		interface IntrinsicClassAttributes<T> extends ClassAttributes<T> { }

		interface IntrinsicElements {
			[Slot]: SlotAttr & ScopeSlotAttr;
			[SlotRender]: SlotRenderAttr;
			[ScopeSlot]: ScopeSlotAttr;
			slot: SlotAttr;
			[k: string]: any;
			// HTML
			// a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
		}
	}
}
