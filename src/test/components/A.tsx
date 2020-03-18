import { create, mark, mName } from '@neep/core';

import C from './C';

const A = create((
	props: { name?: string },
	{},
	{ value, createElement, label, deliver },
) => {
	label('{自定义标签文本}', '#F00');
	const v = value(1);
	deliver('a', v, true);
	return () => <C a="1" set={() => v.value++ }>
			<b>你好</b>
			<i>{v()}</i>
			<u slot="name">{props.name}</u>
		</C>;
});
export default mark(A, mName('A'));
