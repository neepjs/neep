import { Component } from './types';

export const components: Record<string, Component<any>> = Object.create(null);

export default function register(
	name: string,
	component: Component<any>,
): void {
	components[name] = component;
}
