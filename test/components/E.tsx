import { create, mark, mName, mSimple, Deliver, createElement, label  } from '@neep/core';

const E = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes, delivered },
) => {
	label('{E}', '#F00');
	return <Deliver a={delivered.a as number + 1}>
		<div>E: {delivered.a}</div>
		<tb {...props} {...{'@set': props.onset}}>
			{ childNodes }
		</tb>
	</Deliver>;
});
export default mark(E, mName('E'), mSimple);
