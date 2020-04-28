/*!
 * Neep v0.1.0-alpha.10
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import * as _mp_rt1_monitorable__ from 'monitorable';
import { value, computed, isValue, encase, recover, valueify, asValue, Value as Value$1, WatchCallback } from 'monitorable';
export { asValue, computed, encase, isValue, recover, value, valueify } from 'monitorable';

interface AddEvent<T extends Record<string, any[]>> {
    <N extends keyof T>(entName: N, listener: (...p: T[N]) => void): void;
}
declare class EventEmitter<T extends Record<string, any[]> = Record<string, any[]>> {
    static update<T extends Record<string, any[]>>(emitter: EventEmitter<T>, events: any): (() => void)[];
    static updateInProps<T extends Record<string, any[]>>(emitter: EventEmitter<T>, props: any, custom?: (addEvent: AddEvent<T>) => void): (() => void)[];
    private readonly _names;
    private readonly _cancelHandles;
    readonly names: (keyof T)[];
    readonly emit: Emit<T>;
    readonly on: On<T>;
    constructor();
    updateHandles(newHandles: (() => void)[]): (() => void)[];
    update(list: any): (() => void)[];
    updateInProps(list: any, custom?: (addEvent: AddEvent<T>) => void): (() => void)[];
}

declare class EntityObject {
    readonly events: EventEmitter<Record<string, any[]>>;
    readonly emit: Emit<Record<string, any[]>>;
    readonly on: On<Record<string, any[]>>;
    readonly eventCancelHandles: Set<() => void>;
    readonly iRender: IRender;
    readonly components: Record<string, Component>;
    readonly config: Record<string, any>;
    /** 接受到的呈递值 */
    readonly parentDelivered: Delivered;
    /** 向后代呈递的值 */
    readonly delivered: Delivered;
    /** 组件暴露值 */
    readonly exposed: Exposed;
    /** 组件实体 */
    readonly entity: Entity;
    /** 父组件 */
    parent?: EntityObject;
    /** 原生组件 */
    native: NativeComponent | undefined;
    /** 状态 */
    created: boolean;
    destroyed: boolean;
    mounted: boolean;
    unmounted: boolean;
    /**  子组件的暴露值 */
    readonly children: Set<Exposed>;
    /** The subtree mounted on the parent node */
    tree: (MountedNode | MountedNode[])[];
    readonly container: ContainerEntity;
    constructor(iRender: IRender, parent?: EntityObject, delivered?: Delivered, container?: ContainerEntity);
    /** 结果渲染函数 */
    protected _render: () => NeepNode[];
    readonly canRefresh: boolean;
    protected readonly needRefresh: boolean;
    /** 是否需要继续刷新 */
    protected _needRefresh: boolean;
    private _delayedRefresh;
    /** 是否为刷新中 */
    private _refreshing;
    /** 渲染结果 */
    protected _nodes: (TreeNode | TreeNode[])[];
    protected requestDraw(): void;
    asyncRefresh<T>(f: () => PromiseLike<T> | T): Promise<T>;
    refresh(): void;
    refresh<T>(f: () => T, async?: false): T;
    refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
    refresh<T>(f: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T;
    refresh<T>(f?: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T | undefined;
    callHook<H extends Hooks>(id: H): void;
    callHook(id: string): void;
    childNodes: any[];
    /** 更新属性及子代 */
    protected _update(props: object, children: any[]): void;
    /** 更新属性及子代 */
    update(props: object, children: any[]): void;
    private __executed_destroy;
    private __executed_mount;
    private __executed_mounted;
    protected _destroy(): void;
    destroy(): void;
    protected _mount(): void;
    mount(): void;
    protected _unmount(): void;
    unmount(): void;
    _draw(): void;
    _cancelDrawMonitor?: () => void;
    draw(): void;
}

declare class ContainerEntity extends EntityObject {
    props: MountProps;
    /** 组件树结构 */
    content: (MountedNode | MountedNode[])[];
    _node: NativeNode | null;
    _container: NativeContainer | null;
    readonly rootContainer: ContainerEntity;
    constructor(iRender: IRender, props: MountProps, children: any[], parent?: EntityObject, delivered?: Delivered);
    _drawChildren: boolean;
    _drawContainer: boolean;
    setChildren(children: any[]): void;
    setProps(props: MountProps): void;
    /** 更新属性及子代 */
    update(props: MountProps, children: any[]): void;
    requestDraw(): void;
    _mount(): void;
    _destroy(): void;
    _unmount(): void;
    _draw(): void;
    _drawSelf(): void;
    drawSelf(): void;
    /** 等待重画的项目 */
    private _awaitDraw;
    /** 自身是否需要重绘 */
    private _needDraw;
    /** 标记需要绘制的元素 */
    markDraw(nObject: EntityObject, remove?: boolean): void;
    drawContainer(): void;
    private _containers;
    markDrawContainer(container: ContainerEntity, remove?: boolean): void;
    drawAll(): void;
}

declare class ComponentEntity<P extends object = object, R extends object = object> extends EntityObject {
    /** 组件函数 */
    readonly component: Component<P, R>;
    /** 组件属性 */
    readonly props: P;
    /** 组件槽 */
    readonly slots: Slots;
    /** 结果渲染函数 */
    private readonly _stopRender;
    /** 原生子代 */
    nativeNodes: (TreeNode | TreeNode[])[] | undefined;
    shadowTree: (MountedNode | MountedNode[])[];
    nativeTree: (MountedNode | MountedNode[])[];
    private readonly _shadow;
    /** 组件上下文 */
    readonly context: Context;
    readonly parent: EntityObject;
    /** 结果渲染函数 */
    constructor(component: Component<P, R>, props: object, children: any[], parent: EntityObject, delivered?: Delivered);
    /** 更新属性及子代 */
    _update(props: object, children: any[]): void;
    _destroy(): void;
    /** 刷新 */
    requestDraw(): void;
    _draw(): void;
    _mount(): void;
    _unmount(): void;
}

interface Attributes {
	slot?: string;
	ref?: Ref;
	'@'?: Emit | EventSet,
	'n:on'?: Emit | EventSet,
	'n-on'?: Emit | EventSet,
	
}
interface NativeAttributes extends Attributes {
	id?: string;
	class?: string;
}
interface ClassAttributes<T> extends Attributes {

}

interface SlotAttr {
	name?: string;
}
interface ScopeSlotAttr {
	name?: string;
	render?(...params: any[]): NeepNode | NeepNode[];
}
interface SlotRenderAttr {

}


declare global {
	namespace JSX {
		interface IntrinsicAttributes extends NativeAttributes { }
		interface IntrinsicClassAttributes<T> extends ClassAttributes<T> { }

		interface IntrinsicElements {
			[Slot]: SlotAttr & ScopeSlotAttr;
			[SlotRender]: SlotRenderAttr;
			[ScopeSlot]: ScopeSlotAttr;
			slot: SlotAttr;
			[k: string]: any;
		}
	}
};

/**
 * Global constant
 *
 * Will be replaced by the 'rollup-plugin-replace' plug-in
 */
/**
* Neep code version
*/
declare const version: string;
/**
 * Is the current mode production mode
 * @description Support tree shaking
 */
declare const isProduction: boolean;

declare const Constant_version: typeof version;
declare const Constant_isProduction: typeof isProduction;
declare namespace Constant {
  export {
    Constant_version as version,
    Constant_isProduction as isProduction,
  };
}

declare const ScopeSlot = "Neep:ScopeSlot";
declare const SlotRender = "Neep:SlotRender";
declare const Slot = "Neep:Slot";
declare const Value = "Neep:Value";
declare const Container = "Neep:Container";
declare const Deliver = "Neep:Deliver";
declare const Template = "template";
declare const Fragment = "template";

declare const Tags_ScopeSlot: typeof ScopeSlot;
declare const Tags_SlotRender: typeof SlotRender;
declare const Tags_Slot: typeof Slot;
declare const Tags_Value: typeof Value;
declare const Tags_Container: typeof Container;
declare const Tags_Deliver: typeof Deliver;
declare const Tags_Template: typeof Template;
declare const Tags_Fragment: typeof Fragment;
declare namespace Tags {
  export {
    Tags_ScopeSlot as ScopeSlot,
    Tags_SlotRender as SlotRender,
    Tags_Slot as Slot,
    Tags_Value as Value,
    Tags_Container as Container,
    Tags_Deliver as Deliver,
    Tags_Template as Template,
    Tags_Fragment as Fragment,
  };
}



declare const State_value: typeof value;
declare const State_computed: typeof computed;
declare const State_isValue: typeof isValue;
declare const State_encase: typeof encase;
declare const State_recover: typeof recover;
declare const State_valueify: typeof valueify;
declare const State_asValue: typeof asValue;
declare namespace State {
  export {
    State_value as value,
    State_computed as computed,
    State_isValue as isValue,
    State_encase as encase,
    State_recover as recover,
    State_valueify as valueify,
    State_asValue as asValue,
  };
}

/**********************************
 * 状态管理类 API
 **********************************/
/**
 * 监听指定值的变化
 * @description 本质是调用 Value 对象的 watch 方法
 * @description 但是通过此方法进行的观察，会在组件生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 被监听的值
 * @param cb    当监听的值发送变化时调用的函数
 */
declare function watch<T>(value: Value$1<T>, cb: WatchCallback<T>): () => void;
/**
 * 监听指定值的变化
 * @description 本质是创建调用 Value 对象的 watch 方法
 * @description 但是通过此方法进行的观察，会在组件生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 用于计算观测值的函数
 * @param cb    当监听的值发送变化时调用的函数
 */
declare function watch<T>(value: () => T, cb: (v: T, stopped: boolean) => void): () => void;
declare function useValue(): Value$1<any>;
declare function useValue<T>(fn: () => T, name?: string): T;
declare function useValue<T>(fn?: () => T, name?: string): T | Value$1<any>;
/**********************************
 * 钩子类 API
 **********************************/
/**
 * 为当前组件注册钩子
 * @param name 钩子名称
 * @param hook 钩子
 * @param initOnly 是否仅在初始化时有效
 */
declare function hook<H extends Hooks>(name: H, hook: () => void, initOnly?: boolean): undefined | (() => void);
declare function hook(name: string, hook: () => void, initOnly?: boolean): undefined | (() => void);
/**
 * 将 Value 导出
 * @param name 导出用的名称
 */
declare function expose<T>(name: string | number | symbol, value: Value$1<T>, mix?: boolean): void;
/**
 * 将普通值导出
 * @param name
 * @param value
 */
declare function expose<T>(name: string | number | symbol, value: T): void;
/**
 * 设置基于 getter 的导出
 * @param name
 * @param getter
 * @param nonModifiable
 */
declare function expose<T>(name: string | number | symbol, getter: () => T, nonModifiable: true): void;
/**
 * 设置基于 getter/setter 的导出
 * @param name
 * @param getter
 * @param setter
 */
declare function expose<T>(name: string | number | symbol, getter: () => T, setter: (value: T) => void): void;
/**
 * 将 Value 传递给子组件
 * @param name 导出用的名称
 */
declare function deliver<T>(name: string | number | symbol, value: Value$1<T>, mix?: boolean): void;
/**
 * 将普通值导出
 * @param name
 * @param value
 */
declare function deliver<T>(name: string | number | symbol, value: T): void;
/**
 * 设置基于 getter 的传递
 * @param name
 * @param getter
 * @param nonModifiable
 */
declare function deliver<T>(name: string | number | symbol, getter: () => T, nonModifiable: true): void;
/**
 * 设置基于 getter/setter 的传递
 * @param name
 * @param getter
 * @param setter
 */
declare function deliver<T>(name: string | number | symbol, getter: () => T, setter: (value: T) => void): void;

declare const Life_watch: typeof watch;
declare const Life_useValue: typeof useValue;
declare const Life_hook: typeof hook;
declare const Life_expose: typeof expose;
declare const Life_deliver: typeof deliver;
declare namespace Life {
  export {
    Life_watch as watch,
    Life_useValue as useValue,
    Life_hook as hook,
    Life_expose as expose,
    Life_deliver as deliver,
  };
}

/**
 * 判读是否为元素
 */
declare function isElement(v: any): v is NeepElement;
declare function createElement(tag: Tag, attrs?: {
    [key: string]: any;
}, ...children: any[]): NeepElement;
interface elementIteratorOptions {
    simple?: boolean | Component[] | ((c: Component) => boolean);
}
declare function elements(node: any, opt?: elementIteratorOptions): any[];

declare const Element_isElement: typeof isElement;
declare const Element_createElement: typeof createElement;
type Element_elementIteratorOptions = elementIteratorOptions;
declare const Element_elements: typeof elements;
declare namespace Element {
  export {
    Element_isElement as isElement,
    Element_createElement as createElement,
    Element_elementIteratorOptions as elementIteratorOptions,
    Element_elements as elements,
  };
}

declare function label(text: string, color?: string): void;

declare const Dev_label: typeof label;
declare namespace Dev {
  export {
    Dev_label as label,
  };
}

/** 辅助 */
interface Auxiliary extends Readonly<typeof Tags>, Readonly<typeof State>, Readonly<typeof Life>, Readonly<typeof Element>, Readonly<typeof Dev>, Readonly<typeof Constant> {
}
declare function setAuxiliary<T>(name: string, value: T): void;
declare function defineAuxiliary<T>(name: string, get: (this: Auxiliary) => T): void;

declare const isElementSymbol: unique symbol;
declare const typeSymbol: unique symbol;
declare const nameSymbol: unique symbol;
declare const renderSymbol: unique symbol;
declare const componentsSymbol: unique symbol;
declare const configSymbol: unique symbol;

declare const symbols_isElementSymbol: typeof isElementSymbol;
declare const symbols_typeSymbol: typeof typeSymbol;
declare const symbols_nameSymbol: typeof nameSymbol;
declare const symbols_renderSymbol: typeof renderSymbol;
declare const symbols_componentsSymbol: typeof componentsSymbol;
declare const symbols_configSymbol: typeof configSymbol;
declare namespace symbols {
  export {
    symbols_isElementSymbol as isElementSymbol,
    symbols_typeSymbol as typeSymbol,
    symbols_nameSymbol as nameSymbol,
    symbols_renderSymbol as renderSymbol,
    symbols_componentsSymbol as componentsSymbol,
    symbols_configSymbol as configSymbol,
  };
}

declare type EntityObject$1 = InstanceType<typeof EntityObject>;
declare type ComponentEntity$1 = InstanceType<typeof ComponentEntity>;
declare type ContainerEntity$1 = InstanceType<typeof ContainerEntity>;
interface Devtools {
    renderHook(container: ContainerEntity$1): void;
}
/** 全局钩子 */
interface Hook {
    (nObject: Entity): void;
}
/** source 对象 */
declare type NeepNode = NeepElement | null;
/** 槽函数 */
interface SlotFn {
    (...props: any): NeepElement;
    readonly children: any[];
}
/** 槽列表 */
interface Slots {
    [name: string]: SlotFn | undefined;
}
interface Emit<T extends Record<string, any[]> = Record<string, any[]>> {
    <N extends keyof T>(name: N, ...p: T[N]): boolean;
    omit(...names: string[]): Emit;
    readonly names: (keyof T)[];
}
interface EventSet {
    [key: string]: (...p: any[]) => void;
}
interface On<T extends Record<string, any[]> = Record<string, any[]>> {
    <N extends keyof T>(name: N, listener: (...p: T[N]) => void | undefined | null | boolean): () => void;
}
interface ContextConstructor {
    (context: Context, exposed?: Exposed): void;
}
declare type Hooks = 'beforeCreate' | 'created' | 'beforeDestroy' | 'destroyed' | 'beforeUpdate' | 'updated' | 'beforeMount' | 'mounted' | 'beforeDraw' | 'drawn' | 'beforeDrawAll' | 'drawnAll';
interface Exposed {
    readonly $component: Component<any, any> | null;
    readonly $parent?: Exposed;
    readonly $isContainer: boolean;
    readonly $created: boolean;
    readonly $destroyed: boolean;
    readonly $mounted: boolean;
    readonly $unmounted: boolean;
    /** Only the development mode is valid */
    readonly $label?: [string, string];
    [name: string]: any;
}
interface Delivered {
    [name: string]: any;
}
interface RootExposed extends Exposed {
    $update(node?: NeepElement | Component): RootExposed;
    $mount(target?: any): RootExposed;
    $unmount(): void;
}
/** 上下文环境 */
interface Context<P = any> {
    /** 作用域槽 */
    slots: Slots;
    /** 是否已经完成初始化 */
    created: boolean;
    /** 父组件 */
    parent?: Exposed;
    delivered: Delivered;
    /** 子组件集合 */
    children: Set<Exposed>;
    childNodes: any[];
    refresh(fn?: () => void): void;
    emit: Emit;
}
interface Entity {
    readonly exposed: Exposed;
    readonly delivered: Delivered;
    readonly component: Component<any, any> | null;
    readonly parent?: Entity;
    readonly isContainer: boolean;
    readonly created: boolean;
    readonly destroyed: boolean;
    readonly mounted: boolean;
    readonly unmounted: boolean;
    readonly config: Record<string, any>;
    readonly on: On;
    readonly emit: Emit;
    callHook<H extends Hooks>(hook: H): void;
    callHook(hook: string): void;
    setHook<H extends Hooks>(id: H, hook: Hook): () => void;
    setHook(id: string, hook: Hook): () => void;
    readonly $_hooks: {
        [name: string]: Set<Hook>;
    };
    refresh(): void;
    refresh<T>(f: () => T, async?: false): T;
    refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
    refresh<T>(f: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T;
    refresh<T>(f?: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T | undefined;
    $_valueIndex: number;
    readonly $_values: any[];
}
interface Render<R extends object = any> {
    (data: R, context: Context, auxiliary: Auxiliary): NeepNode;
}
/** 组件标记 */
interface Marks {
    /** 组件名称 */
    [symbols.nameSymbol]?: string;
    /** 是否为原生组件 */
    [symbols.typeSymbol]?: 'native' | 'simple' | 'standard';
    [symbols.renderSymbol]?: Render;
    [symbols.configSymbol]?: Record<string, any>;
    [symbols.componentsSymbol]?: Record<string, Component>;
}
/** 构造函数 */
interface Component<P extends object = object, R extends object = object> extends Marks {
    (props: P, context: Context, auxiliary: Auxiliary): undefined | null | NeepNode | NeepNode[] | R | (() => undefined | null | NeepNode | NeepNode[] | R);
}
declare type Tag = null | string | typeof Tags[keyof typeof Tags] | Component<any, any>;
interface Ref {
    (node: NativeNode | Exposed, isRemove?: boolean): void;
}
interface NeepElement {
    [symbols.isElementSymbol]: true;
    /** 标签名 */
    tag: Tag;
    execed?: boolean;
    /** 属性 */
    props?: {
        [key: string]: any;
    };
    /** 子节点 */
    children: any[];
    /** 引用绑定 */
    ref?: Ref;
    /** 插槽 */
    slot?: string;
    /** 列表对比 key */
    key: any;
    /** Value 类型值 */
    value?: any;
    /** Slot 相关的渲染函数 */
    render?(...props: any[]): any;
    /** 槽渲染参数 */
    args?: any[];
    /** 是否是已插入的 */
    inserted?: boolean;
    /** 标注 */
    label?: [string, string];
}
interface TreeNode extends Omit<NeepElement, 'children' | typeof isElementSymbol> {
    children: (this | this[])[];
    delivered?: Delivered;
    mounted?: boolean;
    component?: EntityObject$1;
}
/**
 * @description node / component / children 至少一个有效
 */
interface MountedNode extends TreeNode {
    id: number;
    parent?: this;
    node: undefined | NativeNode;
}
declare const NativeElementSymbol: unique symbol;
declare const NativeTextSymbol: unique symbol;
declare const NativeComponentSymbol: unique symbol;
declare const NativePlaceholderSymbol: unique symbol;
declare const NativeShadowSymbol: unique symbol;
/** 原生元素节点 */
interface NativeElement {
    [NativeElementSymbol]: true;
}
/** 原生文本节点 */
interface NativeText {
    [NativeTextSymbol]: true;
}
/** 原生占位组件 */
interface NativePlaceholder {
    [NativePlaceholderSymbol]: true;
}
/** 原生组件 */
interface NativeComponent {
    [NativeComponentSymbol]: true;
}
/** 原生组件内部 */
interface NativeShadow {
    [NativeShadowSymbol]: true;
}
declare type NativeContainer = NativeElement | NativeComponent | NativeShadow;
declare type NativeNode = NativeContainer | NativeText | NativePlaceholder;
interface MountProps {
    type?: string | IRender;
    target?: any;
    [key: string]: any;
}
interface IRender {
    type: string;
    nextFrame?(fn: () => void): void;
    mount(props: MountProps, parent?: IRender): [NativeContainer, NativeNode];
    unmount(container: NativeContainer, node: NativeNode, removed: boolean): any;
    draw(container: NativeContainer, node: NativeNode): void;
    drawContainer(container: NativeContainer, node: NativeNode, props: MountProps, parent?: IRender, 
    /**
     * 当 parent 存在且与当前节点不同时，用于区分
     */
    isSelf?: boolean): [NativeContainer, NativeNode];
    isNode(v: any): v is NativeNode;
    create(tag: string, props: Record<string, any>): NativeElement;
    update(node: NativeElement, props: Record<string, any>): void;
    text(text: string): NativeText;
    placeholder(): NativePlaceholder;
    component?(): [NativeComponent, NativeShadow];
    parent(node: NativeNode): NativeContainer | null;
    next(node: NativeNode): NativeNode | null;
    insert(parent: NativeContainer, node: NativeNode, next?: NativeNode | null): void;
    remove(n: NativeNode): void;
}

interface InstallOptions {
    monitorable?: typeof _mp_rt1_monitorable__;
    render?: IRender;
    devtools?: Devtools;
}
declare function install(apis: InstallOptions): void;

declare class NeepError extends Error {
    readonly tag: string;
    constructor(message: string, tag?: string);
}

declare function render(e?: NeepElement | Component, p?: MountProps): RootExposed;

declare function register(name: string, component: Component): void;

declare function lazy<P extends object = object, C extends Component<P, any> = Component<P, any>>(component: () => Promise<C | {
    default: C;
}>, Placeholder?: Component<{
    loading: boolean;
}, any>): Component<P>;

/** 当前正在执行的对象 */
declare let current: Entity | undefined;
declare function checkCurrent(name: string, initOnly?: boolean): Entity;

declare function addContextConstructor(constructor: ContextConstructor): void;

declare function refresh<T>(f: () => T, async?: false): T;
declare function refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
declare function refresh<T>(f: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T;

/** 组件标记函数 */
interface Mark {
    <N extends Component<any, any>>(component: N): N;
}
/** 标记组件名称 */
declare function mName(name: string): Mark;
declare function mName<N extends Component<any, any>>(name: string, component: N): N;
/** 标记组件类型 */
declare function mType(type?: 'native' | 'simple' | 'standard'): Mark;
declare function mType<N extends Component<any, any>>(type: 'native' | 'simple' | 'standard', component: N): N;
/** 标记为简单组件 */
declare function mSimple(): Mark;
declare function mSimple<N extends Component<any, any>>(component: N): N;
/** 标记为原生组件 */
declare function mNative(): Mark;
declare function mNative<N extends Component<any, any>>(component: N): N;
/** 标记独立的渲染函数 */
declare function mRender(fn?: Marks[typeof renderSymbol]): Mark;
declare function mRender<N extends Component<any, any>>(fn: Marks[typeof renderSymbol] | undefined, component: N): N;
/** 标记组件类型 */
declare function mConfig(name: string, config: any): Mark;
declare function mConfig<N extends Component<any, any>>(name: string, config: any, component: N): N;
/** 标记组件类型 */
declare function mComponent(name: string, item: Component): Mark;
declare function mComponent<N extends Component<any, any>>(name: string, item: Component, component: N): N;
declare function create<P extends object>(c: Component<P, never>): Component<P, never>;
declare function create<P extends object = object, R extends object = object>(c: Component<P, R>, r: Render<R>): Component<P, R>;
declare function mark<N extends Component<any, any>>(component: N, ...marks: Mark[]): N;

declare function setHook<H extends Hooks>(id: H, hook: Hook, entity?: Entity): () => void;
declare function setHook(id: string, hook: Hook, entity?: Entity): () => void;
declare function callHook<H extends Hooks>(id: H, exposed: Entity): void;
declare function callHook(id: string, exposed: Entity): void;

export { Auxiliary, Component, ComponentEntity$1 as ComponentEntity, Container, ContainerEntity$1 as ContainerEntity, Context, ContextConstructor, Deliver, Delivered, Devtools, Emit, Entity, EntityObject$1 as EntityObject, NeepError as Error, EventEmitter, EventSet, Exposed, Fragment, Hook, Hooks, IRender, Mark, Marks, MountProps, MountedNode, NativeComponent, NativeContainer, NativeElement, NativeNode, NativePlaceholder, NativeShadow, NativeText, NeepElement, NeepNode, On, Ref, Render, RootExposed, ScopeSlot, Slot, SlotFn, SlotRender, Slots, Tag, Tags, Template, TreeNode, Value, addContextConstructor, callHook, checkCurrent, componentsSymbol, configSymbol, create, createElement, current, defineAuxiliary, deliver, elementIteratorOptions, elements, expose, hook, install, isElement, isElementSymbol, isProduction, label, lazy, mComponent, mConfig, mName, mNative, mRender, mSimple, mType, mark, nameSymbol, refresh, register, render, renderSymbol, setAuxiliary, setHook, typeSymbol, useValue, version, watch };
