import Neep from '@neep/core';
import { DeliverValue, DeliverNumber } from './delivers';

export default Neep.createShellComponent((
	props: {  a?: any, onset?: () => void },
	{ childNodes },
) => {
	Neep.withLabel('{E}', '#F00');
	const a = Neep.withDelivered(DeliverValue);
	const newA = Neep.computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={Neep.withDelivered(DeliverNumber) + 1}>
			<div>E: {a}|{Neep.withDelivered(DeliverNumber)}</div>
			<tb {...props} {...{'@set': props.onset}}>
				{ childNodes() }
			</tb>
		</DeliverNumber>
	</DeliverValue>;
}, { name: 'E'});
