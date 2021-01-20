import Neep from '@neep/core';
import updateId from './id';
import updateClass from './class';
import updateStyle from './style';
import updateAttrs from './attr';
import updateEvent from './event';

export default function updateProps(
	renderer: Neep.IRenderer,
	el: Element,
	props: {[k: string]: any},
	emit: Neep.Emit<Record<string, any>>,
): Element {
	const css = (el as any).style;
	const hasStyle = css instanceof CSSStyleDeclaration;
	updateId(props, el);
	updateClass(props, el);
	updateAttrs(props, el, hasStyle);
	updateStyle(props, el, css, hasStyle);
	updateEvent(props, el, emit);
	return el;
}
