import { isValue } from '../install/neep';

export type Attrs = Record<string, string | null>;

export function setAttrs(el: Element, attrs: Record<string, string | null>) {
	if (el instanceof HTMLInputElement && 'checked' in attrs) {

		switch(el.type.toLowerCase()) {
			case 'checkbox':
			case 'radio':
				if ((attrs.checked !== null) !== el.checked) {
					el.checked = attrs.checked !== null;
				}
		}
	}
	if ((
		el instanceof HTMLSelectElement 
		|| el instanceof HTMLInputElement
	) && 'value' in attrs) {
		const value = attrs.value || '';
		if (el.value !== value) {
			el.value = value;
		}
	}
}

function stringify(
	data: any,
	isOn = false,
): string | null | undefined {
	if (data === undefined || data === null) { return data; }
	if (isOn && typeof data === 'function') { return undefined; }
	if (typeof data === 'boolean') { return data ? '' : null; }
	if (typeof data !== 'object') { return String(data); }
	if (data instanceof Date) {
		return data.toISOString();
	}
	if (data instanceof RegExp) {
		return data.toString();
	}
	return JSON.stringify(data);
}
function getAttrs(
	props: {[k: string]: any},
	hasStyle: boolean,
) {
	const attrs: Attrs = Object.create(null);
	for (const k in props) {
		if (/^(n|on|bind|slot)[:-]/.test(k)) { continue; }
		if (!/^[a-zA-Z:_][a-zA-Z0-9:_-]*$/.test(k)) { continue; }
		const name = k
			.toLowerCase();
		switch(name) {
			case 'style':
				if (!hasStyle) { break; }
			case 'ref':
			case 'is':
			case 'id':
			case 'class':
				continue;
		}
		let data = props[k];
		if (isValue(data)) { data = data(); }
		const value = stringify(data, name.substr(0, 2) === 'on');
		if (value !== undefined) { attrs[name] = value; }
	}
	return attrs;
}
function update(
	el: Element,
	attrs: Attrs,
	old: Attrs,
) {
	for (const k of Object.keys(attrs)) {
		const v = attrs[k];
		if (!(k in old) || old[k] !== v) {
			if (v === null) {
				el.removeAttribute(k);
			} else {
				el.setAttribute(k, v);
			}
		}
	}
	for (const k of Object.keys(old)) {
		if (!(k in attrs)) {
			el.removeAttribute(k);
		}
	}
}

export default function updateAttrs(
	props: {[k: string]: any},
	el: Element,
	old: Attrs,
	hasStyle: boolean,
): Attrs {
	const attrs = getAttrs(props, hasStyle);
	update(el, attrs, old);
	setAttrs(el, attrs);
	return attrs;
}
