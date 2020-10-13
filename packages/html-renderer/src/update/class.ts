import { isValue } from '../install/neep';
import { Value } from 'monitorable';

export type RecursiveItem<T> = T | RecursiveItem<T>[] | Value<T>;

export function *recursive2iterable<T>(
	list: RecursiveItem<T>,
): Iterable<T> {
	if (isValue(list)) {
		yield *recursive2iterable(list());
		return;

	}
	if (!Array.isArray(list)) {
		yield list;
		return;
	}
	for (const it of list) {
		yield *recursive2iterable(it);
	}
}

export type Class = Set<string>;
function getClass(
	list: RecursiveItem<(string | {[k: string]: any})>,
): Class | undefined {
	const set = new Set<string>();
	for (const v of recursive2iterable(list)) {
		if (!v) { continue; }
		if (typeof v === 'string') {
			for (let k of v.split(' ').filter(Boolean)) {
				set.add(k);
			}
		} else if (typeof v === 'object') {
			for (const k in v) {
				const add = v[k];
				for (let it of k.split(' ').filter(Boolean)) {
					set[add ? 'add' : 'delete'](it);
				}
			}
		}
	}
	if (!set.size) { return undefined; }
	return set;
}
function update(
	el: Element,
	classes?: Class,
	oClasses?: Class,
): void {
	if (classes && oClasses) {
		const list = el.getAttribute('class') || '';
		const classList = new Set(list.split(' ').filter(Boolean));
		oClasses.forEach(c => classList.delete(c));
		classes.forEach(c => classList.add(c));
		el.setAttribute('class', [...classList].join(' '));
	} else if (classes) {
		el.setAttribute('class', [...classes].join(' '));
	} else if (oClasses) {
		el.removeAttribute('class');
	}
}
export default function updateClass(
	props: {[k: string]: any},
	el: Element,
	old?: Class,
): Class | undefined {
	const classes = getClass(isValue(props.class) ? props.class() : props.class);
	update(el, classes, old);
	return classes;
}
