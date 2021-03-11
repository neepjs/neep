import { Slots } from '../../types';
import {
	getSlots,
	setSlots,
} from '../slot';
import { NormalizeAuxiliaryObject } from './index';

export function createSimpleSlots(
	normalizeAuxiliaryObject: NormalizeAuxiliaryObject,
	children: any[],
): Slots {
	const slotMap = Object.create(null);
	getSlots(normalizeAuxiliaryObject.renderer, children, slotMap);
	return setSlots(slotMap);
}
