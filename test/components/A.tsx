import { create, mark, mName, mComponent, value, createElement, label, hook, Container, computed } from '@neep/core';

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

const A = create((
	props: { name?: string },
) => {
	const divIndex = value(6);
	const div = computed(() => divs[divIndex.value]);

	function moveDiv(): void {
		divIndex.value = (divIndex.value + 1) % (divs.length + 1);
	}

	label('{自定义标签文本}', '#F00');
	hook('beforeCreate', () => console.log('Hook', 'A', 'beforeCreate'));
	hook('created', () => console.log('Hook', 'A', 'created'));
	hook('beforeMount', () => console.log('Hook', 'A', 'beforeMount'));
	hook('mounted', () => console.log('Hook', 'A', 'mounted'));
	hook('beforeUpdate', () => console.log('Hook', 'A', 'beforeUpdate'));
	hook('updated', () => console.log('Hook', 'A', 'updated'));
	const v = value(1);
	const ref = (x: any): void => console.log('Ref', 'B', x);
	return () => <DeliverValue value={v}>
		<DeliverNumber value={v.value}>
			<Container target={div}>
				<button on-click={moveDiv}>移动</button>
			</Container>
			<tc a="1" onset={() => v.value++ } ref={ref}>
				<b ref={ref}>你好</b>
				<i ref={ref}>{v}</i>
				<u ref={ref} slot="name">{props.name}</u>
			</tc>
		</DeliverNumber>
	</DeliverValue>;
});

export default mark(A, mName('A'), mComponent('tc', C));
