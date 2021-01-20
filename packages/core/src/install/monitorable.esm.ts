export let value: typeof import('monitorable').value;
export let computed: typeof import('monitorable').computed;
export let isValue: typeof import('monitorable').isValue;
export let encase: typeof import('monitorable').encase;
export let valueify: typeof import('monitorable').valueify;
export let markRead: typeof import('monitorable').markRead;
export let markChange: typeof import('monitorable').markChange;
export let safeify: typeof import('monitorable').safeify;
export let asValue: typeof import('monitorable').asValue;
export let exec: typeof import('monitorable').exec;
export let monitor: typeof import('monitorable').monitor;
export let printError: typeof import('monitorable').printError;
export let postpone: typeof import('monitorable').postpone;
export let createObject: typeof import('monitorable').createObject;
export let defineProperty: typeof import('monitorable').defineProperty;
export let get: typeof import('monitorable').get;
export let set: typeof import('monitorable').set;


export default function installMonitorable(
	api?: typeof import('monitorable'),
): void {
	if (!api) { return; }
	({
		createObject, defineProperty, get, set,
		value,
		computed,
		isValue,
		encase,
		valueify,
		markRead,
		markChange,
		safeify,
		asValue,
		exec,
		monitor,
		printError,
		postpone,
	} = api);
}
