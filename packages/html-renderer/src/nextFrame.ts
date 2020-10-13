let list: (() => void)[] | undefined;
export default function nextFrame(f: () => void): void {
	if (list) {
		list.push(f);
		return;
	}
	list = [f];
	window.requestAnimationFrame(() => {
		const fs = list;
		list = undefined;
		if (!fs) { return; }
		fs.forEach(f => f());
	});
}
