export default class NeepError extends Error {
	readonly tag: string;
	constructor(message: string, tag: string = '') {
		super(tag ? `[${ tag }] ${ message }` : message);
		this.tag = tag;
	}
}
export function assert(
	v: any,
	message: string | (() => string),
	tag?: string,
): asserts v {
	if (v) { return; }
	if (typeof message === 'function') { message = message(); }
	throw new NeepError(message, tag);
}
