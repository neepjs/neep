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

export function setAttrs(el: Element, attrs: Record<string, string | null>) {
	if (el instanceof HTMLInputElement && 'checked' in attrs) {

		switch(el.type.toLowerCase()) {
			case 'checkbox':
			case 'radio':
				if ((attrs.checked !== null) !== el.checked) {
					el.checked = attrs.checked !== null;
				}
		}
	}

	if ((el instanceof HTMLSelectElement || el instanceof HTMLInputElement) && 'value' in attrs) {
		const value = attrs.value || '';
		if (el.value !== value) {
			el.value = value;
		}
	}

}