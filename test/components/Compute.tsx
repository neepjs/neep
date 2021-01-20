import Neep from '@neep/core';

export default Neep.createComponent((
	props: {  a?: any, onset?: () => void },
) => {
	const a = Neep.value(1);
	const b = Neep.value(2);
	// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
	const c1 = Neep.computed(() => a + b);
	const c2 = Neep.computed(() => a.value + b.value);
	const c3 = Neep.computed(() => Number(a) + Number(b));
	const c4 = Neep.computed(() => Number(a.value) + Number(b.value));
	return Neep.createRenderElement(() => <Neep.Template>
		计算
		<div><input value={a} />+<input value={b} />={c1}</div>
		<div><input value={a} />+<input value={b} />={c2}</div>
		<div><input value={a} />+<input value={b} />={c3}</div>
		<div><input value={a} />+<input value={b} />={c4}</div>
	</Neep.Template>);

}, {name: 'Compute'});
