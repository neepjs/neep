import { NeepNode } from '@neep/core';
import { VTreeNode, Type } from '../tree';
import { TextNode } from './Text';
import { createElement, encase } from '../install/neep';

interface Options {
	value?: boolean;
	tag?: boolean;
	placeholder?: boolean;
	simple?: boolean;
	container?: boolean;
	template?: boolean;
	scopeSlot?: boolean;
	slotRender?: boolean;
	deliver?: boolean;
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
	deliver = false,
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
		deliver,
	};
}
function createTag(
	name: any,
	keys: {[key: number]: boolean},
	id: number,
	key: any,
	labels: ([string, string] | undefined)[],
	...children: any[]
): NeepNode {
	const opened = keys[id];
	const hasChildren = Boolean(children.length);
	return <div key={id} style="
		position: relative;
		min-height: 20px;
		font-size: 14px;
		line-height: 20px;
	">
		{children.length && <div
			style="
				position: absolute;
				left: -20px;
				top: 0;
				width: 20px;
				height: 20px;
				text-align: center;
				cursor: pointer;
				background: #DDD;;
			"
			onclick={() => keys[id] = !opened}
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
			{hasChildren ? '>' : ' />'}
			{hasChildren && !opened && <span>
				<span
					onclick={() => keys[id] = true}
					style="cursor: pointer;"
				>...</span>
				{'</'}{name}{'>'}
			</span>}
			{hasChildren && (labels as [string, string][])
				.filter(Boolean).map(([v, color]) => <span
					style={`color: ${color || '#000'}`}
				>
					{v}
				</span>)}
		</div>
		{hasChildren && opened && <div style="padding-left: 20px">
			{children}
		</div>}
		{opened && hasChildren && <div>{'</'}{name}{'>'}</div>}
	</div>;
}
function *getList(
	list: VTreeNode | VTreeNode[],
	keys: {[key: number]: boolean},
	options: Options,
	labels: ([string, string] | undefined)[] = [],
): Iterable<NeepNode> {
	if (Array.isArray(list)) {
		for (const it of list) {
			yield* getList(it, keys, options, labels);
		}
		return;
	}
	const {
		id,
		type,
		tag,
		children,
		props,
		key,
		label,
		value,
		isNative,
	} = list;
	if (type === Type.standard || type === Type.native) {
		return yield createTag(
			<span style="font-weight: bold;">{tag}</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (type === Type.tag) {
		if (!options.tag) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			tag,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (type === Type.simple) {
		if (!options.simple) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			<span style="
				font-style: italic;
				font-weight: bold;
			">{tag}</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (type === Type.placeholder) {
		if (!options.placeholder) { return; }
		return yield createTag(
			<span style="font-style: italic;">placeholder</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (type === Type.container) {
		if (!options.container) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			<span style="font-style: italic;">container</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	const ltag = tag.toLowerCase();
	if (ltag === 'neep:deliver') {
		if (!options.deliver) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			<span style="font-style: italic;">Deliver</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (ltag === 'template') {
		if (!options.template) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			<span style="font-style: italic;">Template</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (ltag === 'neep:scopeslot' || ltag === 'neep:scope-slot') {
		if (!options.scopeSlot) {
			return yield* getList(children, keys, options, [label, ...labels]);
		}
		return yield createTag(
			<span style="font-style: italic;">ScopeSlot</span>,
			keys, id, key, [label, ...labels],
			...getList(children, keys, options)
		);
	}
	if (ltag === 'neep:slotrender' || ltag === 'neep:slot-render') {
		if (options.slotRender) {

		}
		return;
	}
	if (ltag === 'neep:value') {
		if (!options.tag) { return; }
		if (!options.value) { return; }
		return yield <TextNode isNative={isNative} value={value} />;
	}
}
export default (props: any) => {
	const keys = encase<{[key: number]: boolean}>({});
	return () => <div style="padding-left: 20px;">
		{[...getList(props.tree, keys, getOptions(props))]}
	</div>;
};
