import { StandardComponent, RenderComponent } from './component';
import { Emit, On } from './event';
import { HookName, Hook } from './hook';
import { Element } from './node';
import { Label } from './devtools';

export interface Entity<T, TEmit extends Record<string, any>> {
	readonly exposed?: T;
	data: Record<string, any>
	readonly on: On<T, TEmit>;
	readonly emit: Emit<TEmit>;
}

export interface ElementEntity<
	T, TEmit extends Record<string, any> = Record<string, any>
> extends Entity<T, TEmit> {
}

export interface ShellEntity<
	TEmit extends Record<string, any> = Record<string, any>
> extends Entity<undefined, TEmit> {
}

export interface HookEntity<T,
	TEmit extends Record<string, any> = Record<string, any>,
> extends Entity<T, TEmit> {
	callHook<H extends HookName>(hook: H): void;
	callHook(hook: string): void;
	setHook<H extends HookName>(id: H, hook: Hook): () => void;
	setHook(id: string, hook: Hook): () => void;
}

export interface ComponentEntity<
	C extends StandardComponent<any, any, any> | RenderComponent<any, any, any>,
	Parent extends ComponentEntity<any, any> | undefined | never
	= ComponentEntity<any, any> | undefined
> extends HookEntity<
	C extends StandardComponent<any, infer E, any> ? E :
		C extends RenderComponent<any, infer E, any> ? E : any,
	C extends StandardComponent<any, any, infer E> ? E :
		C extends RenderComponent<any, any, infer E> ? E : any
	> {
	readonly component: C;
	readonly parent: Parent;
	readonly created: boolean;
	readonly destroyed: boolean;
	readonly mounted: boolean;
	readonly unmounted: boolean;


	/** Only the development mode is valid */
	readonly $_label?: Label[];
}

export interface ContainerEntity<T,
	TEmit extends Record<string, any> = Record<string, any>,
> extends HookEntity<undefined, TEmit> {
	readonly created: boolean;
	readonly destroyed: boolean;
	readonly mounted: boolean;
	readonly unmounted: boolean;
}

export interface RootEntity<T,
	TEmit extends Record<string, any> = Record<string, any>
> extends ContainerEntity<T, TEmit> {
	update(node?: Element | StandardComponent<any, any, any>): this;
	mount(target?: any): this;
	unmount(): void;
}
