import { createElement, NeepNode } from '@neep/core';
import { Neep } from '../install';
import { Template } from 'packages/core/core';

export function getValue(
	value: any,
): NeepNode {
	const type = typeof value;
	if (type === 'function') {
		return <span style="font-weight: bold;">[Function]</span>;
	}
	if (type === 'string') {
		return <span>{value}</span>;
	}
	if (
		type === 'bigint'
		|| type === 'boolean'
		|| type === 'number'
		|| type === 'symbol'
		|| type === 'undefined'
		|| value === null
	) {
		return <span style="font-style: italic;">{String(value)}</span>;
	} else if (value instanceof RegExp) {
		return <span style="font-weight: bold;">{String(value)}</span>;
	} else if (value instanceof Date) {
		return <span style="font-weight: bold;">{value.toISOString()}</span>;
	} else if (type === 'object') {
		return <span style="font-style: italic;">{String(value)}</span>;
	}
	return null;
}

export function TextNode(
	{ isNative, value }: { isNative?: boolean; value?: any },
): NeepNode {
	if (isNative) {
		return <span style="font-weight: bold;">[Native]</span>;
	}
	const isValue = Neep.isValue(value);
	const data = isValue ? value() : value;
	if (!Neep.isValue(value)) {
		return getValue(data);
	}
	return <template>
		<span style="font-weight: bold;">[Value:&nbsp;</span>
		{getValue(data)}
		<span style="font-weight: bold;">&nbsp;]</span>
	</template>;
}
