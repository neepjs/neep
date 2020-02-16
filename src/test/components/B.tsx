import { create, mark, mName } from '@neep/core';

const B = create((
	props: { a?: any,  set?: () => void},
	{slots},
	{ Template, Slot, createElement }
) => {
	return () => <Template>
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
