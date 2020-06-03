/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { create, mark, mName, Template, createElement, useValue, computed } from '@neep/core';

const Compute2 = create((
	props: {  a?: any, onset?: () => void },
	{ slots, delivered, emit },
) => {
	const a = useValue();
	const b = useValue();
	const c1 = useValue(() => computed(() => a + b));
	const c2 = useValue(() => computed(() => a.value + b.value));
	const c3 = useValue(() => computed(() => Number(a) + Number(b)));
	const c4 = useValue(() => computed(() => Number(a.value) + Number(b.value)));
	return <Template>
		计算
		<div><input value={a} />+<input value={b} />={c1}</div>
		<div><input value={a} />+<input value={b} />={c2}</div>
		<div><input value={a} />+<input value={b} />={c3}</div>
		<div><input value={a} />+<input value={b} />={c4}</div>
	</Template>;
});
export default mark(Compute2, mName('Compute2') );
