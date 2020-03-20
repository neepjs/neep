export default class NeepError extends Error {
	readonly tag: string;
	constructor(message: string, tag: string = '') {
		super(tag ? `[${tag}] ${message}` : message);
		this.tag = tag;
	}
}
