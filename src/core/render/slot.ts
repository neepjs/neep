import { NeepElement, SlotFn, Slots, IRender } from '../type';
import { isElement, Tags } from '../auxiliary';
import { isElementSymbol } from '../symbols';
import { isProduction } from '../constant';


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
		if (native) {
			if (iRender.isNode(it)) {
				nativeList.push(it);
				continue;
			}
			if (!isElement(it)) {
				nativeList.push(it);
				continue;
			}
			if (it.tag !== Tags.SlotRender) {
				nativeList.push(it);
				continue;
			}
		}
		let slot = isElement(it) && it.slot || 'default';
		if (slot in slots) {
			slots[slot].push(it);
		} else {
			slots[slot] = [it];
		}
	}
	return nativeList;
}
function renderSlots(
	iRender: IRender,
	list: any[],
	...props: any
): any[] {
	return list.map(it => {
		if (Array.isArray(it)) {
			return renderSlots(iRender, it, ...props);
		}
		if (!isElement(it)) { return it; }
		if (it.tag !== Tags.SlotRender) {
			return {
				...it,
				slot: undefined,
			} as NeepElement; 
		}
		if (typeof it.render === 'function') {
			return it.render(...props);
		}
		return it.children; 
	});
}
function createSlots(
	iRender: IRender,
	name: string,
	list: any[],
): SlotFn {
	const slot = (...props: any) => ({
		[isElementSymbol]: true,
		tag: Tags.ScopeSlot,
		children: renderSlots(iRender, list, ...props),
		inserted: true,
		label: isProduction ? undefined : [`[${name}]`, '#00F'],
	} as NeepElement);
	slot.children = list;
	return slot;
}
export function setSlots(
	iRender: IRender,
	children: {[key: string]: any[]},
	slots: Slots = Object.create(null),
) {
	for (const k of Reflect.ownKeys(slots)) {
		if (!(k in children)) {
			delete slots[k as string];
		}
	}
	for (const k of Reflect.ownKeys(children) as string[]) {
		slots[k] = createSlots(iRender, k, children[k]);
	}
	return slots;
}
