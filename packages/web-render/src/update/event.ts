import { isValue, EventEmitter } from '../install';
import * as Neep from '@neep/core';

export interface Events extends Neep.EventEmitter {
	__eventBind: Record<string, () => void>;
}

function createEventEmitter(): Events {
	const events: Events = new EventEmitter as Events;
	events.__eventBind = Object.create(null);
	return events;
}


function *getElementModel(el: Element): Iterable<[string, string, (e: any) => any]> {
	if (el instanceof HTMLInputElement) {
		switch(el.type.toLowerCase()) {
			case 'checkbox':
			case 'radio':
			return yield [
				'checked', 'change',
				(e: any) => (e.currentTarget as HTMLInputElement).checked,
			];
		}
		return yield [
			'value', 'input',
			(e: any) => (e.currentTarget as HTMLInputElement).value,
		];
	}
	if (el instanceof HTMLSelectElement) {
		return yield [
			'value', 'select',
			(e: any) => (e.currentTarget as HTMLSelectElement).value,
		];
	}
}

function getEventName(k: string): string {
	if (k.substr(0, 2) !== 'on') { return ''; }
	let n = k.substr(2);
	if (n[0] === ':' || n[0] === '-') { return ''; }
	return n;
}

export default function updateEvent(
	props: {[k: string]: any},
	el: Element,
	event = createEventEmitter(),
): Events {
	event.updateInProps(props, addEvent => {
		for (const k in props) {
			const f = props[k];
			if (typeof f !== 'function') { continue; }
			const name = getEventName(k);
			if (!name) { continue; }
			addEvent(name, f);
		}
		for (const [prop, name, t] of getElementModel(el)) {
			const value = props[prop];
			if (isValue(value)) {
				addEvent(name, e => value(t(e)));
			}
		}
	});

	const names = new Set(event.names.map(String));
	const eventBind = event.__eventBind;
	for (const k of Object.keys(eventBind)) {
		if (names.has(k)) { continue; }
		eventBind[k]();
		delete eventBind[k];
	}
	const {emit} = event;
	for (const k of names) {
		if (k in eventBind) { continue; }
		const f = (...p: any[]) => emit(k, ...p);
		el.addEventListener(k, f);
		eventBind[k] = () => {
			el.removeEventListener(k, f);
		};
	}
	return event;
}
