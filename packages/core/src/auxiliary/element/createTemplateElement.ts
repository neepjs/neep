import { Element } from '../../types';
import { objectTypeSymbol, objectTypeSymbolElement } from '../../constant/symbols';
import { Template } from '../../constant/tags';


export default function createTemplateElement(...children: any[]): Element {
	return {
		[objectTypeSymbol]: objectTypeSymbolElement,
		tag: Template,
		children,
	};
}
