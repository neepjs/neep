/*!
 * Neep v0.1.0-alpha.15
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import * as _mp_rt1_monitorable__ from 'monitorable';
import { Value as Value$1, WatchCallback, value, computed, isValue, encase, recover, valueify, asValue } from 'monitorable';
export { asValue, computed, encase, isValue, recover, value, valueify } from 'monitorable';

declare const ScopeSlot = "neep:ScopeSlot";
declare const SlotRender = "neep:SlotRender";
declare const Slot = "neep:slot";
declare const Value = "neep:value";
declare const Container = "neep:container";
declare const Template = "template";
declare const Fragment = "template";

declare const _mp_rt28__auxiliary_tags___ScopeSlot: typeof ScopeSlot;
declare const _mp_rt28__auxiliary_tags___SlotRender: typeof SlotRender;
declare const _mp_rt28__auxiliary_tags___Slot: typeof Slot;
declare const _mp_rt28__auxiliary_tags___Value: typeof Value;
declare const _mp_rt28__auxiliary_tags___Container: typeof Container;
declare const _mp_rt28__auxiliary_tags___Template: typeof Template;
declare const _mp_rt28__auxiliary_tags___Fragment: typeof Fragment;
declare namespace _mp_rt28__auxiliary_tags__ {
  export {
    _mp_rt28__auxiliary_tags___ScopeSlot as ScopeSlot,
    _mp_rt28__auxiliary_tags___SlotRender as SlotRender,
    _mp_rt28__auxiliary_tags___Slot as Slot,
    _mp_rt28__auxiliary_tags___Value as Value,
    _mp_rt28__auxiliary_tags___Container as Container,
    _mp_rt28__auxiliary_tags___Template as Template,
    _mp_rt28__auxiliary_tags___Fragment as Fragment,
  };
}

interface AddEvent<T extends Record<string, any[]>> {
    <N extends keyof T>(entName: N, listener: (...p: T[N]) => void): void;
}
declare class EventEmitter<T extends Record<string, any[]> = Record<string, any[]>> {
    static update<T extends Record<string, any[]>>(emitter: EventEmitter<T>, events: any): (() => void)[];
    static updateInProps<T extends Record<string, any[]>>(emitter: EventEmitter<T>, props: any, custom?: (addEvent: AddEvent<T>) => void): (() => void)[];
    private readonly _names;
    private readonly _cancelHandles;
    get names(): (keyof T)[];
    readonly emit: Emit<T>;
    readonly on: On<T>;
    constructor();
    updateHandles(newHandles: (() => void)[]): (() => void)[];
    update(list: any): (() => void)[];
    updateInProps(list: any, custom?: (addEvent: AddEvent<T>) => void): (() => void)[];
}

interface RecursiveArray<T> extends Array<RecursiveItem<T>> {
}
declare type RecursiveItem<T> = T | RecursiveArray<T>;

declare class EntityObject {
    readonly slotRenderFnList: WeakMap<Function, Function>;
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
    protected _render: () => RecursiveArray<NeepNode>;
    get canRefresh(): boolean;
    protected get needRefresh(): boolean;
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
    _cancelDrawContainerMonitor?: () => void;
    _cancelDrawChildrenMonitor?: () => void;
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
    lastSlots: Record<string | symbol, any[]> | undefined;
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
}

declare const typeSymbol: unique symbol;
declare const nameSymbol: unique symbol;
declare const renderSymbol: unique symbol;
declare const componentsSymbol: unique symbol;
declare const configSymbol: unique symbol;
declare const objectTypeSymbol: unique symbol;
declare const objectTypeSymbolElement = "$$$objectType$$$Element";
declare const objectTypeSymbolDeliver = "$$$objectType$$$Deliver";
declare const deliverKeySymbol: unique symbol;
declare const deliverDefaultSymbol: unique symbol;

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
    (context: Context, entity?: Entity): void;
}
interface EntityConstructor {
    (entity: Entity): void;
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
declare type Delivered = Record<any, any>;
interface RootExposed extends Exposed {
    $update(node?: NeepElement | Component): RootExposed;
    $mount(target?: any): RootExposed;
    $unmount(): void;
}
interface Deliver<T> {
    (props: {
        value?: T;
    }, context: Context): NeepNode[];
    [objectTypeSymbol]: typeof objectTypeSymbolDeliver;
    [deliverKeySymbol]: symbol;
    [deliverDefaultSymbol]: T;
}
/** 上下文环境 */
interface Context {
    /** 作用域槽 */
    slots: Slots;
    /** 是否已经完成初始化 */
    created: boolean;
    /** 父组件 */
    parent?: Exposed;
    delivered<T>(d: Deliver<T>): T;
    /** 子组件集合 */
    children: Set<Exposed>;
    childNodes: any[];
    refresh(fn?: () => void): void;
    emit: Emit;
}
interface Entity {
    readonly exposed: Exposed;
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
    $_serviceIndex: number;
    readonly $_services: any[];
}
interface Render<R extends object = any> {
    (data: R, context: Context): NeepNode;
}
interface Service<T, P extends any[]> {
    (entity: Entity, ...p: P): T;
}
/** 组件标记 */
interface Marks {
    /** 组件名称 */
    [nameSymbol]?: string;
    /** 是否为原生组件 */
    [typeSymbol]?: 'native' | 'simple' | 'standard';
    [renderSymbol]?: Render;
    [configSymbol]?: Record<string, any>;
    [componentsSymbol]?: Record<string, Component>;
}
/** 构造函数 */
interface Component<P extends object = object, R extends object = object> extends Marks {
    (props: P, context: Context): undefined | null | NeepNode | NeepNode[] | R | (() => undefined | null | NeepNode | NeepNode[] | R);
}
declare type Tags = typeof _mp_rt28__auxiliary_tags__;
declare type Tag = null | string | Tags[keyof Tags] | Component<any, any>;
interface Ref<T extends NativeNode | Exposed = NativeNode | Exposed> {
    (node: T, isRemove?: boolean): void;
}
interface RefSet<T extends NativeNode | Exposed = NativeNode | Exposed> {
    add(value: T): void;
    delete(value: T): void;
}
interface RefValue<T extends NativeNode | Exposed = NativeNode | Exposed> extends Ref<T> {
    readonly value: T | null;
}
interface NeepElement {
    [objectTypeSymbol]: typeof objectTypeSymbolElement;
    /** 标签名 */
    tag: Tag;
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
    key?: any;
    /** Value 类型值 */
    value?: any;
    /** 是否是已插入的 */
    inserted?: boolean;
    execed?: boolean;
    /** 标注 */
    label?: [string, string];
}
interface TreeNode extends Omit<NeepElement, 'children' | typeof objectTypeSymbol> {
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
interface Rect {
    readonly bottom: number;
    readonly height: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly width: number;
}
interface IRender {
    type: string;
    nextFrame?(fn: () => void): void;
    mount(props: MountProps, parent?: IRender): [NativeContainer, NativeNode];
    unmount(container: NativeContainer, node: NativeNode, removed: boolean): any;
    drawNode(container: NativeContainer, node: NativeNode): void;
    drawContainer(container: NativeContainer, node: NativeNode, props: MountProps, parent?: IRender, 
    /**
     * 当 parent 存在且与当前节点不同时，用于区分
     */
    isSelf?: boolean): [NativeContainer, NativeNode];
    isNode(v: any): v is NativeNode;
    createElement(tag: string): NativeElement;
    updateProps(node: NativeElement, props: Record<string, any>): void;
    createText(text: string): NativeText;
    createPlaceholder(): NativePlaceholder;
    createComponent?(): [NativeComponent, NativeShadow];
    getParent(node: NativeNode): NativeContainer | null;
    nextNode(node: NativeNode): NativeNode | null;
    insertNode(parent: NativeContainer, node: NativeNode, next?: NativeNode | null): void;
    removeNode(n: NativeNode): void;
    getRect(n: NativeNode): Rect | null;
}
interface ElementIteratorOptions {
    simple?: boolean | Component[] | ((c: Component) => boolean);
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

declare function ref<T extends NativeNode | Exposed = NativeNode | Exposed>(watch?: boolean): RefValue<T>;
declare function ref<T extends NativeNode | Exposed = NativeNode | Exposed>(set: RefSet<T>): Ref<T>;

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
declare function useValue<T>(fn: () => T): T;
declare function useValue<T>(fn?: () => T): T | Value$1<any>;
/**********************************
 * 服务 API
 **********************************/
declare function useService<T, P extends any[]>(fn: Service<T, P>, ...p: P): T;
declare function byService<T, P extends any[]>(fn: Service<T, P>, ...p: P): T;
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
 * 判读是否为元素
 */
declare function isElement(v: any): v is NeepElement;
declare function isSimpleTag(tag: Tag): boolean;
declare function isSimpleElement(v: any): boolean;
declare function createElement(tag: Tag, attrs?: {
    [key: string]: any;
}, ...children: any[]): NeepElement;
declare function elements(node: any, opt?: ElementIteratorOptions): any[];
declare function equal(a: any, b: any): boolean;

declare function label(text: string, color?: string): void;

declare function getRect(n: NativeNode): Rect | null;

declare function createDeliver<T>(def: T): Deliver<T>;
declare function createDeliver<T>(def?: T): Deliver<T | undefined>;
declare function createDeliver<T, D>(def: D): Deliver<T | D>;
declare function isDeliver(d: any): d is Deliver<any>;

/** 当前正在执行的对象 */
declare let current: Entity | undefined;
declare function checkCurrent(name: string, initOnly?: boolean): Entity;

declare function addContextConstructor(constructor: ContextConstructor): void;

declare function addEntityConstructor(constructor: EntityConstructor): void;

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
/** 标记组件配置 */
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



declare const Neep_install: typeof install;
type Neep_EventEmitter = EventEmitter;
declare const Neep_EventEmitter: typeof EventEmitter;
declare const Neep_render: typeof render;
declare const Neep_register: typeof register;
declare const Neep_lazy: typeof lazy;
declare const Neep_version: typeof version;
declare const Neep_isProduction: typeof isProduction;
declare const Neep_createDeliver: typeof createDeliver;
declare const Neep_isDeliver: typeof isDeliver;
declare const Neep_ScopeSlot: typeof ScopeSlot;
declare const Neep_SlotRender: typeof SlotRender;
declare const Neep_Slot: typeof Slot;
declare const Neep_Value: typeof Value;
declare const Neep_Container: typeof Container;
declare const Neep_Template: typeof Template;
declare const Neep_Fragment: typeof Fragment;
declare const Neep_ref: typeof ref;
declare const Neep_value: typeof value;
declare const Neep_computed: typeof computed;
declare const Neep_isValue: typeof isValue;
declare const Neep_encase: typeof encase;
declare const Neep_recover: typeof recover;
declare const Neep_valueify: typeof valueify;
declare const Neep_asValue: typeof asValue;
declare const Neep_watch: typeof watch;
declare const Neep_useValue: typeof useValue;
declare const Neep_useService: typeof useService;
declare const Neep_byService: typeof byService;
declare const Neep_hook: typeof hook;
declare const Neep_expose: typeof expose;
declare const Neep_isElement: typeof isElement;
declare const Neep_isSimpleTag: typeof isSimpleTag;
declare const Neep_isSimpleElement: typeof isSimpleElement;
declare const Neep_createElement: typeof createElement;
declare const Neep_elements: typeof elements;
declare const Neep_equal: typeof equal;
declare const Neep_label: typeof label;
declare const Neep_getRect: typeof getRect;
declare const Neep_current: typeof current;
declare const Neep_checkCurrent: typeof checkCurrent;
declare const Neep_addContextConstructor: typeof addContextConstructor;
declare const Neep_addEntityConstructor: typeof addEntityConstructor;
declare const Neep_refresh: typeof refresh;
type Neep_Mark = Mark;
declare const Neep_mName: typeof mName;
declare const Neep_mType: typeof mType;
declare const Neep_mSimple: typeof mSimple;
declare const Neep_mNative: typeof mNative;
declare const Neep_mRender: typeof mRender;
declare const Neep_mConfig: typeof mConfig;
declare const Neep_mComponent: typeof mComponent;
declare const Neep_create: typeof create;
declare const Neep_mark: typeof mark;
type Neep_Devtools = Devtools;
type Neep_Hook = Hook;
declare const Neep_NeepNode: typeof NeepNode;
type Neep_SlotFn = SlotFn;
type Neep_Slots = Slots;
type Neep_Emit = Emit;
type Neep_EventSet = EventSet;
type Neep_On = On;
type Neep_ContextConstructor = ContextConstructor;
type Neep_EntityConstructor = EntityConstructor;
declare const Neep_Hooks: typeof Hooks;
type Neep_Exposed = Exposed;
declare const Neep_Delivered: typeof Delivered;
type Neep_RootExposed = RootExposed;
type Neep_Deliver = Deliver;
type Neep_Context = Context;
type Neep_Entity = Entity;
type Neep_Render = Render;
type Neep_Service = Service;
type Neep_Marks = Marks;
type Neep_Component = Component;
declare const Neep_Tag: typeof Tag;
type Neep_Ref = Ref;
type Neep_RefSet = RefSet;
type Neep_RefValue = RefValue;
type Neep_NeepElement = NeepElement;
type Neep_TreeNode = TreeNode;
type Neep_MountedNode = MountedNode;
type Neep_NativeElement = NativeElement;
type Neep_NativeText = NativeText;
type Neep_NativePlaceholder = NativePlaceholder;
type Neep_NativeComponent = NativeComponent;
type Neep_NativeShadow = NativeShadow;
declare const Neep_NativeContainer: typeof NativeContainer;
declare const Neep_NativeNode: typeof NativeNode;
type Neep_MountProps = MountProps;
type Neep_Rect = Rect;
type Neep_IRender = IRender;
type Neep_ElementIteratorOptions = ElementIteratorOptions;
declare const Neep_typeSymbol: typeof typeSymbol;
declare const Neep_nameSymbol: typeof nameSymbol;
declare const Neep_renderSymbol: typeof renderSymbol;
declare const Neep_componentsSymbol: typeof componentsSymbol;
declare const Neep_configSymbol: typeof configSymbol;
declare const Neep_objectTypeSymbol: typeof objectTypeSymbol;
declare const Neep_objectTypeSymbolElement: typeof objectTypeSymbolElement;
declare const Neep_objectTypeSymbolDeliver: typeof objectTypeSymbolDeliver;
declare const Neep_deliverKeySymbol: typeof deliverKeySymbol;
declare const Neep_deliverDefaultSymbol: typeof deliverDefaultSymbol;
declare const Neep_setHook: typeof setHook;
declare const Neep_callHook: typeof callHook;
declare namespace Neep {
  export {
    Neep_install as install,
    NeepError as Error,
    Neep_EventEmitter as EventEmitter,
    Neep_render as render,
    Neep_register as register,
    Neep_lazy as lazy,
    Neep_version as version,
    Neep_isProduction as isProduction,
    Neep_createDeliver as createDeliver,
    Neep_isDeliver as isDeliver,
    Neep_ScopeSlot as ScopeSlot,
    Neep_SlotRender as SlotRender,
    Neep_Slot as Slot,
    Neep_Value as Value,
    Neep_Container as Container,
    Neep_Template as Template,
    Neep_Fragment as Fragment,
    Neep_ref as ref,
    Neep_value as value,
    Neep_computed as computed,
    Neep_isValue as isValue,
    Neep_encase as encase,
    Neep_recover as recover,
    Neep_valueify as valueify,
    Neep_asValue as asValue,
    Neep_watch as watch,
    Neep_useValue as useValue,
    Neep_useService as useService,
    Neep_byService as byService,
    Neep_hook as hook,
    Neep_expose as expose,
    Neep_isElement as isElement,
    Neep_isSimpleTag as isSimpleTag,
    Neep_isSimpleElement as isSimpleElement,
    Neep_createElement as createElement,
    Neep_elements as elements,
    Neep_equal as equal,
    Neep_label as label,
    Neep_getRect as getRect,
    Neep_current as current,
    Neep_checkCurrent as checkCurrent,
    Neep_addContextConstructor as addContextConstructor,
    Neep_addEntityConstructor as addEntityConstructor,
    Neep_refresh as refresh,
    Neep_Mark as Mark,
    Neep_mName as mName,
    Neep_mType as mType,
    Neep_mSimple as mSimple,
    Neep_mNative as mNative,
    Neep_mRender as mRender,
    Neep_mConfig as mConfig,
    Neep_mComponent as mComponent,
    Neep_create as create,
    Neep_mark as mark,
    EntityObject$1 as EntityObject,
    ComponentEntity$1 as ComponentEntity,
    ContainerEntity$1 as ContainerEntity,
    Neep_Devtools as Devtools,
    Neep_Hook as Hook,
    Neep_NeepNode as NeepNode,
    Neep_SlotFn as SlotFn,
    Neep_Slots as Slots,
    Neep_Emit as Emit,
    Neep_EventSet as EventSet,
    Neep_On as On,
    Neep_ContextConstructor as ContextConstructor,
    Neep_EntityConstructor as EntityConstructor,
    Neep_Hooks as Hooks,
    Neep_Exposed as Exposed,
    Neep_Delivered as Delivered,
    Neep_RootExposed as RootExposed,
    Neep_Deliver as Deliver,
    Neep_Context as Context,
    Neep_Entity as Entity,
    Neep_Render as Render,
    Neep_Service as Service,
    Neep_Marks as Marks,
    Neep_Component as Component,
    Neep_Tag as Tag,
    Neep_Ref as Ref,
    Neep_RefSet as RefSet,
    Neep_RefValue as RefValue,
    Neep_NeepElement as NeepElement,
    Neep_TreeNode as TreeNode,
    Neep_MountedNode as MountedNode,
    Neep_NativeElement as NativeElement,
    Neep_NativeText as NativeText,
    Neep_NativePlaceholder as NativePlaceholder,
    Neep_NativeComponent as NativeComponent,
    Neep_NativeShadow as NativeShadow,
    Neep_NativeContainer as NativeContainer,
    Neep_NativeNode as NativeNode,
    Neep_MountProps as MountProps,
    Neep_Rect as Rect,
    Neep_IRender as IRender,
    Neep_ElementIteratorOptions as ElementIteratorOptions,
    Neep_typeSymbol as typeSymbol,
    Neep_nameSymbol as nameSymbol,
    Neep_renderSymbol as renderSymbol,
    Neep_componentsSymbol as componentsSymbol,
    Neep_configSymbol as configSymbol,
    Neep_objectTypeSymbol as objectTypeSymbol,
    Neep_objectTypeSymbolElement as objectTypeSymbolElement,
    Neep_objectTypeSymbolDeliver as objectTypeSymbolDeliver,
    Neep_deliverKeySymbol as deliverKeySymbol,
    Neep_deliverDefaultSymbol as deliverDefaultSymbol,
    Neep_setHook as setHook,
    Neep_callHook as callHook,
  };
}

export default Neep;
export { Component, ComponentEntity$1 as ComponentEntity, Container, ContainerEntity$1 as ContainerEntity, Context, ContextConstructor, Deliver, Delivered, Devtools, ElementIteratorOptions, Emit, Entity, EntityConstructor, EntityObject$1 as EntityObject, NeepError as Error, EventEmitter, EventSet, Exposed, Fragment, Hook, Hooks, IRender, Mark, Marks, MountProps, MountedNode, NativeComponent, NativeContainer, NativeElement, NativeNode, NativePlaceholder, NativeShadow, NativeText, NeepElement, NeepNode, On, Rect, Ref, RefSet, RefValue, Render, RootExposed, ScopeSlot, Service, Slot, SlotFn, SlotRender, Slots, Tag, Template, TreeNode, Value, addContextConstructor, addEntityConstructor, byService, callHook, checkCurrent, componentsSymbol, configSymbol, create, createDeliver, createElement, current, deliverDefaultSymbol, deliverKeySymbol, elements, equal, expose, getRect, hook, install, isDeliver, isElement, isProduction, isSimpleElement, isSimpleTag, label, lazy, mComponent, mConfig, mName, mNative, mRender, mSimple, mType, mark, nameSymbol, objectTypeSymbol, objectTypeSymbolDeliver, objectTypeSymbolElement, ref, refresh, register, render, renderSymbol, setHook, typeSymbol, useService, useValue, version, watch };
