import { markRead, markChange, printError } from './install/monitorable';
import { Emit, On, Listener, EventInfo } from './types';
import delayRefresh from './extends/delayRefresh';

function createEmit<T, E extends Record<string, any>>(
	emitter: EventEmitter<T, E>,
	omitNames: (string | number | symbol)[] = [],
): Emit<E> {
	const emit = <N extends keyof E & string>(
		name: N,
		p: E[N],
		options?: any,
	): boolean => delayRefresh(() => {
		const cancelable = Boolean(options?.cancelable);
		const {target} = emitter;
		let defaultPrevented = true;
		const eventInfo: EventInfo<any> = {
			get target() { return target; },
			get cancelable() { return cancelable; },
			get defaultPrevented() { return defaultPrevented; },
			get prevented() { return defaultPrevented; },
			preventDefault() { defaultPrevented = false; },
			prevent() { defaultPrevented = false; },
		};
		const events = emitter.events[name];
		if (!events) { return defaultPrevented; }
		for (const event of events) {
			event(p, eventInfo);
		}
		return defaultPrevented;
	});
	emit.omit = (...names: string[]) => createEmit(emitter, [...omitNames, ...names]);
	Reflect.defineProperty(emit, 'names', {
		get:() => {
			markRead(createEmit, 'names');
			return [...emitter.names]
				.filter(t => !omitNames.includes(t));
		},
		configurable: true,
	});
	return emit as any as Emit<E>;
}

export default class EventEmitter<T, E extends Record<string, any> = Record<string, any>> {

	private readonly _names = new Set<keyof E>();
	get names(): (keyof E)[] { markRead(this, 'names'); return [...this._names]; }
	readonly events: Record<string, Set<Listener<T, any>> | undefined> = Object.create(null);
	readonly emit: Emit<E> = createEmit(this);
	readonly on: On<T, E>;
	target?: T;
	constructor() {
		const names = this._names;
		const eventSet = this.events;

		const on = (name: string, listener: Listener<T, any>): (() => void) => {
			function fn(p: any, event: EventInfo<T>): void {
				try {
					listener(p, event);
				} catch (e) {
					printError(e);
				}
			}
			let event = eventSet[name];
			if (!event?.size) {
				event = new Set();
				event.add(fn);
				eventSet[name] = event;
				names.add(name);
				markChange(this, 'names');
			} else {
				event.add(fn);
			}
			let removed = false;
			return () => {
				if (removed) { return; }
				removed = true;
				if (!event) { return; }
				event.delete(fn);
				if (event.size) { return; }
				names.delete(name);
				markChange(this, 'names');
			};
		};
		this.on = on;
	}
	private readonly __propsEvents:
	Record<string, [Listener<T, any>, () => void]>
	= Object.create(null);
	private readonly __eventMap:
	Record<string, [Listener<T, any>, () => void]>
	= Object.create(null);
	private readonly __propsEmitEvents:
	Record<string, () => void>
	= Object.create(null);
	private __propsEmitEvent?: Emit;

	updateInProps(props: any): void {

		const oldPropsEvents = this.__propsEvents;
		const oldEventNames = new Set(Object.keys(oldPropsEvents));
		for (const [entName, fn] of getEvents(props)) {
			if (oldEventNames.has(entName)) {
				oldEventNames.delete(entName);
				const [olfFn, cl] = oldPropsEvents[entName] || [];
				if (olfFn === fn) { continue; }
				if (cl) { cl(); }
			}
			oldPropsEvents[entName] = [fn, this.on(entName, fn)];
		}
		for (const entName of oldEventNames) {
			const e = oldPropsEvents[entName];
			if (!e) { continue; }
			e[1]();
			delete oldPropsEvents[entName];
		}

		const eventMap = this.__eventMap;
		const oldEventMapNames = new Set(Object.keys(eventMap));
		for (const [entName, fn] of getEventsMap(props)) {
			if (oldEventMapNames.has(entName)) {
				oldEventMapNames.delete(entName);
				const [olfFn, cl] = eventMap[entName] || [];
				if (olfFn === fn) { continue; }
				if (cl) { cl(); }
			}
			eventMap[entName] = [fn, this.on(entName, fn)];
		}
		for (const entName of oldEventMapNames) {
			const e = eventMap[entName];
			if (!e) { continue; }
			e[1]();
			delete eventMap[entName];
		}


		const oldEmitEvents = this.__propsEmitEvents;
		const eventsFn = getEmitFn(props);
		if (eventsFn !== this.__propsEmitEvent) {
			this.__propsEmitEvent = eventsFn;
			for (const entName of [...Object.keys(oldEmitEvents)]) {
				const e = oldEmitEvents[entName];
				if (!e) { continue; }
				e();
				delete oldEmitEvents[entName];
			}
			if (!eventsFn) { return; }
			const {names} = eventsFn;
			if (!Array.isArray(names)) { return; }
			for (const n of names) {
				oldEmitEvents[n] = this.on(n, p => eventsFn(n, p));
			}
			return;
		}
		if (!eventsFn) { return; }
		const oldNames = new Set(Object.keys(oldEmitEvents));
		const names = eventsFn.names || [];
		for (const n of names) {
			if (!n) { continue; }
			oldNames.delete(n);
			if (oldNames.has(n)) { continue; }
			oldEmitEvents[n] = this.on(n, p => eventsFn(n, p));
		}
		for (const entName of oldNames) {
			const e = oldEmitEvents[entName];
			if (!e) { continue; }
			e();
			delete oldEmitEvents[entName];
		}
	}
}
function *getEvents(p: any): IterableIterator<[string, Listener<any, any>]> {
	if (!p) { return; }

	for (const k of Object.keys(p)) {
		const fn = p[k];
		if (typeof fn !== 'function') { continue; }
		if (k.substr(0, 3) !== 'on:') { continue; }
		const entName =  k.substr(3);
		if (!entName) { continue; }
		yield [entName, fn];
	}
}

function *getEventsMap(p: any): IterableIterator<[string, Listener<any, any>]> {
	if (!p) { return; }
	const events = p['n:on'];
	if (!events) { return; }
	if (typeof events === 'object') { return; }
	for (const k of Object.keys(p)) {
		const fn = p[k];
		if (typeof fn !== 'function') { continue; }
		yield [k, fn];
	}
}

function getEmitFn(p: any): Emit | undefined {
	if (!p) { return; }
	let eventsFn = p?.['n:on'] as Emit | undefined;
	if (typeof eventsFn !== 'function') { return; }
	return eventsFn;
}
