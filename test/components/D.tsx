import { create, mark, mName, mSimple, createElement, label } from '@neep/core';

import E from './E';

const D = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes },
) => {
	label('{D}', '#F00');
	return <E {...props}>
		{ childNodes }
	</E>;
});
export default mark(D, mName('D'), mSimple);
