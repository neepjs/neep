import { Recognizer, Component } from '../types';

const recognizers: Recognizer[] = [];
export function recognize(any: any): Component<any> | null {
	for (const recognizer of recognizers) {
		const res = recognizer(any);
		if (typeof res === 'function') { return res; }
	}
	return typeof any === 'function' ? any : null;
}
export default function addRecognizer(recognizer: Recognizer): void {
	recognizers.push(recognizer);
}
