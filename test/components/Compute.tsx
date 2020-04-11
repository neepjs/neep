import { create, mark, mName } from '@neep/core';

const Compute = create((
	props: {  a?: any, onset?: () => void },
	{ },
	{ Template, Slot, createElement, value, computed }
) => {
	const a = value(1);
	const b = value(2);
	const c1 = computed(() => a + b);
	const c2 = computed(() => a.value + b.value);
	const c3 = computed(() => Number(a) + Number(b));
	const c4 = computed(() => Number(a.value) + Number(b.value));
	return () => <Template>
		计算
		<div><input value={a} />+<input value={b} />={c1}</div>
		<div><input value={a} />+<input value={b} />={c2}</div>
		<div><input value={a} />+<input value={b} />={c3}</div>
		<div><input value={a} />+<input value={b} />={c4}</div>
	</Template>;
});
export default mark(Compute, mName('Compute'), );
