import { NeepElement, SlotFn, Slots, IRender } from '../type';
import { isElement, SlotRender, ScopeSlot, equal, Template } from '../auxiliary';
import {
	typeSymbol,
	objectTypeSymbol,
	objectTypeSymbolElement,
} from '../symbols';
import { isProduction } from '../constant';
import { isValue } from '../install';

/**
 * 获取槽元素
 * @param iRender 渲染函数
 * @param children 子代
 * @param slots 槽列表
 * @param native 是否为原生组件
 * @returns 原生节点
 */
export function getSlots(
	iRender: IRender,
	children: any[],
	slots: Record<string | symbol, any[]>,
	native = false,
): any[] {
	/** 原始对象 */
	const nativeList: any[] = [];
	for (const it of children) {
		if (Array.isArray(it)) {
			const list: Record<string | symbol, any[]>
				= Object.create(null);
			nativeList.push(getSlots(iRender, it, list, native));
			for (const k of Reflect.ownKeys(list) as string[]) {
				if (k in slots) {
					slots[k].push(list[k]);
				} else {
					slots[k] = [list[k]];
				}
			}
			continue;
		}
		if (isElement(it) && it.slot === undefined) {
			if (
				typeof it.tag === 'function'
				&& it.tag[typeSymbol] === 'simple'
				&& it.execed
				|| it.tag === Template
			) {
				const list: Record<string | symbol, any[]>
				= Object.create(null);
				nativeList.push(getSlots(iRender, it.children, list, native));
				for (const k of Reflect.ownKeys(list) as string[]) {
					const node = { ...it, children: list[k] };
					if (k in slots) {
						slots[k].push(node);
					} else {
						slots[k] = [node];
					}
				}
				continue;
			}
		}
		if (native) {
			if (iRender.isNode(it)) {
				nativeList.push(it);
				continue;
			}
			if (!isElement(it)) {
				nativeList.push(it);
				continue;
			}
			if (it.tag !== SlotRender && it.tag !== Template) {
				nativeList.push(it);
				continue;
			}
		}
		const slot = isElement(it) && it.slot || 'default';
		const el = isElement(it) ? {
			...it, slot: undefined,
			props: {...it.props, slot: undefined },
		} : it;
		if (slot in slots) {
			slots[slot].push(el);
		} else {
			slots[slot] = [el];
		}
	}
	return nativeList;
}
function renderSlots(
	list: any[],
	...props: any
): any[] {
	return list.map(it => {
		if (Array.isArray(it)) {
			return renderSlots(it, ...props);
		}
		if (!isElement(it)) { return it; }
		if (it.tag !== SlotRender) {
			return {
				...it,
				slot: undefined,
			} as NeepElement;
		}
		const { children } = it;
		if (children?.length !== 1) { return children; }
		const [ render ] = children;
		if (isValue(render) || typeof render !== 'function') { return children; }
		return render(...props);
	});
}
function createSlots(
	name: string,
	list: any[],
): SlotFn {
	const slot = (...props: any): NeepElement => ({
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag: ScopeSlot,
		children: renderSlots(list, ...props),
		inserted: true,
		label: isProduction ? undefined : [`[${ name }]`, '#00F'],
	} as NeepElement);
	slot.children = list;
	return slot;
}
/**
 * 将槽子代设置到槽列表上
 * @param children 槽子代
 * @param slots 槽对象
 */
export function setSlots(
	children: {[key: string]: any[]},
	slots: Slots = Object.create(null),
	oldChildren?: {[key: string]: any[]},
): Slots {
	for (const k of Reflect.ownKeys(slots)) {
		if (k in children) { continue; }
		delete slots[k as keyof Slots];
	}
	if (!oldChildren) {
		for (const k of Reflect.ownKeys(children) as string[]) {
			slots[k] = createSlots(k, children[k]);
		}
		return slots;
	}
	for (const k of Reflect.ownKeys(children) as string[]) {
		const list = children[k];
		if (equal(list, oldChildren[k])) { continue; }
		slots[k] = createSlots(k, list);
	}
	return slots;
}
