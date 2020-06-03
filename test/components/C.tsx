import { create, mark, mName, mSimple, Deliver, createElement, label, mComponent } from '@neep/core';

import D from './D';

const C = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	label('{C}', '#F00');
	return <Deliver a={delivered.a as number + 1}>
		<div>C: {delivered.a}</div>
		<td {...props}>
			{ childNodes }
		</td>
	</Deliver>;
});
export default mark(C, mName('C'), mSimple, mComponent('td', D));
