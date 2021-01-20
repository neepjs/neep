import Neep from '@neep/core';
import { DeliverValue, DeliverNumber } from './delivers';

export default Neep.createShellComponent((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	Neep.label('{E}', '#F00');
	const a = delivered(DeliverValue);
	const newA = Neep.computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={delivered(DeliverNumber) + 1}>
			<div>E: {a}|{delivered(DeliverNumber)}</div>
			<tb {...props} {...{'@set': props.onset}}>
				{ childNodes }
			</tb>
		</DeliverNumber>
	</DeliverValue>;
}, { name: 'E'});
