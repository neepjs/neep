import { create, mark, mName, mNative } from '@neep/core';
import Compute from './Compute';
import Compute2 from './Compute2';
import Sync from './Sync';
import Sync2 from './Sync2';

const B = create((
	props: {  a?: any, onset?: () => void },
	{ slots, delivered, emit },
	{ Template, Slot, createElement, useValue, hook }
) => {
	const inputValue = useValue();
	const checked = useValue();
	hook('beforeCreate', () => console.log('Hook', 'B', 'beforeCreate'), true);
	hook('created', () => console.log('Hook', 'B', 'created'), true);
	hook('beforeMount', () => console.log('Hook', 'B', 'beforeMount'), true);
	hook('mounted', () => console.log('Hook', 'B', 'mounted'), true);
	hook('beforeUpdate', () => console.log('Hook', 'B', 'beforeUpdate'), true);
	hook('updated', () => console.log('Hook', 'B', 'updated'), true);
	const ref = (x: any) => console.log('Ref', 'B', x);
	return <Template>
		<div>B: {delivered.a}</div>
		{slots.name?.()}
		<br />
		{slots.default?.()}
		<button onclick={props.onset}>[onclick]+1</button>
		<button on-click={props.onset}>[on-click]+1</button>
		<button {...{'@click': props.onset}}>[@click]+1</button>
		<button {...{'on:click': props.onset}}>[on:click]+1</button>
		<button {...{'@click': () => emit('set')}}>[@click=emit]+1</button>
		<br />
		<Slot />
		<Slot />
		<br />
		<Slot name="666">666</Slot>
		<br />
		<Slot name="name">name</Slot>
		<hr />
		<Sync />
		<hr />
		<Sync2 />
		<hr />
		<Compute />
		<hr />
		<Compute2 />
		<hr />
	</Template>;
});
export default mark(B, mName('B'), );
