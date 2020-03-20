import { ScopeSlot, Slot, SlotRender, Value, Template, NeepElement, Node } from '.';

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

	//     type LibraryManagedAttributes<C, P> = C extends React.MemoExoticComponent<infer T> | React.LazyExoticComponent<infer T>
	//         ? T extends React.MemoExoticComponent<infer U> | React.LazyExoticComponent<infer U>
	//             ? ReactManagedAttributes<U, P>
	//             : ReactManagedAttributes<T, P>
	//         : ReactManagedAttributes<C, P>;

		interface IntrinsicAttributes extends NativeAttributes { }
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
