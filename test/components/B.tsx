import { create, mark, mName, mNative } from '@neep/core';

const B = create((
	props: { a?: any,  set?: () => void},
	{ slots, delivered },
	{ Template, Slot, createElement, useValue, hook }
) => {
	const v = useValue();
	const checked = useValue();
	hook('beforeCreate', () => console.log('Hook', 'B', 'beforeCreate'), true);
	hook('created', () => console.log('Hook', 'B', 'created'), true);
	hook('beforeMount', () => console.log('Hook', 'B', 'beforeMount'), true);
	hook('mounted', () => console.log('Hook', 'B', 'mounted'), true);
	hook('beforeUpdate', () => console.log('Hook', 'B', 'beforeUpdate'), true);
	hook('updated', () => console.log('Hook', 'B', 'updated'), true);
	const ref = (x: any) => console.log('Ref', 'B', x);
	return <Template>
		两个同步的 checkbox
		<input type="checkbox" checked={checked} ref={ref} />
		<hr />
		<input type="checkbox" checked={checked} />
		<input value={v} />
		<input value={v} />
		<div ref={ref} >v: {v}</div>
		<div>B: {delivered.a}</div>
		{slots.name?.()}
		<br />
		{slots.default?.()}
		<button onclick={props.set}>+1</button>
		<br />
		<Slot />
		<Slot />
		<br />
		<Slot name="666">666</Slot>
		<br />
		<Slot name="name">name</Slot>
	</Template>;
});
export default mark(B, mName('B'), );
