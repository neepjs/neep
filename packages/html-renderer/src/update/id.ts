import { isValue } from '../install/neep';

export type Id = string;

function getId(v: any): Id | undefined {
	if (typeof v === 'string') { return v; }
	if (typeof v === 'number') { return String(v); }
	return undefined;
}
export default function updateId(
	props: {[k: string]: any},
	el: Element,
	old?: Id,
): string | undefined {
	const id = getId(isValue(props.id) ? props.id() : props.id);
	if (id !== old) {
		if (typeof id === 'string') {
			el.id = props.id;
		} else {
			el.removeAttribute('id');
		}
	}
	return id;
}
