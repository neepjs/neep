import {
	IRenderer,
	Ref,
	Entity,
} from '../../types';
import EventEmitter from '../../EventEmitter';
import BaseProxy from './BaseProxy';

function updateData(
	props: any,
	data: Record<string, any>,
): void {
	const oldKeys = new Set(Object.keys(data));
	for (const k in props) {
		if (k.substr(0, 5) !== 'data:') { continue; }
		const key = k.substr(5);
		if (!key) { continue; }
		oldKeys.delete(key);
		data[key] = props[key];
	}
	const dataset = props['n:data'];
	if (dataset && typeof dataset === 'object') {
		for (const key in dataset) {
			if (!key) { continue; }
			oldKeys.delete(key);
			data[key] = dataset[key];
		}
	}
	for (const key of oldKeys) {
		delete data[key];
	}
}


export default abstract class RefProxy<
	TExposed extends object | Function,
	TTag,
	TEntity extends Entity<any, any>,
> extends BaseProxy<TTag> {
	/** 组件暴露值 */
	private __exposed?: TExposed;
	/** 组件暴露值 */
	private __ref?: Ref<TExposed, TEntity>;
	get exposed(): TExposed | undefined { return this.__exposed; }
	setExposed(t?: TExposed): void {
		if (this.destroyed) { return; }
		const ref = this.__ref;
		if (typeof ref !== 'function') {
			this.__exposed = t;
			return;
		}
		const old = this.__exposed;
		this.__exposed = t;
		ref(t, old, this.entity);
	}
	readonly events: EventEmitter<TEntity>;
	/** 组件实体 */
	readonly entity: TEntity;

	readonly data: Record<string, any> = Object.create(null);

	constructor(
		renderer: IRenderer,
		originalTag: any,
		tag: any,
		attrs: any,
		parent?: BaseProxy<any>,
		delivered?: Record<any, any>,
	) {
		super(renderer, originalTag, tag, attrs, parent, delivered);

		updateData(attrs, this.data);
		const events = new EventEmitter<TEntity>();
		const entity = this.createEntity(events);
		events.target = entity;
		this.entity = entity;
		this.events = events;
		const ref = attrs['n:ref'];
		if (typeof ref === 'function') {
			this.__ref = ref;
			ref(undefined, undefined, entity, true);
		}
	}

	/** 创建 */
	protected abstract createEntity(events: EventEmitter<any>): TEntity;


	/** 更新属性及子代 */
	update(attrs: Record<string, any>, children: any[]): void {
		updateData(attrs, this.data);
		const ref = attrs['n:ref'];
		const oldRef = this.__ref;
		if (ref !== oldRef) {
			if (typeof ref === 'function') {
				ref(this.__exposed);
			} else if (oldRef) {
				this.__ref = undefined;
			}
		}
		super.update(attrs, children);
	}
	destroy(): boolean {
		if (!super.destroy()) { return false; }
		const ref = this.__ref;
		if (typeof ref !== 'function') { return true; }
		ref(undefined, this.__exposed, this.entity, false);
		return true;
	}
}
