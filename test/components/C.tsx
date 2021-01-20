import Neep from '@neep/core';

import D from './D';
import { DeliverValue, DeliverNumber } from './delivers';

export default Neep.createShellComponent((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	Neep.label('{C}', '#F00');
	const a = delivered(DeliverValue);
	const newA = Neep.computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={delivered(DeliverNumber) + 1}>
			<div>C: {a}|{delivered(DeliverNumber)}</div>
			<D {...props}>
				{ childNodes }
			</D>
		</DeliverNumber>
	</DeliverValue>;
}, {name: 'C'});
