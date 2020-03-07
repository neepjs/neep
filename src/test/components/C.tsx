import { create, mark, mName, mSimple } from '@neep/core';

import B from './B';

const C = create((
	props: {  a?: any,  set?: () => void },
	{ childNodes },
	{ createElement, label },
) => {
	label('{C}', '#F00');
	return <B {...props}> { childNodes } </B>;
});
export default mark(C, mName('C'), mSimple);
