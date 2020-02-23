import { callHook, Hooks } from './hook';
import { Exposed } from './type';
import { MountedNode } from './draw';

export default class NeepObject {

	/** 组件暴露值 */
	readonly exposed: Exposed = Object.create(null);
	protected _inited: boolean = false;
	get inited(): boolean { return this._inited; };
	/** 是否已经挂载完毕 */
	protected _mounted: boolean = false;
	get mounted(): boolean { return this._mounted; };
	/** 是否销毁的 */
	protected _destroyed: boolean = false;
	get destroyed(): boolean { return this._destroyed; };
	readonly children: Set<Exposed> = new Set();
	/** 组件树结构 */
	protected _tree: (MountedNode | MountedNode[])[] = [];
	/** The subtree mounted on the parent node */
	get tree() { return this._tree; }

	callHook<H extends Hooks>(id: H): void;
	callHook(id: string): void;
	callHook(id: string): void {
		callHook(id, this.exposed);
	}
}
