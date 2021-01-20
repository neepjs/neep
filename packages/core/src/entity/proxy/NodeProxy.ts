import BaseProxy from './BaseProxy';
import { ContainerProxy } from '../../exports';
import ComponentProxy from './ComponentProxy';

export default abstract class NodeProxy<
	TTag,
> extends BaseProxy<TTag> {
	/** 所属容器 */
	readonly container: ContainerProxy<any>;
	/** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
	readonly componentRoot?: ComponentProxy<any, any, any, any>;

	constructor(
		originalTag: any,
		tag: TTag,
		attrs: Record<string, any>,
		children: any[],
		parent: BaseProxy<any>,
		delivered?: Record<any, any>,
	) {
		super(
			parent.renderer,
			originalTag,
			tag,
			attrs,
			parent,
			delivered,
		);
		this.container = parent.container;
		this.componentRoot = parent.componentRoot;
	}

	requestDraw(): void {
		if (!this.mounted) { return; }
		if (this.destroyed) { return; }
		this.container.markDraw(this);
	}
	callHook(id: string): void {
	}
}
