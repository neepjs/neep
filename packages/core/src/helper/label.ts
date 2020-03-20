let label: [string, string] | undefined;
export function setLabel(l: [string, string]) {
	label = l;
}

export function getLabel() {
	const l = label;
	label = undefined;
	return l;
}
