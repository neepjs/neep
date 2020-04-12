import { Component } from './type';

export const components: Record<string, Component> = Object.create(null);

export function register(name: string, component: Component) {
	components[name] = component;
}
