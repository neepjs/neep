import { create, mark, mName } from '@neep/core';

const B = create((
	props: { a?: any,  set?: () => void},
	{ slots, delivered },
	{ Template, Slot, createElement, useValue }
) => {
	const v = useValue(() => Math.random());
	return <Template>
		<div>v: {v}</div>
		<div>B: {delivered.a}</div>
		{slots.name?.()}
		<br />
		{slots.default?.()}
		<button onclick={props.set}>+1</button>
		<br />
		<Slot />
		<br />
		<Slot name="666">666</Slot>
		<br />
		<Slot name="name">name</Slot>
	</Template>;
});
export default mark(B, mName('B'));
