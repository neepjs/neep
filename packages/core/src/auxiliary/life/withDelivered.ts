import { DeliverComponent } from '../../types';
import {
	deliverKeySymbol,
	deliverDefaultSymbol,
} from '../../constant/symbols';
import { assert } from '../../Error';
import { isDeliver } from '../../is';
import { checkCurrent } from '../../extends/current';

export default function withDelivered<T>(deliver: DeliverComponent<T>): T {
	assert(isDeliver(deliver), 'The `deliver` is not a DeliverComponent.', 'deliver');
	const { delivered } = checkCurrent('withDelivered');
	const value = delivered[deliver[deliverKeySymbol] as any];
	return value === undefined ? deliver[deliverDefaultSymbol] : value;
}
