import { isValue } from '../../install/neep';

export type Id = string;

function getId(v: any): Id | undefined {
	if (typeof v === 'string') { return v; }
	if (typeof v === 'number') { return String(v); }
	return undefined;
}

const PropsMap = new WeakMap<Element, Id | undefined>();
export default function updateId(
	props: {[k: string]: any},
	el: Element,
): void {
	const old = PropsMap.get(el);
	const id = getId(isValue(props.id) ? props.id() : props.id);
	PropsMap.set(el, id);
	if (id !== old) {
		if (typeof id === 'string') {
			el.id = id;
		} else {
			el.removeAttribute('id');
		}
	}
}
