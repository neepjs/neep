export type ModelInfo = [string, string, (e: any) => any];
export function getElementModel(el: Element): ModelInfo | undefined {
	if (el instanceof HTMLInputElement) {
		switch(el.type.toLowerCase()) {
			case 'checkbox':
			case 'radio':
			return [
				'checked', 'change',
				(e: any) => (e.currentTarget as HTMLInputElement).checked
			];
		}
		return [
			'value', 'input',
			(e: any) => (e.currentTarget as HTMLInputElement).value
		];
	}
	if (el instanceof HTMLSelectElement) {
		return [
			'value', 'select',
			(e: any) => (e.currentTarget as HTMLSelectElement).value
		];
	}
	return ;
}