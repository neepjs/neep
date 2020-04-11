import * as Neep from '@neep/core';

export let isValue: typeof Neep.isValue;
export let EventEmitter: typeof Neep.EventEmitter;
export let Error: typeof Neep.Error;

export default function install(auxiliary: Neep.IRenderAuxiliary) {
	isValue = auxiliary.isValue;
	EventEmitter = auxiliary.EventEmitter;
	Error = auxiliary.Error;
}
