import { create, mark, mName, mComponent } from '@neep/core';

import C from './C';

const A = create((
	props: { name?: string },
	{},
	{ value, createElement, label, deliver, hook },
) => {
	label('{自定义标签文本}', '#F00');
	hook('beforeCreate', () => console.log('Hook', 'A', 'beforeCreate'));
	hook('created', () => console.log('Hook', 'A', 'created'));
	hook('beforeMount', () => console.log('Hook', 'A', 'beforeMount'));
	hook('mounted', () => console.log('Hook', 'A', 'mounted'));
	hook('beforeUpdate', () => console.log('Hook', 'A', 'beforeUpdate'));
	hook('updated', () => console.log('Hook', 'A', 'updated'));
	const v = value(1);
	deliver('a', v, true);
	const ref = (x: any) => console.log('Ref', 'B', x);
	return () => <tc a="1" onset={() => v.value++ } ref={ref}>
			<b ref={ref}>你好</b>
			<i ref={ref}>{v()}</i>
			<u ref={ref} slot="name">{props.name}</u>
		</tc>;
});

export default mark(A, mName('A'), mComponent('tc', C));
