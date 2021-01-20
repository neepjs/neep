export {
	printError, safeify,
	markRead, markChange, postpone,
	exec, monitor,
	value, computed, isValue, valueify, asValue, mixValue,
	defineProperty, createObject, get, set,
	encase,
} from 'monitorable';


export default function installMonitorable(
	api?: typeof import('monitorable'),
): void {
}
