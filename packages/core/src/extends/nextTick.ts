import { ContainerProxy } from '../type';
import {printError } from '../install/monitorable';
import { nextFrame } from '../install/renderer';

let awaitDraw = new Set<ContainerProxy<any>>();

const rendererDraw = new Set<(() => void)>();
const baseTick: [number, () => void][] = [];
const middleTick: [number, () => void][] = [];
const endTick: [number, () => void][] = [];

function execTickList(list: [number, () => void][]): void {
	const execList = [...list].sort(([a], [b]) => b - a);
	list.length = 0;
	try {
		execList.forEach(([, f]) => f());
	} catch (e) {
		printError(e);
	}
}
function execContainerList(): void {
	const list = [...awaitDraw];
	awaitDraw.clear();
	list.map(c => c.drawAll());
}
function execRendererDrawList(): void {
	const rendererDrawList = [...rendererDraw];
	rendererDraw.clear();
	for (const f of rendererDrawList) {
		try {
			f();
		} catch (e) {
			printError(e);
		}
	}
}

let requested = false;
function request(): void {
	if (requested) { return; }
	requested = true;
	nextFrame(() => {
		requested = false;
		execTickList(baseTick);
		execContainerList();
		execTickList(middleTick);
		execRendererDrawList();
		execTickList(endTick);
	});
}

export default function nextTick(
	fn: () => void,
	level: number = 0,
	type?: 'middle' | 'end',
): void {
	const list = type === 'middle' ? middleTick
		: type === 'end' ? endTick : baseTick;
	list.push([level, fn]);
	request();
}

export function markDraw(c: ContainerProxy<any>): void {
	awaitDraw.add(c);
	request();
}

export function addRendererDraw(fn: () => void): void {
	rendererDraw.add(fn);
	request();
}
