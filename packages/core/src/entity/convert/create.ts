import { NeepNode, TreeNode, Delivered } from '../../type';
import { getRender } from '../../install';
import { typeSymbol } from '../../symbols';
import { recursive2iterable } from '../recursive';
import EntityObject from '../EntityObject';
import ComponentEntity from '../ComponentEntity';
import ContainerEntity from '../ContainerEntity';
import { updateProps } from '../props';
import { toElement } from './utils';

export function createItem(
	nObject: EntityObject,
	delivered: Delivered,
	source: NeepNode,
): TreeNode {
	if (!source) { return {
		tag: null,
		key: undefined,
		children: [],
	}; }
	const { tag } = source;
	if (!tag) { return {
		tag: null,
		key: undefined,
		children: [],
	}; }
	if (typeof tag !== 'string') {
		if (tag[typeSymbol] === 'simple') {
			return {
				...source,
				children: createAll(
					nObject,
					delivered,
					source.children,
				),
				component: undefined,
			};
		}
		return {
			...source, children: [],
			component: new ComponentEntity(
				tag,
				source.props || {},
				source.children,
				nObject,
				delivered,
			),
		};
	}
	const ltag = tag.toLowerCase();
	if (ltag === 'neep:container') {
		const type = source?.props?.type;
		const iRender = type ? getRender(type) : nObject.iRender;
		return {
			...source, children: [],
			component: new ContainerEntity(
				iRender,
				source.props || {},
				source.children,
				nObject,
				delivered,
			),
		};
	}
	if (ltag === 'neep:value') {
		return { ...source, children: [] };
	}
	if (ltag === 'neep:deliver') {
		const props = { ...source.props };
		delete props.ref;
		delete props.slot;
		delete props.key;
		const newDelivered = updateProps(
			Object.create(delivered),
			props,
			{},
			true,
		);
		return {
			...source,
			delivered: newDelivered,
			children: createAll(
				nObject,
				newDelivered,
				source.children,
			),
		};
	}

	if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
		return {
			...source,
			children: createAll(
				nObject,
				delivered,
				source.children,
			),
		};
	}
	return {
		...source,
		children: createAll(nObject, delivered, source.children),
	};
}

export function createAll(
	nObject: EntityObject,
	delivered: Delivered,
	source: any,
): (TreeNode | TreeNode[])[] {
	if (!Array.isArray(source)) { source = [source]; }
	if (!source.length) { return []; }
	return (source as any[]).map(item => {
		if (!Array.isArray(item)) {
			return createItem(nObject, delivered, toElement(item));
		}
		return [...recursive2iterable(item)]
			.map(it => createItem(nObject, delivered, toElement(it)));
	});
}
