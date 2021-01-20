import Neep from '@neep/core';
import Compute from './Compute';
import Compute2 from './Compute2';
import Sync from './Sync';
import Sync2 from './Sync2';
import { DeliverValue, DeliverNumber } from './delivers';

export default Neep.createComponent((
	props: {  a?: any, onset?: () => void },
	{ slot, delivered, emit },
) => {
	Neep.hook('beforeCreate', () => console.log('Hook', 'B', 'beforeCreate'), true);
	Neep.hook('created', () => console.log('Hook', 'B', 'created'), true);
	Neep.hook('beforeMount', () => console.log('Hook', 'B', 'beforeMount'), true);
	Neep.hook('mounted', () => console.log('Hook', 'B', 'mounted'), true);
	Neep.hook('beforeUpdate', () => console.log('Hook', 'B', 'beforeUpdate'), true);
	Neep.hook('updated', () => console.log('Hook', 'B', 'updated'), true);
	const a = delivered(DeliverValue);
	return <Neep.Template>
		<div>B: {a}|{delivered(DeliverNumber)}</div>
		{slot('name')}
		<br />
		{slot()}
		<button onclick={props.onset}>[onclick]+1</button>
		<button on-click={props.onset}>[on-click]+1</button>
		<button {...{'@click': props.onset}}>[@click]+1</button>
		<button {...{'on:click': props.onset}}>[on:click]+1</button>
		<button {...{'@click': () => emit('set')}}>[@click=emit]+1</button>
		<br />
		<Neep.Slot />
		<Neep.Slot />
		<br />
		<Neep.Slot name="666">666</Neep.Slot>
		<br />
		<Neep.Slot name="name">name</Neep.Slot>
		<hr />
		<Sync />
		<hr />
		<Sync2 />
		<hr />
		<Compute />
		<hr />
		<Compute2 />
		<hr />
	</Neep.Template>;
}, { name: 'B'});
