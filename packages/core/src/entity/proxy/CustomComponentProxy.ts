import { TreeNodeList, Entity, ContextInfo, ContextData } from '../../types';
import { wait } from '../../extends/delayRefresh';
import { destroyUseData } from '../../extends/use';
import { destroyContextData } from '../../extends/with';
import convert, { destroy } from '../convert';
import BaseProxy from './BaseProxy';
import RefProxy from './RefProxy';
import ComponentProxy from './ComponentProxy';


function createInfo(
	obj: CustomComponentProxy<any, any, any>,
): ContextInfo {
	const cfg: { [K in keyof ContextInfo]:
		{ configurable: true, value: ContextInfo[K], writable?: boolean }
		| { configurable: true, get(): ContextInfo[K] }
	} = {
		created: { configurable: true, get: () => obj.created },
		destroyed: { configurable: true, get: () => obj.destroyed },
		mounted: { configurable: true, get: () => obj.mounted },
		unmounted: { configurable: true, get: () => obj.unmounted },
	};
	return Object.create(null, cfg);
}
export default abstract class CustomComponentProxy<
	TExposed extends object | Function,
	TTag,
	TEntity extends Entity<any, any>,
> extends RefProxy<TExposed, TTag, TEntity> {
	readonly contextData: ContextData;
	/** 父组件代理 */
	readonly parentComponentProxy?: ComponentProxy<any, any, any, any>;

	/** 子组件 */
	readonly children: Set<ComponentProxy<any, any, any, any>> = new Set();

	constructor(
		originalTag: any,
		tag: any,
		attrs: any,
		parent: BaseProxy<any>,
		isShell: boolean,
	) {
		super(parent.renderer, originalTag, tag, attrs, parent);
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const _this = this;
		this.parentComponentProxy = parent.componentRoot;
		const parentEntity = parent.componentRoot?.entity;
		this.contextData = {
			isShell,
			isSimple: false,
			get created() { return _this.created; },
			get destroyed() { return _this.destroyed; },
			delivered: this.delivered,
			withData: {},
			info: isShell ? undefined : createInfo(this),
			hooks: isShell ? undefined : {},
			useData: isShell ? undefined : [],
			refresh: this.refresh.bind(this),
			parent: parentEntity,
			getChildren: () => [...this.children].map(t => t.exposed),
		};
	}
	/** 结果渲染函数 */
	protected abstract get _render(): () => any[];
	/** 结果渲染函数 */
	protected abstract get _stopRender(): () => void;

	/** 是否为刷新中 */
	private __refreshing = false;
	/** 是否需要继续刷新 */
	private __needRefresh = false;
	get needRefresh(): boolean { return this.__needRefresh; }

	/** 延时刷新计数 */
	private __delayedRefresh = 0;
	/** 渲染结果 */
	protected _nodes: TreeNodeList = [];

	refresh(): void;
	refresh<T>(f: () => T): T;
	refresh<T>(f?: () =>  T): T | void;
	refresh<T>(f?: () =>  T): T | void {
		if (typeof f === 'function') {
			try {
				this.__delayedRefresh++;
				return f();
			} finally {
				this.__delayedRefresh--;
				if (this.__delayedRefresh <= 0) {
					this.refresh();
				}
			}
		}
		if (this.destroyed) { return; }
		this.__needRefresh = true;
		if (!this.created) { return; }

		if (this.__refreshing) { return; }
		this.__refreshing = true;

		let nodes: any[] | undefined;
		for (;;) {
			if (wait(this)) { break; }
			if (this.__delayedRefresh) { break; }
			if (!this.__needRefresh) { break; }
			this.__needRefresh = false;
			nodes = this._render();
			if (this.destroyed) { return; }
		}
		this.__refreshing = false;
		if (this.destroyed) { return; }
		if (this.__delayedRefresh) { return; }
		if (!nodes) { return; }
		if (wait(this)) { return; }

		this._nodes = convert(this, nodes, this._nodes);
		if (!this.mounted) { return; }
		if (this.unmounted) { return; }
		this.requestDraw();
	}
	_destroy(): void {
		this._stopRender();
		const { contextData } = this;
		destroyContextData(contextData.withData);
		destroyUseData(contextData.useData);
		destroy(this._nodes);
	}


}
