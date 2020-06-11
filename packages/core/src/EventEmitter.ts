import { markRead, markChange, printError } from './install';
import { Emit, On } from './type';
import { refresh } from './extends';

function getEventName(k: string): string {
	if (k[0] === '@') { return k.substr(1); }
	if (/^on[:-]/.test(k)) { return k.substr(3); }
	if (/^n([:-])on(\1|:)/.test(k)) { return k.substr(5); }
	return '';
}
interface AddEvent<T extends Record<string, any[]>> {
	<N extends keyof T>(
		entName: N,
		listener: (...p: T[N]) => void,
	): void
}

function addEventFromCollection(
	addEvent: (entName: string, listener: (...p: any) => void) => void,
	events: any,
): void {
	if (!events) { return; }
	if (typeof events === 'function') {
		const { names } = events as Emit;
		if (!Array.isArray(names)) { return; }
		for (const n of names) {
			if (!n) { continue; }
			addEvent(n, (...p) => events(n, ...p));
		}
		return;
	}
	if (typeof events !== 'object') { return; }
	for (const k of Object.keys(events)) {
		const f = events[k];
		if (typeof f !== 'function') { continue; }
		addEvent(k, f);
	}

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
		addEventFromCollection(addEvent, props['@']);
		addEventFromCollection(addEvent, props['n:on']);
		addEventFromCollection(addEvent, props['n-on']);
		if (typeof custom === 'function') {
			custom(addEvent);
		}
		newHandles.push(...EventEmitter.update(emitter, props['@']));
		return newHandles;
	}

	private readonly _names = new Set<keyof T>();
	private readonly _cancelHandles = new Set<() => void>();
	get names(): (keyof T)[] {
		return [...this._names];
	}
	readonly emit: Emit<T>;
	readonly on: On<T>;
	constructor() {
		const events: Record<keyof T, Set<(...p: any) => boolean>> = Object.create(null);
		const names = this._names;

		function createEmit(
			...omitNames: (string | number | symbol)[]
		): Emit<T> {
			function emit<N extends keyof T>(name: N, ...p: T[N]): boolean {
				const event = events[name];
				if (!event) { return true; }
				return refresh(() => {
					let res = true;
					for (const fn of [...event]) {
						res = fn(...p) && res;
					}
					return res;
				});
			}
			emit.omit = (...names: string[]) =>
				createEmit(...omitNames, ...names);
			Reflect.defineProperty(emit, 'names', {
				get:() => {
					markRead(createEmit, 'names');
					return [...names]
						.filter(t => !omitNames.includes(t));
				},
				configurable: true,
			});
			return emit as any as Emit<T>;
		}
		const on: On<T> = (name, listener): () => void => {
			function fn(...p: Parameters<typeof listener>): boolean {
				try {
					return listener(...p) !== false;
				} catch (e) {
					printError(e);
					return true;
				}
			}
			let event = events[name];
			if (!event?.size) {
				event = new Set();
				events[name] = event;
				markChange(createEmit, 'names');
				names.add(name);
			}
			event.add(fn);
			let removed = false;
			return () => {
				if (removed) { return; }
				removed = true;
				event.delete(fn);
				if (event.size) { return; }
				markChange(createEmit, 'names');
				names.delete(name);
			};
		};
		this.emit = createEmit();
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
