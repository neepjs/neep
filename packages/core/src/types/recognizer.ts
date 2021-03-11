import { Component } from './component';

export interface Recognizer {
	(any: any): Component<any> | null
}
