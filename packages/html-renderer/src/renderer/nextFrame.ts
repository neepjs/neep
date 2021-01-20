export default function nextFrame(f: () => void): void {
	window.requestAnimationFrame(f);
}
