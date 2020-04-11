import {
	recursive2iterable, RecursiveItem,
} from '../../../core/src/render/recursive';
import { IsValue } from '../type';

export type Class = Set<string>;
function getClass(
	list: RecursiveItem<(string | {[k: string]: any})>
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
) {
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
	isValue: IsValue,
	el: Element,
	old?: Class,
) {
	const classes = getClass(isValue(props.class) ? props.class() : props.class);
	update(el, classes, old);
	return classes;
}
