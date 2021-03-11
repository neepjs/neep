import {
	Slots,
	IRenderer,
	SlotApi,
	Element,
} from '../types';
import {
	isElement,
	equal,
	isValue,
} from '../auxiliary';
import {
	Render,
	Template,
	ScopeSlot,
} from '../constant/tags';
import { isSimpleComponent } from '../is';
import { markRead, markChange } from '../install/monitorable';
import { objectTypeSymbol, objectTypeSymbolElement } from '../constant/symbols';

/**
 * 获取槽元素
 * @param renderer 渲染函数
 * @param children 子代
 * @param slots 槽列表
 * @param native 是否为原生组件
 * @returns 原生节点
 */
export function getSlots(
	renderer: IRenderer,
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
			nativeList.push(getSlots(renderer, it, list, native));
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
			if (isSimpleComponent(it.tag) && it.execed || it.tag === Template) {
				const list: Record<string | symbol, any[]>
				= Object.create(null);
				nativeList.push(getSlots(renderer, it.children, list, native));
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
			if (renderer.isNode(it)) {
				nativeList.push(it);
				continue;
			}
			if (!isElement(it)) {
				nativeList.push(it);
				continue;
			}
			if (it.tag !== Render && it.tag !== Template) {
				nativeList.push(it);
				continue;
			}
		}
		const slot = isElement(it) && it.slot || 'default';
		const el = isElement(it) ? {
			...it, slot: undefined,
			props: {...it.props, 'n:slot': undefined },
		} : it;
		if (slot in slots) {
			slots[slot].push(el);
		} else {
			slots[slot] = [el];
		}
	}
	return nativeList;
}

export function setSlot(
	slots: Slots,
	name: string,
	list?: any[],
): any[] | undefined {
	Reflect.defineProperty(slots, name, {
		get() {
			markRead(slots, name);
			return list;
		},
		enumerable: true,
		configurable: true,
	});
	markChange(slots, name);
	return list;
}
/**
 * 将槽子代设置到槽列表上
 * @param children 槽子代
 * @param slots 槽对象
 */
export function setSlots(
	children: {[key: string]: any[]},
	slots?: Slots,
	oldChildren?: {[key: string]: any[]},
): Slots {
	if (!slots) {
		const slots = Object.create(null);
		for (const k of Reflect.ownKeys(children) as string[]) {
			slots[k] = children[k];
		}
		return slots;
	}
	for (const name of Reflect.ownKeys(slots)) {
		if (name in children) { continue; }
		setSlot(slots, name as string);
	}
	if (!oldChildren) {
		for (const name of Reflect.ownKeys(children) as string[]) {
			const list = children[name];
			setSlot(slots, name, list);
		}
		return slots;
	}
	for (const name of Reflect.ownKeys(children) as string[]) {
		const list = children[name];
		if (equal(list, oldChildren[name])) { continue; }
		setSlot(slots, name, list);
	}
	return slots;
}

export function renderSlot(list: any[], argv: any): any[] {
	return list.map(it => {
		if (Array.isArray(it)) {
			return renderSlot(it, argv);
		}
		if (!isElement(it)) { return it; }
		if (it.tag !== Render) {
			return {
				...it,
				slot: undefined,
			} as Element;
		}
		const { children } = it;
		if (children?.length !== 1) { return children; }
		const [ render ] = children;
		if (isValue(render) || typeof render !== 'function') { return children; }
		return render(argv);
	});
}

function getSlot(slots: Slots, name: string, isSimple: boolean):  any[] | undefined {
	return isSimple || name in slots
		? slots[name]
		: setSlot(slots, name);
}

export function createSlotApi(
	slots: Slots,
	isSimple = false,
): SlotApi {
	function slotApi(name: string = 'default', argv = {}): Element {
		const list = getSlot(slots, name, isSimple);
		return {
			[objectTypeSymbol]: objectTypeSymbolElement,
			tag: ScopeSlot,
			children: list ? renderSlot(list, argv) : [],
			inserted: true,
			slot: name,
			isDefault: !list,
		};
	}
	slotApi.has = (name: string = 'default') => Boolean(getSlot(slots, name, isSimple));
	return slotApi;
}
