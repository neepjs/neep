import Neep from '@neep/core';

import D from './D';
import { DeliverValue, DeliverNumber } from './delivers';

export default Neep.createShellComponent((
	props: {  a?: any, onset?: () => void },
	{ childNodes },
) => {
	Neep.withLabel('{C}', '#F00');
	const a = Neep.withDelivered(DeliverValue);
	const newA = Neep.computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={Neep.withDelivered(DeliverNumber) + 1}>
			<div>C: {a}|{Neep.withDelivered(DeliverNumber)}</div>
			<D {...props}>
				{ childNodes() }
			</D>
		</DeliverNumber>
	</DeliverValue>;
}, {name: 'C'});
