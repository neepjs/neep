import { monitorable } from './install';
import { Emit, On } from './type';

function getEventName(k: string): string {
	if (k[0] === '@') { return k.substr(1); }
	if (/^on[:-]/.test(k)) { return k.substr(3); }
	return '';
}
interface AddEvent<T extends Record<string, any[]>> {
	<N extends keyof T>(
		entName: N,
		listener: (...p: T[N]) => void,
	): void
}

export default class EventEmitter<
	T extends Record<string, any[]> = Record<string, any[]>
> {
	static update<T extends Record<string, any[]>>(
		emitter: EventEmitter<T>,
		events: any,
	): (() => void)[] {
		if (!events) { return []; }
		const newHandles: (() => void)[] = [];
		if (events && typeof events === 'object') {
			for (const n of Object.keys(events)) {
				if (!n) { continue; }
				const fn = events[n];
				if (typeof fn !== 'function') { continue; }
				newHandles.push(emitter.on(n, fn));
			}
		}
		return newHandles;
	}
	static updateInProps<T extends Record<string, any[]>>(
		emitter: EventEmitter<T>,
		props: any,
		custom?: (addEvent: AddEvent<T>) => void,
	): (() => void)[] {
		if (!props) { return []; }
	
		const newHandles: (() => void)[] = [];

		function addEvent<N extends keyof T>(
			entName: N,
			listener: (...p: T[N]) => void,
		): void {
			newHandles.push(emitter.on(entName, listener));
		}
		for (const k of Object.keys(props)) {
			const fn = props[k];
			if (typeof fn !== 'function') { continue; }
			const entName = getEventName(k);
			if (!entName) { continue; }
			addEvent(entName, fn);
		}
		const event = props['@'];
		if (event && typeof event === 'object') {
			for (const k of Object.keys(event)) {
				const f = event[k];
				if (typeof f !== 'function') { continue; }
				addEvent(k, f);
			}
		} if (typeof event === 'function') {
			const { names } = event as Emit;
			if (Array.isArray(names)) {
				for (const n of names) {
					if (!n) { continue; }
					addEvent(n, (...p) => event(n, ...p));
				}
			}
		}
		if (typeof custom === 'function') {
			custom(addEvent);
		}
		newHandles.push(...EventEmitter.update(emitter, props['@']));
		return newHandles;
	}

	private _names: (keyof T)[] = [];
	private readonly _cancelHandles = new Set<() => void>();
	get names(): (keyof T)[] {
		return this._names;
	}
	readonly emit: Emit<T>;
	readonly on: On<T>;
	constructor() {
		const events: Record<keyof T, Set<Function>> = Object.create(null);
		const names = this._names;
		function emit<N extends keyof T>(name: N, ...p: T[N]): void {
			const event = events[name];
			if (!event) { return; }
			for (const fn of [...event]) { 
				fn(...p);
			}
		}
		emit.names = names;
		Reflect.defineProperty(emit, 'names', {
			get:() => {
				monitorable.markRead(emit, 'names');
				return this._names;
			},
			configurable: true,
		});
		const on: On<T> = (name, listener) => {
			const fn = monitorable.safeify(listener);
			let event = events[name];
			if (!event) {
				event = new Set();
				events[name] = event;
				monitorable.markChange(emit, 'names');
				this._names = [...this._names, name];
			}
			event.add(fn);
			let removed = false;
			return () => {
				if (removed) { return; }
				removed = true;
				event.delete(fn);
				if (event.size) { return; }
				monitorable.markChange(emit, 'names');
				this._names = this._names.filter(n => n !== name);
			};
		};
		this.emit = emit;
		this.on = on;
	}
	updateHandles(newHandles: (() => void)[]): (() => void)[] {
		const eventCancelHandles = this._cancelHandles;
		const oldHandles = [...eventCancelHandles];
		eventCancelHandles.clear();
		for (const fn of oldHandles) { fn(); }
		newHandles.forEach(f => eventCancelHandles.add(f));
		return newHandles;
	}
	update(list: any): (() => void)[] {
		const handles = EventEmitter.update(this, list);
		return this.updateHandles(handles);
	}
	updateInProps(
		list: any,
		custom?: (addEvent: AddEvent<T>) => void,
	): (() => void)[] {
		const handles = EventEmitter.updateInProps(this, list, custom);
		return this.updateHandles(handles);
	}
}
