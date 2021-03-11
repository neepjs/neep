
export interface EmitOptions {
	options?: boolean;
	cancelable?: boolean;
}
type EmitProps<T> = undefined extends T ? [] | [T]
	: void extends T ? [] | [T]
		: never extends T ? [] | [T] : [T];
export interface Emit<T extends Record<string, any> = Record<string, any>> {
	<N extends keyof T & string>(name: N, ...p: EmitProps<T[N]>): boolean;
	<N extends keyof T & string>(name: N, p: T[N]): boolean;
	omit(...names: string[]): Emit;
	readonly names: (keyof T)[];
}
export interface EventSet {
	[key: string]: (...p: any[]) => void;
}

export interface EventInfo<T> {
	readonly target: any;
	readonly cancelable: boolean;
	readonly defaultPrevented: boolean;
	readonly prevented: boolean;
	preventDefault(): void;
	prevent(): void;
}
export interface Listener<T, P> {
	(p: P, event: EventInfo<T>): void
}
export interface On<T, E extends Record<string, any>> {
	<N extends keyof E & string>(
		name: N,
		listener: Listener<T, E[N]>,
	): () => void;
}

export type EventEmitter<T, E extends Record<string, any>>
	= import('../EventEmitter').default<T, E>;
