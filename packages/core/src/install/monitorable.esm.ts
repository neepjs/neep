export let value: typeof import('monitorable').value;
export let computed: typeof import('monitorable').computed;
export let isValue: typeof import('monitorable').isValue;
export let encase: typeof import('monitorable').encase;
export let recover: typeof import('monitorable').recover;
export let valueify: typeof import('monitorable').valueify;
export let markRead: typeof import('monitorable').markRead;
export let markChange: typeof import('monitorable').markChange;
export let safeify: typeof import('monitorable').safeify;
export let asValue: typeof import('monitorable').asValue;
export let exec: typeof import('monitorable').exec;
export let monitor: typeof import('monitorable').monitor;

export default function installMonitorable(
	api?: typeof import('monitorable'),
) {
	if (!api) { return; }
	value = api.value;
	computed = api.computed;
	isValue = api.isValue;
	encase = api.encase;
	recover = api.recover;
	valueify = api.valueify;
	markRead = api.markRead;
	markChange = api.markChange;
	safeify = api.safeify;
	asValue = api.asValue;
	exec = api.exec;
	monitor = api.monitor;
}
