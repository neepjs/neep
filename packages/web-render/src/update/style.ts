import { isValue } from '../install/neep';

export type Style = string | Record<string, [string, 'important' | null]>;

function getStyle(
	style: any
): Style | undefined {
	if (typeof style === 'string') { return style; }
	if (!style) { return undefined; }
	if (typeof style !== 'object') { return undefined; }
	const css: Record<string, [string, 'important' | null]> =
		Object.create(null);
	for (let k in style) {
		let value = style[k];
		const key = k.substr(0, 2) === '--' ? k
			: k.replace(/[A-Z]/g, '-$1')
				.replace(/-+/g, '-')
				.toLowerCase();
		if (typeof value === 'number') {
			css[key] = [value === 0 ? '0' : `${value}px`, null];
		} else if (value && typeof value === 'string') {
			const v = value.replace(/\!important\s*$/, '');
			css[key] = [v, v === value ? null : 'important'];
		}
	}
	return css;
}

function update(
	css: CSSStyleDeclaration,
	style?: Style,
	oStyle?: Style,
) {
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
export default function updateStyle(
	props: {[k: string]: any},
	css: CSSStyleDeclaration,
	old?: Style,
	hasStyle?: boolean,
): Style | undefined {
	if (!hasStyle) { return undefined; }

	const style = getStyle(isValue(props.style) ? props.style() : props.style);
	update(css, style, old);
	return style;
}
