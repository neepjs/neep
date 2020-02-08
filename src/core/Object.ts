import { monitorable } from './install';
import { callHook } from './hook';
import { Exposed, MountedNode } from './type';

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
	private readonly _hooks: Map<any, Set<() => void>> = new Map();
	/**
	 * 设置钩子
	 * @param id 钩子名称
	 * @param hook 钩子函数
	 * @returns 用于取消钩子的函数
	 */
	setHook(id: any, hook: () => void): () => void {
		hook = monitorable.safeify(hook);
		const set = monitorable
			.getMepValue(this._hooks, id, () => new Set);
		set.add(hook);
		return () => set.delete(hook);
	}
	callHook(id: any): void {
		callHook(id, this);
		const list = this._hooks.get(id);
		if (!list) { return; }
		for (const hook of list) {
			hook();
		}
	}
}
