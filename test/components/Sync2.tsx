import Neep from '@neep/core';

export default Neep.createComponent(() => {
	const inputValue = Neep.useValue();
	const checked = Neep.useValue();

	return <Neep.Template>
		同步的输入框及显示
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style="width: 100%" /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div>[{checked}]{inputValue}</div>
	</Neep.Template>;
}, { name: 'Sync2'});
