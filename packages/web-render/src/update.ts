import {
	recursive2iterable, RecursiveItem,
} from '../../core/src/render/recursive';
import * as monitorable from 'monitorable';
import { getElementModel, ModelInfo, setAttrs } from './props';

function getId(v: any): string | undefined {
	if (typeof v === 'string') { return v; }
	if (typeof v === 'number') { return String(v); }
	return undefined;
}
function getClass(
	list: RecursiveItem<(string | {[k: string]: any})>
): Set<string> | undefined {
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

function getStyle(
	style: any
): string | Record<string, [string, 'important' | null]> | undefined {
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
	isValue: typeof monitorable.isValue,
) {
	const attrs: Record<string, string | null> = Object.create(null);
	for (const k in props) {
		if (!/^[a-zA-Z0-9_-]/.test(k[0])) { continue; }
		const name = k
			.replace(/([A-Z])/g, '-$1')
			.replace(/(\-)\-+/g, '$1')
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
function getEvent(
	props: {[k: string]: any},
	isValue: typeof monitorable.isValue,
	modelInfo?: ModelInfo,
) {
	const evt: Record<string, Set<EventListener>> = Object.create(null);
	function addEvt(name: string, f: EventListener) {
		let set = evt[name];
		if (!set) {
			set = new Set();
			evt[name] = set;
		}
		set.add(f);
	}
	for (const k in props) {
		const f = props[k];
		if (typeof f !== 'function') { continue; }
		if (k[0] !== '@' && k.substr(0, 2) !== 'on') { continue; }
		const name = k.substr(k[0] === '@' ? 1 : 2).toLowerCase();
		addEvt(name, f);
	}
	if (modelInfo) {
		const [prop, name , t] = modelInfo;
		const value = props[prop];
		if (isValue(value)) {
			addEvt(name, e => value(t(e)));
		}
	}
	return evt;
}
interface Props {
	id?: string;
	classes?: Set<string>;
	style?: string | Record<string, [string, 'important' | null]>;
	attrs: Record<string, string | null>;
	event: Record<string, Set<EventListener>>;
}
function getProps(
	{
		id,
		class: className,
		style,
		...attrs
	}: {[k: string]: any},
	hasStyle: boolean,
	isValue: typeof monitorable.isValue,
	modelInfo?: ModelInfo,
): Props {
	return {
		id: getId(isValue(id) ? id() : id),
		classes: getClass(isValue(className) ? id() : className),
		style: hasStyle ? getStyle(isValue(style) ? style() : style) : undefined,
		attrs: getAttrs(attrs, hasStyle, isValue),
		event: getEvent(attrs, isValue, modelInfo),
	};
}

function updateClass(
	el: Element,
	classes?: Set<string>,
	oClasses?: Set<string>,
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
function updateStyle(
	css: CSSStyleDeclaration,
	style?: string | Record<string, [string, 'important' | null]>,
	oStyle?: string | Record<string, [string, 'important' | null]>,
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
function updateAttrs(
	el: Element,
	attrs: Record<string, string | null>,
	oAttrs: Record<string, string | null>,
) {
	for (const k of Object.keys(attrs)) {
		const v = attrs[k];
		if (!(k in oAttrs) || oAttrs[k] !== v) {
			if (v === null) {
				el.removeAttribute(k);
			} else {
				el.setAttribute(k, v);
			}
		}
	}
	for (const k of Object.keys(oAttrs)) {
		if (!(k in attrs)) {
			el.removeAttribute(k);
		}
	}
	setAttrs(el, attrs);
}

function updateEvent(
	el: Element,
	evt: Record<string, Set<EventListener>>,
	oEvt: Record<string, Set<EventListener>>,
) {

	for (const k of Object.keys(evt)) {
		const set = evt[k];
		if (k in oEvt) {
			const oSet = oEvt[k];
			for (const f of set) {
				if (!oSet.has(f)) { el.addEventListener(k, f); }
			}
			for (const f of oSet) {
				if (!set.has(f)) { el.removeEventListener(k, f); }
			}
		} else {
			for (const f of set) {
				el.addEventListener(k, f);
			}
		}
	}
	for (const k of Object.keys(oEvt)) {
		if (k in evt) { continue; }
		for (const f of oEvt[k]) {
			el.removeEventListener(k, f);
		}
	}
}

const PropsMap = new WeakMap<Element, Props>();
export default function update(
	el: Element,
	props: {[k: string]: any},
	isValue: typeof monitorable.isValue,
) {
	const css = (el as any).style;
	const hasStyle = css instanceof CSSStyleDeclaration;
	const old = PropsMap.get(el) || { attrs: {}, event: {} };

	const { id,  classes, style, attrs, event } =
		getProps(props, hasStyle, isValue, getElementModel(el));
	PropsMap.set(el, { id, classes, style, attrs, event });
	if (id !== old.id) {
		if (typeof id === 'string') {
			el.id = props.id;
		} else {
			el.removeAttribute('id');
		}
	}
	updateClass(el, classes, old.classes);
	if (hasStyle) { updateStyle(css, style, old.style); }
	updateAttrs(el, attrs, old.attrs);
	updateEvent(el, event, old.event);
	return el;
}
