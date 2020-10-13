import { isValue, EventEmitter } from '../install/neep';

export interface Events extends InstanceType<typeof EventEmitter> {
	__eventBind: Record<string, () => void>;
}

function createEventEmitter(): Events {
	const events: Events = new EventEmitter() as Events;
	events.__eventBind = Object.create(null);
	return events;
}


function *getElementModel(el: Element): Iterable<[string, string, (e: any) => any]> {
	if (el instanceof HTMLInputElement) {
		switch (el.type.toLowerCase()) {
			case 'checkbox':
				yield [
					'indeterminate', 'change',
					(e: any) => (e.currentTarget as HTMLInputElement).indeterminate,
				];
				return yield [
					'checked', 'change',
					(e: any) => (e.currentTarget as HTMLInputElement).checked,
				];
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
	if (el instanceof HTMLTextAreaElement) {
		return yield [
			'value', 'input',
			(e: any) => (e.currentTarget as HTMLTextAreaElement).value,
		];
	}
	if (el instanceof HTMLSelectElement) {
		return yield [
			'value', 'change',
			(e: any) => (e.currentTarget as HTMLSelectElement).value,
		];
	}
	if (el instanceof HTMLDetailsElement) {
		return yield [
			'open', 'toggle',
			(e: any) => (e.currentTarget as HTMLDetailsElement).open,
		];
	}
	if (el instanceof HTMLMediaElement) {
		yield [
			'currentTime', 'timeupdate',
			(e: any) => (e.currentTarget as HTMLMediaElement).currentTime,
		];
		yield [
			'playbackRate', 'ratechange',
			(e: any) => (e.currentTarget as HTMLMediaElement).playbackRate,
		];
		yield [
			'volume', 'volumechange',
			(e: any) => (e.currentTarget as HTMLMediaElement).volume,
		];
		yield [
			'muted', 'volumechange',
			(e: any) => (e.currentTarget as HTMLMediaElement).muted,
		];
		yield [
			'paused', 'playing',
			(e: any) => (e.currentTarget as HTMLMediaElement).paused,
		];
		return yield [
			'paused', 'pause',
			(e: any) => (e.currentTarget as HTMLMediaElement).paused,
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
		const f = (...p: any[]): boolean => emit(k, ...p);
		el.addEventListener(k, f);
		eventBind[k] = () => {
			el.removeEventListener(k, f);
		};
	}
	return event;
}
