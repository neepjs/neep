import { create, mark, mName, mSimple } from '@neep/core';

import E from './E';

const D = create((
	props: {  a?: any, onset?: () => void },
	{ childNodes },
	{ createElement, label },
) => {
	label('{D}', '#F00');
	return <E {...props}>
			{ childNodes }
		</E>;
});
export default mark(D, mName('D'), mSimple);
