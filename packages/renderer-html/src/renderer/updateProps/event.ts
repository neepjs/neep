import Neep from '@neep/core';
import { isValue } from '../../install/neep';


function *getElementModel(el: Element): Iterable<[string, string, (e: Event) => any]> {
	if (el instanceof HTMLInputElement) {
		switch (el.type.toLowerCase()) {
			case 'checkbox':
				yield [
					'indeterminate', 'change',
					e => (e.currentTarget as HTMLInputElement).indeterminate,
				];
				return yield [
					'checked', 'change',
					e => (e.currentTarget as HTMLInputElement).checked,
				];
			case 'radio':
				return yield [
					'checked', 'change',
					e => (e.currentTarget as HTMLInputElement).checked,
				];
		}
		return yield [
			'value', 'input',
			e => (e.currentTarget as HTMLInputElement).value,
		];
	}
	if (el instanceof HTMLTextAreaElement) {
		return yield [
			'value', 'input',
			e => (e.currentTarget as HTMLTextAreaElement).value,
		];
	}
	if (el instanceof HTMLSelectElement) {
		return yield [
			'value', 'change',
			e => (e.currentTarget as HTMLSelectElement).value,
		];
	}
	if (el instanceof HTMLDetailsElement) {
		return yield [
			'open', 'toggle',
			e => (e.currentTarget as HTMLDetailsElement).open,
		];
	}
	if (el instanceof HTMLMediaElement) {
		yield [
			'currentTime', 'timeupdate',
			e => (e.currentTarget as HTMLMediaElement).currentTime,
		];
		yield [
			'playbackRate', 'ratechange',
			e => (e.currentTarget as HTMLMediaElement).playbackRate,
		];
		yield [
			'volume', 'volumechange',
			e => (e.currentTarget as HTMLMediaElement).volume,
		];
		yield [
			'muted', 'volumechange',
			e => (e.currentTarget as HTMLMediaElement).muted,
		];
		yield [
			'paused', 'playing',
			e => (e.currentTarget as HTMLMediaElement).paused,
		];
		return yield [
			'paused', 'pause',
			e => (e.currentTarget as HTMLMediaElement).paused,
		];
	}

}

type ValueEventBindItem = [Neep.Value<any>, () => void];
type ValueEventBind = Record<string, ValueEventBindItem>;
const ValueEventMap = new WeakMap<Element, ValueEventBind>();

function getValueEventBind(el: Element): ValueEventBind {
	let list = ValueEventMap.get(el);
	if (list) { return list; }
	list = Object.create(null) as ValueEventBind;
	ValueEventMap.set(el, list);
	return list;
}


const bindMap = new WeakMap<Element, Record<string, () => void>>();
function getEventBind(el: Element): Record<string, () => void> {
	let list = bindMap.get(el);
	if (list) { return list; }
	list = Object.create(null) as Record<string, () => void>;
	bindMap.set(el, list);
	return list;
}

export default function updateEvent(
	props: {[k: string]: any},
	el: Element,
	emit: Neep.Emit<Record<string, any>>,
): void {
	const valueEventMap = getValueEventBind(el);
	for (const [prop, name, t] of getElementModel(el)) {
		const value = props[prop];
		const item = valueEventMap[prop];
		if (item && item[0] === value) { continue; }
		if (item) { item[1](); }
		if (!isValue(value)) { continue; }
		const f = (e: Event): void => { value(t(e)); };
		el.addEventListener(name, f);
		valueEventMap[name] = [value, () => el.removeEventListener(name, f)];
	}

	const names = new Set(emit.names.map(String));
	const eventBind = getEventBind(el);
	for (const k of Object.keys(eventBind)) {
		if (names.has(k)) { continue; }
		eventBind[k]();
		delete eventBind[k];
	}
	for (const k of names) {
		if (k in eventBind) { continue; }
		const f = (p: any): boolean => emit(k, p);
		el.addEventListener(k, f);
		eventBind[k] = () => {
			el.removeEventListener(k, f);
		};
	}
}
