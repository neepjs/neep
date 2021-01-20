import Neep from '@neep/core';

import E from './E';

export default Neep.createShellComponent((
	props: {  a?: any, onset?: () => void },
	{ childNodes },
) => {
	Neep.label('{D}', '#F00');
	return <E {...props}>
		{ childNodes }
	</E>;
}, {name: 'D'});
