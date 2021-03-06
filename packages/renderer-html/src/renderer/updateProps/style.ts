import { isValue } from '../../install/neep';

export type Style = string | Record<string, [string, 'important' | undefined]>;

const unit: Record<string, string> = {
	'width': 'px',
	'height': 'px',
	'top': 'px',
	'right': 'px',
	'bottom': 'px',
	'left': 'px',
	'border': 'px',
	'border-top': 'px',
	'border-right': 'px',
	'border-left': 'px',
	'border-bottom': 'px',
	'border-width': 'px',
	'border-top-width': 'px',
	'border-right-width': 'px',
	'border-left-width': 'px',
	'border-bottom-width': 'px',
	'border-radius': 'px',
	'border-top-left-radius': 'px',
	'border-top-right-radius': 'px',
	'border-bottom-left-radius': 'px',
	'border-bottom-right-radius': 'px',
	'padding': 'px',
	'padding-top': 'px',
	'padding-right': 'px',
	'padding-left': 'px',
	'padding-bottom': 'px',
	'margin': 'px',
	'margin-top': 'px',
	'margin-right': 'px',
	'margin-left': 'px',
	'margin-bottom': 'px',
};
function getStyle(
	style: any,
): Style | undefined {
	if (isValue(style)) { style = style(); }
	if (typeof style === 'string') { return style; }
	if (!style) { return undefined; }
	if (typeof style !== 'object') { return undefined; }
	const css: Record<string, [string, 'important' | undefined]> =
		Object.create(null);
	for (let k in style) {
		let value = style[k];
		if (isValue(value)) { value = value(); }
		const key = k.substr(0, 2) === '--' ? k
			: k.replace(/[A-Z]/g, '-$1')
				.replace(/-+/g, '-')
				.toLowerCase();
		if (typeof value === 'number') {
			const str = value && k in unit
				? `${ value }${ unit[k] }`
				: `${ value }`;
			css[key] = [str, undefined];
		} else if (value && typeof value === 'string') {
			const v = value.replace(/!important\s*$/, '');
			css[key] = [v, v === value ? undefined : 'important'];
		}
	}
	return css;
}

function update(
	css: CSSStyleDeclaration,
	style?: Style,
	oStyle?: Style,
): void {
	if (!style) {
		if (!oStyle) { return; }
		if (typeof oStyle === 'string') {
			css.cssText = '';
			return;
		}
		for (const k of Object.keys(oStyle)) {
			css.removeProperty(k);
		}
		return;
	}

	if (typeof style === 'string') {
		if (style !== typeof oStyle) {
			css.cssText = style;
		}
		return;
	}
	if (!oStyle || typeof oStyle === 'string') {
		if (typeof oStyle === 'string') {
			css.cssText = '';
		}
		for (const k of Object.keys(style)) {
			css.setProperty(k, ...style[k]);
		}
		return;
	}

	for (const k of Object.keys(style)) {
		const v = style[k];
		if (
			!oStyle[k]
			|| oStyle[k][0] !== v[0]
			|| oStyle[k][1] !== v[1]
		) {
			css.setProperty(k, ...v);
		}
	}
	for (const k of Object.keys(oStyle)) {
		if (!style[k]) {
			css.removeProperty(k);
		}
	}
}
const PropsMap = new WeakMap<Element, Style | undefined>();
export default function updateStyle(
	props: {[k: string]: any},
	el: Element,
	css: CSSStyleDeclaration,
	hasStyle?: boolean,
): Style | undefined {
	if (!hasStyle) { return undefined; }
	const old = PropsMap.get(el);

	const style = getStyle(
		isValue(props.style) ? props.style() : props.style,
	);
	update(css, style, old);
	PropsMap.set(el, style);
	return style;
}
