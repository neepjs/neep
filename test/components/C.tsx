import { create, mark, mName, mSimple, Deliver } from '@neep/core';

import D from './D';

const C = create((
	props: {  a?: any,  set?: () => void },
	{ childNodes, delivered },
	{ createElement, label },
) => {
	label('{C}', '#F00');
	return <Deliver a={delivered.a + 1}>
		<div>C: {delivered.a}</div>
		<D {...props}>
			{ childNodes }
		</D>
	</Deliver>;
});
export default mark(C, mName('C'), mSimple);
