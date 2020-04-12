import { create, mark, mName, mSimple, Deliver, mComponent } from '@neep/core';

import D from './D';

const C = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
	{ createElement, label },
) => {
	label('{C}', '#F00');
	return <Deliver a={delivered.a + 1}>
		<div>C: {delivered.a}</div>
		<td {...props}>
			{ childNodes }
		</td>
	</Deliver>;
});
export default mark(C, mName('C'), mSimple, mComponent('td', D));
