let label: [string, string] | undefined;
export function setLabel(l: [string, string]): void {
	label = l;
}

export function getLabel(): typeof label {
	const l = label;
	label = undefined;
	return l;
}
