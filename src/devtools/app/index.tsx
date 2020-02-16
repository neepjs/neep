import { getProxy } from 'monitorable';
import { create, createElement, NeepNode, Template, ScopeSlot, SlotRender, Value } from '@neep/core';
import { VTreeNode, Type } from '../tree';

interface Options {
	value?: boolean;
	tag?: boolean;
	placeholder?: boolean;
	simple?: boolean;
	container?: boolean;
	template?: boolean;
	scopeSlot?: boolean;
	slotRender?: boolean;
}
function getOptions({
	value = false,
	tag = false,
	placeholder = false,
	simple = false,
	container = false,
	template = false,
	scopeSlot = false,
	slotRender = false,
}: Options): Options {
	return {
		value,
		tag,
		placeholder,
		simple,
		container,
		template,
		scopeSlot,
		slotRender,
	};
}
function createTag(
	name: any,
	keys: {[key: number]: boolean},
	id: number,
	key: any,
	labels: (string | undefined)[],
	...children: any[]
): NeepNode {
	const opened = keys[id];
	return <div key={id} style="
		padding: 0 0 0 20px;
		position: relative;
		min-height: 20px;
		font-size: 14px;
		line-height: 20px;
	">
		{children.length && <div
			style="
				position: absolute;
				left: 0;
				top: 0;
				width: 20px;
				heigth: 20px;
				text-align: center;
				cursor: pointer;
				background: #DDD;;
			"
			onClick={() => keys[id] = !opened}
		>{opened ? '-' : '+'}</div> || undefined}
		<div>
			{'<'}{name}
			{ typeof key === 'string' ? ` key="${key}"`
			: typeof key === 'number' ? ` key=${key}`
			: typeof key === 'boolean' ? ` key=${key}`
			: typeof key === 'bigint' ? ` key=${key}`
			: typeof key === 'symbol' ? ` key=${String(key)}`
			: key === null ? ` key=${key}`
			: key !== undefined && ` key={${String(key)}}`
		}
			{children.length ? '>' : ' />'}

			{children.length && !opened && <span>
				<span
					onClick={() => keys[id] = true}
					style="cursor: pointer;"
				>...</span>
				{'</'}{name}{'>'}
			</span> || undefined}
		</div>
		{children.length && opened && children ||  undefined}
		{opened && children.length && <span>
			{'</'}{name}{'>'}
		</span> || undefined}
	</div>;
}
function *getList(
	list: VTreeNode | VTreeNode[],
	keys: {[key: number]: boolean},
	options: Options,
	labels: (string | undefined)[] = [],
): Iterable<NeepNode> {
	if (Array.isArray(list)) {
		for (const it of list) {
			yield* getList(it, keys, options, labels);
		}
		return;
	}
	const { id, type, tag, children, props, key, label } = list;
	if (type === Type.standard || type === Type.native) {
		yield createTag(
			<span style="font-weight: bold;">{tag}</span>,
			keys, id, key, [...labels, label],
			...getList(children, keys, options)
		);
		
		return;
	}
	if (type === Type.tag) {
		if (options.tag) {
			yield createTag(
				tag,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
		}
		return;
	}
	if (type === Type.simple) {
		if (options.simple) {
			yield createTag(
				<span style="
					font-style: italic;
					font-weight: bold;
				">{tag}</span>,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
		} else {
			yield* getList(children, keys, options, [...labels, label]);
		}
		return;
	}
	if (type === Type.placeholder) {
		if (options.placeholder) {
			yield createTag(
				<span style="font-style: italic;">placeholder</span>,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
		}
		return;
	}
	if (type === Type.container) {
		if (options.container) {
			yield createTag(
				<span style="font-style: italic;">container</span>,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
			
		} else {
			yield* getList(children, keys, options, [...labels, label]);
		}
		return;
	}
	if (tag === Template) {
		if (options.template) {
			yield createTag(
				<span style="font-style: italic;">Template</span>,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
			
		} else {
			yield* getList(children, keys, options, [...labels, label]);
		}
		return;
	}
	if (tag === ScopeSlot) {
		if (options.scopeSlot) {
			yield createTag(
				<span style="font-style: italic;">ScopeSlot</span>,
				keys, id, key, [...labels, label],
				...getList(children, keys, options)
			);
			
		} else {
			yield* getList(children, keys, options, [...labels, label]);
		}
		return;
	}
	if (tag === SlotRender) {
		if (options.slotRender) {
			
		}
		return;
	}
	if (tag === Value) {
		if (options.value) {
			
		}
		return;
	}
}
export default create((props: any) => {
	const keys = getProxy<{[key: number]: boolean}>({});
	return () => [...getList(props.tree, keys, getOptions(props))];
});
