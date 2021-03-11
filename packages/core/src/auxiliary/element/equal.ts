import isElement from './isElement';

export default function equal(a: any, b: any): boolean {
	if (Object.is(a, b)) { return true; }
	if (!a) { return false; }
	if (!b) { return false; }
	if (typeof a !== 'object') { return false; }
	if (typeof b !== 'object') { return false; }
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) { return false; }
		if (a.length !== b.length) { return false; }
		for (let i = a.length - 1; i >= 0; i--) {
			if (!equal(a[i], b[i])) { return false; }
		}
		return true;
	}
	if (Array.isArray(b)) { return false; }
	if (!isElement(a)) { return false; }
	if (!isElement(b)) { return false; }
	if (a.tag !== b.tag) { return false; }
	if (a.execed !== b.execed) { return false; }
	if (a.inserted !== b.inserted) { return false; }
	if (a.isDefault !== b.isDefault) { return false; }
	if (a.key !== b.key) { return false; }
	if (a.slot !== b.slot) { return false; }
	const aprops = a.props;
	const bprops = b.props;
	if (Object.is(aprops, bprops)) { return equal(a.children, b.children); }
	if (!aprops) { return false; }
	if (!bprops) { return false; }
	if (typeof aprops !== 'object') { return false; }
	if (typeof bprops !== 'object') { return false; }
	const aKeys = new Set(Object.keys(aprops));
	const bKeys = Object.keys(bprops);
	if (aKeys.size !== bKeys.length) { return false; }
	for (const k of bKeys) {
		if (!aKeys.has(k)) { return false; }
		if (aprops[k] !== bprops[k]) { return false; }
	}
	return equal(a.children, b.children);
}
