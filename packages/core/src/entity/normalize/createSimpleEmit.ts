
import { Emit } from '../../types';
import EventEmitter from '../../EventEmitter';

export default function createSimpleEmit(props?: Record<string, any>): Emit<Record<string, any>> {
	const event = new EventEmitter();
	event.updateInProps(props);
	return event.emit;
}
