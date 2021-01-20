
export let printError: typeof import('monitorable').printError;
export let safeify: typeof import('monitorable').safeify;

export let markRead: typeof import('monitorable').markRead;
export let markChange: typeof import('monitorable').markChange;
export let postpone: typeof import('monitorable').postpone;

export let exec: typeof import('monitorable').exec;
export let monitor: typeof import('monitorable').monitor;

export let value: typeof import('monitorable').value;
export let computed: typeof import('monitorable').computed;
export let isValue: typeof import('monitorable').isValue;
export let valueify: typeof import('monitorable').valueify;
export let asValue: typeof import('monitorable').asValue;
export let mixValue: typeof import('monitorable').mixValue;


export let defineProperty: typeof import('monitorable').defineProperty;
export let createObject: typeof import('monitorable').createObject;
export let get: typeof import('monitorable').get;
export let set: typeof import('monitorable').set;

export let encase: typeof import('monitorable').encase;

export default function installMonitorable(
	api?: typeof import('monitorable'),
): void {
	if (!api) { return; }
	({
		printError, safeify,
		markRead, markChange, postpone,
		exec, monitor,
		value, computed, isValue, valueify, asValue, mixValue,
		defineProperty, createObject, get, set,
		encase,
	} = api);
}
