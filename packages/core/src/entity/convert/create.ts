import { NeepNode, TreeNode, Delivered } from '../../type';
import { getRender } from '../../install';
import { typeSymbol, deliverKeySymbol } from '../../symbols';
import { recursive2iterable } from '../recursive';
import EntityObject from '../EntityObject';
import ComponentEntity from '../ComponentEntity';
import ContainerEntity from '../ContainerEntity';
import { toElement } from './utils';
import { isDeliver } from '../../auxiliary/deliver';
import { Container, Value } from '../../auxiliary/tags';

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
	if (!tag) {
		return {
			tag: null,
			key: undefined,
			children: [],
		};
	}

	if (isDeliver(tag)) {
		const newDelivered = Object.create(delivered);
		Reflect.defineProperty(newDelivered, tag[deliverKeySymbol], {
			configurable: true,
			enumerable: true,
			value: source.props ? source.props.value : undefined,
		});
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
	if (ltag === Container) {
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
	if (ltag === Value) {
		return { ...source, children: [] };
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
