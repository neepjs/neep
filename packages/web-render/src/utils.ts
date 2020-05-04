const tagRegex =
	/^[a-z][a-z0-9]*(?:-[a-z0-9]+)?(?::[a-z0-9]+(?:-[a-z0-9]+)?)?$/i;
export function isTagName(tag: any): boolean {
	if (typeof tag !== 'string') { return false; }
	return tagRegex.test(tag);
}
