import {
	IRenderer,
	MountedNode,
	HookName,
	Label,
	MountOptions,
} from '../../types';
import { isProduction } from '../../constant/info';
import ContainerProxy from './ContainerProxy';
import { exec, defineProperty } from '../../install/monitorable';
import ComponentProxy from './ComponentProxy';

let completeList: (() => void)[] | undefined;
export function setCompleteList(list?: (() => void)[]): void {
	completeList = list;
}
export function complete(it: () => void): void {
	if (!completeList) {
		it();
	} else {
		completeList.push(it);
	}
}


export default abstract class BaseProxy<TTag> {
	readonly tag: TTag;
	attrs: Record<string, any>;
	readonly renderer: IRenderer;

	labels?: Label[];
	/** 父组件 */
	readonly parentProxy?: BaseProxy<any>;
	/** 呈递值 */
	readonly delivered: Record<any, any>;
	/** 状态 */
	created: boolean = false;
	destroyed: boolean = false;
	mounted: boolean = false;
	unmounted: boolean = false;
	/** The subtree mounted on the parent node */
	tree: (MountedNode | MountedNode[])[] = [];
	/** 所属容器 */
	abstract readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	abstract readonly componentRoot?: ComponentProxy<any, any, any, any>;

	abstract get content():  (MountedNode | MountedNode[])[];
	readonly originalTag: any;


	constructor(
		renderer: IRenderer,
		originalTag: any,
		tag: any,
		attrs: any,
		parent?: BaseProxy<any>,
		delivered?: Record<any, any>,
	) {
		this.originalTag = originalTag;
		this.tag = tag;
		this.renderer = renderer;
		this.attrs = attrs;

		this.parentProxy = parent;
		this.delivered = delivered || parent?.delivered || Object.create(null);
		if (!isProduction) { defineProperty(this, 'tree', []); }
	}


	/** 请求绘制 */
	protected abstract requestDraw(): void;

	abstract callHook<H extends HookName>(id: H): void;
	abstract callHook(id: string): void;

	/** 更新属性及子代 */
	abstract _update(props: object, children: any[]): void;
	/** 更新属性及子代 */
	update(attrs: Record<string, any>, children: any[]): void {
		this.attrs = attrs;
		this._update(attrs, children);
	}


	private __executed_destroy = false;
	protected abstract _destroy(): void;
	destroy(): boolean {
		if (this.__executed_destroy) { return false; }
		this.__executed_destroy = true;
		this.callHook('beforeDestroy');
		this._destroy();
		this.callHook('destroyed');
		this.destroyed = true;
		return true;
	}


	private __mountOptions: MountOptions | null = null;
	protected abstract _mount(mountOptions: MountOptions): MountOptions | void;
	private __cancelDrawMonitor?: () => void;
	mount(mountOptions: MountOptions): boolean {
		if (this.__executed_destroy) { return false; }
		if (!mountOptions) { return false; }
		if (this.__mountOptions) { return false; }
		this.__mountOptions = mountOptions;
		this.callHook('beforeMount');
		const result = exec(
			c => c && this.requestDraw(),
			() => {
				const newMountOptions = this._mount(mountOptions);
				this.__mountOptions = newMountOptions || mountOptions;
				this.mounted = true;
			},
		);
		this.__cancelDrawMonitor = result.stop;
		complete(() => this.callHook('mounted'));
		return true;
	}

	private __executed_unmounted = false;
	protected abstract _unmount(): void;
	unmount(): boolean {
		if (!this.mounted) { return false; }
		if (this.__executed_unmounted) { return false; }
		this.__executed_unmounted = true;
		this.callHook('beforeUnmount');
		this._unmount();
		this.callHook('unmounted');
		this.unmounted = true;
		return true;
	}

	protected abstract _redraw(mountOptions: MountOptions): void;
	redraw(): void {
		if (this.__executed_destroy) { return; }
		if (!this.mounted) { return; }
		const mountOptions = this.__mountOptions;
		if (!mountOptions) { return; }
		if (this.__cancelDrawMonitor) {
			this.__cancelDrawMonitor();
		}
		this.callHook('beforeDraw');
		const result = exec(
			c => c && this.requestDraw(),
			() => this._redraw(mountOptions),
		);
		this.__cancelDrawMonitor = result.stop;

		complete(() => this.callHook('drawn'));
	}
}
