import updateId, { Id } from './id';
import updateClass, { Class } from './class';
import updateStyle, { Style } from './style';
import updateAttrs, { Attrs } from './attr';
import updateEvent, { Events } from './event';
import { IsValue } from '../type';

const PropsMap = new WeakMap<Element, {
	id?: Id;
	classes?: Class;
	style?: Style;
	attrs: Attrs;
	event?: Events;
}>();

export default function update(
	el: Element,
	props: {[k: string]: any},
	isValue: IsValue,
) {
	const css = (el as any).style;
	const hasStyle = css instanceof CSSStyleDeclaration;
	const old = PropsMap.get(el) || { attrs: {} };

	const id = updateId(props, isValue, el, old.id);
	const classes = updateClass(props, isValue, el, old.classes);
	const style = updateStyle(props, isValue, css, old.style, hasStyle);
	const attrs = updateAttrs(props, isValue, el, old.attrs, hasStyle);
	const event = updateEvent(props, isValue, el, old.event);
	PropsMap.set(el, { id, classes, style, attrs, event });
	return el;
}
