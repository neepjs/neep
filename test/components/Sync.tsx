import { create, mark, mName, Template, createElement, value } from '@neep/core';

const Sync = create((
	props: {  a?: any, onset?: () => void },
) => {
	const inputValue = value('');
	const checked = value(false);
	const ref = (x: any): void => console.log('Ref', 'B', x);
	return () => <Template>
		同步的输入框及显示
		<div><input ref={ref} type="checkbox" checked={checked} /><input value={inputValue} style="width: 100%" /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div ref={ref}>[{checked}]{inputValue}</div>
	</Template>;
});
export default mark(Sync, mName('Sync') );
