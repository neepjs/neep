import { create, mark, mName, Template, createElement, value, computed } from '@neep/core';

const Compute = create((
	props: {  a?: any, onset?: () => void },
) => {
	const a = value(1);
	const b = value(2);
	// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
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
export default mark(Compute, mName('Compute') );
