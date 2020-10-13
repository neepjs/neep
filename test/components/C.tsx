import { create, mark, mName, mSimple, createElement, label, mComponent, computed } from '@neep/core';

import D from './D';
import { DeliverValue, DeliverNumber } from './delivers';

const C = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	label('{C}', '#F00');
	const a = delivered(DeliverValue);
	const newA = computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={delivered(DeliverNumber) + 1}>
			<div>C: {a}|{delivered(DeliverNumber)}</div>
			<td {...props}>
				{ childNodes }
			</td>
		</DeliverNumber>
	</DeliverValue>;
});
export default mark(C, mName('C'), mSimple, mComponent('td', D));
