/* eslint-disable @typescript-eslint/restrict-plus-operands */
import Neep from '@neep/core';

export default Neep.createComponent(() => {
	const a = Neep.useValue();
	const b = Neep.useValue();
	const c1 = Neep.useValue(() => Neep.computed(() => a + b));
	const c2 = Neep.useValue(() => Neep.computed(() => a.value + b.value));
	const c3 = Neep.useValue(() => Neep.computed(() => Number(a) + Number(b)));
	const c4 = Neep.useValue(() => Neep.computed(() => Number(a.value) + Number(b.value)));
	return <Neep.Template>
		计算
		<div><input value={a} />+<input value={b} />={c1}</div>
		<div><input value={a} />+<input value={b} />={c2}</div>
		<div><input value={a} />+<input value={b} />={c3}</div>
		<div><input value={a} />+<input value={b} />={c4}</div>
	</Neep.Template>;
}, {name: 'Compute2'});
