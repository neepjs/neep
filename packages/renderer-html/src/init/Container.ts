import Neep from '@neep/core';
import {
	createContainerComponent,
	createElement,
} from '../install/neep';
import renderer from '../renderer';

export declare namespace Container {
	export interface Props {
		target?: string | HTMLElement,
	}
}
export let Container: Neep.ContainerComponent<Container.Props>;

export default function initContainer(): void {
	Container = createContainerComponent(
		createElement(''),
		{ renderer, name: '[HTML]' },
	);
}
