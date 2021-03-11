import Neep from '@neep/core';

import C from './C';
import { DeliverValue, DeliverNumber } from './delivers';

function createItem(bg: string): HTMLDivElement {
	const div = document.createElement('div');
	div.style.minHeight = '40px';
	div.style.background = bg;
	document.body.appendChild(div);
	return div;
}
const divs = [
	createItem('#F00'),
	createItem('#FF0'),
	createItem('#F0F'),
	createItem('#0F0'),
	createItem('#0FF'),
	createItem('#00F'),
];

export default Neep.createComponent((
	props: { name?: string },
) => {
	const divIndex = Neep.value(6);
	const div = Neep.computed(() => divs[divIndex.value]);

	function moveDiv(): void {
		divIndex.value = (divIndex.value + 1) % (divs.length + 1);
	}

	Neep.withLabel('{自定义标签文本}', '#F00');
	Neep.withHook('beforeCreate', () => console.log('Hook', 'A', 'beforeCreate'));
	Neep.withHook('created', () => console.log('Hook', 'A', 'created'));
	Neep.withHook('beforeMount', () => console.log('Hook', 'A', 'beforeMount'));
	Neep.withHook('mounted', () => console.log('Hook', 'A', 'mounted'));
	Neep.withHook('beforeUpdate', () => console.log('Hook', 'A', 'beforeUpdate'));
	Neep.withHook('updated', () => console.log('Hook', 'A', 'updated'));
	const v = Neep.value(1);
	const ref = (x: any): void => console.log('Ref', 'B', x);
	return Neep.createRenderElement(() => <DeliverValue value={v}>
		<DeliverNumber value={v.value}>
			<Neep.Container target={div}>
				<button on-click={moveDiv}>移动</button>
			</Neep.Container>
			<tc a="1" onset={() => v.value++ } ref={ref}>
				<b ref={ref}>你好</b>
				<i ref={ref}>{v}</i>
				<u ref={ref} slot="name">{props.name}</u>
			</tc>
		</DeliverNumber>
	</DeliverValue>);
}, {
	name: 'A',
	components: {tc: C},
});
