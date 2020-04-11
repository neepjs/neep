export default class NeepError extends Error {
	readonly tag: string;
	constructor(message: string, tag: string = '') {
		super(tag ? `[${tag}] ${message}` : message);
		this.tag = tag;
	}
}
export function assert(v: any, message: string, tag?: string) {
	if (v) { return; }
	throw new NeepError(message, tag);
}
