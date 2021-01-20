import {
	deliverKeySymbol,
	deliverDefaultSymbol,
} from '../symbols';
import { DeliverComponent } from '../type';
import { assert } from '../Error';
import { isDeliver } from '../is';

export default function getDelivered<T>(delivered: any, deliver: DeliverComponent<T>): T {
	assert(isDeliver(deliver), 'The `deliver` is not a DeliverComponent.', 'deliver');
	const value = delivered[deliver[deliverKeySymbol]];
	return value === undefined ? deliver[deliverDefaultSymbol] : value;
}
