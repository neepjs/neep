import { create, mark, mName, mSimple, createElement, label, computed  } from '@neep/core';
import { DeliverValue, DeliverNumber } from './delivers';

const E = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	label('{E}', '#F00');
	const a = delivered(DeliverValue);
	const newA = computed(() => a.value + 1);
	return <DeliverValue value={newA}>
		<DeliverNumber value={delivered(DeliverNumber) + 1}>
			<div>E: {a}|{delivered(DeliverNumber)}</div>
			<tb {...props} {...{'@set': props.onset}}>
				{ childNodes }
			</tb>
		</DeliverNumber>
	</DeliverValue>;
});
export default mark(E, mName('E'), mSimple);
