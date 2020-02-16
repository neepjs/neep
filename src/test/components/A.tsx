import { create, mark, mName } from '@neep/core';

import B from './B';

const A = create((
	props: { name?: string },
	{},
	{ value, createElement },
) => {
	const v = value(1);
	return () => <B a="1" set={() => v.value++ }>
			<b>你好</b>
			<i>{v()}</i>
			<u slot="name">{props.name}</u>
		</B>;
});
export default mark(A, mName('A'));
