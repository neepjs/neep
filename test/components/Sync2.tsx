import { create, mark, mName, Template, createElement, useValue } from '@neep/core';

const Sync2 = create(() => {
	const inputValue = useValue();
	const checked = useValue();

	return <Template>
		同步的输入框及显示
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style="width: 100%" /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div>[{checked}]{inputValue}</div>
	</Template>;
});
export default mark(Sync2, mName('Sync2') );
