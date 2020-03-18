import { create, mark, mName, mSimple, Deliver } from '@neep/core';

import B from './B';

const E = create((
	props: {  a?: any,  set?: () => void },
	{ childNodes, delivered },
	{ createElement, label },
) => {
	label('{E}', '#F00');
	return <Deliver a={delivered.a + 1}>
		<div>E: {delivered.a}</div>
		<B {...props}>
			{ childNodes }
		</B>
	</Deliver>;
});
export default mark(E, mName('E'), mSimple);
