import Neep from '@neep/core';

export default Neep.createComponent((
	props: {  a?: any, onset?: () => void },
) => {
	const inputValue = Neep.value('');
	const checked = Neep.value(false);
	const ref = (x: any): void => console.log('Ref', 'B', x);
	return Neep.createRenderElement(() => <Neep.Template>
		同步的输入框及显示
		<div><input ref={ref} type="checkbox" checked={checked} /><input value={inputValue} style="width: 100%" /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div><input type="checkbox" checked={checked} /><input value={inputValue} style={{width: '100%'}} /></div>
		<div ref={ref}>[{checked}]{inputValue}</div>
	</Neep.Template>);
}, { name: 'Sync'});
