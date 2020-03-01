import { callHook, Hooks } from '../hook';
import { Exposed } from '../type';
import { MountedNode } from './draw';
function createExposed(obj: NeepObject): Exposed {

	const cfg: { [K in keyof Exposed]:
		{ configurable: true, value: Exposed[K] }
		| { configurable: true, get(): Exposed[K] }
	} = {
		$component: { configurable: true, value: null },
		$isContainer: { configurable: true, value: false },
		$inited: { configurable: true, get: () => obj.inited },
		$destroyed: { configurable: true, get: () => obj.destroyed },
		$mounted: { configurable: true, get: () => obj.mounted },
		$unmounted: { configurable: true, get: () => obj.mounted },
	};
	const exposed: Exposed = Object.create(null, cfg);
	return exposed;
}

export default class NeepObject {
	/** 组件暴露值 */
	readonly exposed: Exposed = createExposed(this);
	inited: boolean = false;
	/** 是否销毁的 */
	destroyed: boolean = false;
	/** 是否已经挂载完毕 */
	mounted: boolean = false;
	unmounted: boolean = false;
	readonly children: Set<Exposed> = new Set();
	/** The subtree mounted on the parent node */
	tree: (MountedNode | MountedNode[])[] = [];

	callHook<H extends Hooks>(id: H): void;
	callHook(id: string): void;
	callHook(id: string): void {
		callHook(id, this.exposed);
	}
}
