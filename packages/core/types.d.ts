/*!
 * Neep v0.1.0-alpha.16
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
import * as _mp_rt1_monitorable__ from 'monitorable';
import { Value, WatchCallback, value, computed, isValue, encase, valueify, asValue, mixValue, defineProperty, ReadMap, ObserveOptions, ExecOptions, ExecResult, MonitorOptions, Monitored, CancelWatch, ComputedOptions, Valueify, AsValue, DeValue, EnValue } from 'monitorable';
export { AsValue, CancelWatch, ComputedOptions, DeValue, EnValue, ExecOptions, ExecResult, MonitorOptions, Monitored, ObserveOptions, ReadMap, Value, Valueify, WatchCallback, asValue, computed, defineProperty, encase, isValue, mixValue, value, valueify } from 'monitorable';

declare const ScopeSlot = "core:scopeslot";
declare const Render = "core:render";
declare const Slot = "core:slot";
declare const Container = "core:container";
declare const Template = "template";
declare const Fragment = "template";

declare const _mp_rt1____auxiliary_tags___ScopeSlot: typeof ScopeSlot;
declare const _mp_rt1____auxiliary_tags___Render: typeof Render;
declare const _mp_rt1____auxiliary_tags___Slot: typeof Slot;
declare const _mp_rt1____auxiliary_tags___Container: typeof Container;
declare const _mp_rt1____auxiliary_tags___Template: typeof Template;
declare const _mp_rt1____auxiliary_tags___Fragment: typeof Fragment;
declare namespace _mp_rt1____auxiliary_tags__ {
  export {
    _mp_rt1____auxiliary_tags___ScopeSlot as ScopeSlot,
    _mp_rt1____auxiliary_tags___Render as Render,
    _mp_rt1____auxiliary_tags___Slot as Slot,
    _mp_rt1____auxiliary_tags___Container as Container,
    _mp_rt1____auxiliary_tags___Template as Template,
    _mp_rt1____auxiliary_tags___Fragment as Fragment,
  };
}

declare const rendererSymbol: unique symbol;
declare const nameSymbol: unique symbol;
declare const componentsSymbol: unique symbol;
declare const propsSymbol: unique symbol;
declare const componentValueSymbol: unique symbol;
declare const objectTypeSymbol: unique symbol;
declare const objectTypeSymbolElement = "$$$objectType$$$Element";
declare const objectTypeSymbolDeliverComponent = "$$$objectType$$$DeliverComponent";
declare const objectTypeSymbolNativeComponent = "$$$objectType$$$NativeComponentNode";
declare const objectTypeSymbolSimpleComponent = "$$$objectType$$$SimpleComponent";
declare const objectTypeSymbolShellComponent = "$$$objectType$$$ShellComponent";
declare const objectTypeSymbolRenderComponent = "$$$objectType$$$RenderComponent";
declare const objectTypeSymbolContainerComponent = "$$$objectType$$$ContainerComponent";
declare const objectTypeSymbolElementComponent = "$$$objectType$$$ElementComponent";
declare const objectTypeSymbolHookEntity = "$$$objectType$$$HookEntity";
declare const objectTypeSymbolRootEntity = "$$$objectType$$$RootEntity";
declare const deliverKeySymbol: unique symbol;
declare const deliverDefaultSymbol: unique symbol;

declare class EventEmitter<T, E extends Record<string, any> = Record<string, any>> {
    private readonly _names;
    get names(): (keyof E)[];
    readonly events: Record<string, Set<Listener<T, any>> | undefined>;
    readonly emit: Emit<E>;
    readonly on: On<T, E>;
    target?: T;
    constructor();
    private readonly __propsEvents;
    private readonly __eventMap;
    private readonly __propsEmitEvents;
    private __propsEmitEvent?;
    updateInProps(props: any): void;
}

interface EmitOptions {
    options?: boolean;
    cancelable?: boolean;
}
declare type EmitProps<T> = undefined extends T ? [] | [T] : void extends T ? [] | [T] : never extends T ? [] | [T] : [T];
interface Emit<T extends Record<string, any> = Record<string, any>> {
    <N extends keyof T & string>(name: N, ...p: EmitProps<T[N]>): boolean;
    <N extends keyof T & string>(name: N, p: T[N]): boolean;
    omit(...names: string[]): Emit;
    readonly names: (keyof T)[];
}
interface EventSet {
    [key: string]: (...p: any[]) => void;
}
interface EventInfo<T> {
    readonly target: any;
    readonly cancelable: boolean;
    readonly defaultPrevented: boolean;
    readonly prevented: boolean;
    preventDefault(): void;
    prevent(): void;
}
interface Listener<T, P> {
    (p: P, event: EventInfo<T>): void;
}
interface On<T, E extends Record<string, any>> {
    <N extends keyof E & string>(name: N, listener: Listener<T, E[N]>): () => void;
}
declare type EventEmitter$1<T, E extends Record<string, any>> = EventEmitter<T, E>;

/** 全局钩子 */
interface Hook<T extends HookEntity<any, any> = HookEntity<any, any>> {
    (entity: T): void;
}
declare type HookNames = 'beforeCreate' | 'created' | 'beforeDestroy' | 'destroyed' | 'beforeUpdate' | 'updated' | 'beforeMount' | 'mounted' | 'beforeDraw' | 'drawn' | 'beforeDrawAll' | 'drawnAll';

interface UseHook {
    lib: string;
    name: string;
    value?: any;
    list?: UseHook[];
}

declare abstract class RefProxy<TExposed extends object | Function, TTag, TEntity extends Entity<any, any>> extends BaseProxy<TTag> {
    /** 组件暴露值 */
    private __exposed?;
    /** 组件暴露值 */
    private __ref?;
    get exposed(): TExposed | undefined;
    setExposed(t?: TExposed): void;
    readonly events: EventEmitter<TEntity>;
    /** 组件实体 */
    readonly entity: TEntity;
    readonly data: Record<string, any>;
    constructor(renderer: IRenderer, originalTag: any, tag: any, attrs: any, parent?: BaseProxy<any>, delivered?: Record<any, any>);
    /** 创建 */
    protected abstract createEntity(events: EventEmitter<any>): TEntity;
    /** 更新属性及子代 */
    update(attrs: Record<string, any>, children: any[]): void;
    destroy(): boolean;
}

interface IRender {
    render(): any[];
    nodes: any[];
    stopRender(): void;
}
declare abstract class ComponentProxy<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends StandardComponent<TProps, TExpose, TEmit> | RenderComponent<TProps, TExpose, TEmit>> extends RefProxy<TExpose, C, ComponentEntity<C>> {
    isNative: boolean;
    /** 所属容器 */
    readonly container: ContainerProxy<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    readonly componentRoot?: ComponentProxy<any, any, any, any>;
    /** 子组件 */
    readonly children: Set<ComponentProxy<any, any, any, any>>;
    readonly emit: Emit<Record<string, any>>;
    readonly on: On<TExpose | undefined, Record<string, any>>;
    readonly components: Record<string, StandardComponent<any, any, any>>;
    /** 组件属性 */
    readonly props: TProps;
    /** 组件属性定义 */
    readonly propsDefined: (keyof TProps & string)[];
    /** 组件槽 */
    readonly slots: Slots;
    lastSlots: Record<string | symbol, any[]> | undefined;
    /** 原生子代 */
    nativeNodes: TreeNodeList | undefined;
    /** 父组件代理 */
    readonly parentComponentProxy?: ComponentProxy<any, any, any, any>;
    callHook(id: string): void;
    /** 结果渲染函数 */
    protected _render: () => any[];
    /** 结果渲染函数 */
    protected readonly _stopRender: () => void;
    protected abstract _init(): void;
    protected abstract _initRender(): IRender;
    /** 结果渲染函数 */
    constructor(originalTag: any, component: C, props: object, children: any[], parent: BaseProxy<any>);
    createEntity(events: EventEmitter<any>): ComponentEntity<C>;
    /** 更新属性及子代 */
    _update(props: object, children: any[]): void;
    _destroy(): void;
    childNodes: any[];
    /** 是否为刷新中 */
    private __refreshing;
    /** 是否需要继续刷新 */
    private __needRefresh;
    get needRefresh(): boolean;
    /** 延时刷新计数 */
    private __delayedRefresh;
    /** 渲染结果 */
    protected _nodes: TreeNodeList;
    refresh(): void;
    refresh<T>(f: () => T): T;
    refresh<T>(f?: () => T): T | void;
    /** 刷新 */
    requestDraw(): void;
}

declare abstract class BaseProxy<TTag> {
    readonly tag: TTag;
    attrs: Record<string, any>;
    readonly renderer: IRenderer;
    labels?: Label[];
    /** 父组件 */
    readonly parentProxy?: BaseProxy<any>;
    /** 呈递值 */
    readonly delivered: Record<any, any>;
    /** 状态 */
    created: boolean;
    destroyed: boolean;
    mounted: boolean;
    unmounted: boolean;
    /** The subtree mounted on the parent node */
    tree: (MountedNode | MountedNode[])[];
    /** 所属容器 */
    abstract readonly container: ContainerProxy<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    abstract readonly componentRoot?: ComponentProxy<any, any, any, any>;
    abstract get content(): (MountedNode | MountedNode[])[];
    readonly originalTag: any;
    constructor(renderer: IRenderer, originalTag: any, tag: any, attrs: any, parent?: BaseProxy<any>, delivered?: Record<any, any>);
    /** 请求绘制 */
    protected abstract requestDraw(): void;
    abstract callHook<H extends HookNames>(id: H): void;
    abstract callHook(id: string): void;
    /** 更新属性及子代 */
    abstract _update(props: object, children: any[]): void;
    /** 更新属性及子代 */
    update(attrs: Record<string, any>, children: any[]): void;
    private __executed_destroy;
    protected abstract _destroy(): void;
    destroy(): boolean;
    private __mountOptions;
    protected abstract _mount(mountOptions: MountOptions): MountOptions | void;
    private __cancelDrawMonitor?;
    mount(mountOptions: MountOptions): boolean;
    private __executed_unmounted;
    protected abstract _unmount(): void;
    unmount(): boolean;
    protected abstract _redraw(mountOptions: MountOptions): void;
    redraw(): void;
}

declare class ContainerProxy<P extends object> extends RefProxy<any, ContainerComponent<P> | null, ContainerEntity<any>> {
    /** 所属容器 */
    readonly container: ContainerProxy<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    readonly componentRoot?: ComponentProxy<any, any, any, any>;
    setmountedRoot(target?: any, next?: any): void;
    private readonly __containerData;
    /** 组件树结构 */
    content: (MountedNode | MountedNode[])[];
    readonly rootContainer: ContainerProxy<any>;
    constructor(originalTag: any, component: ContainerComponent<P, any> | null | undefined, props: Record<string, any> | undefined, children: any[], parent?: BaseProxy<any>);
    createEntity(events: EventEmitter<any>): ContainerEntity<any>;
    private __nodes;
    setChildren(children: any[]): void;
    /** 更新属性及子代 */
    _update(props: Record<string, any>, children: any[]): void;
    _destroy(): void;
    callHook(id: string): void;
    requestDraw(): void;
    private __container;
    private __placeholder;
    private __placeholderNode;
    private __targetNode;
    private __insertNode;
    private __nextNode;
    _mount(opt: MountOptions): MountOptions | undefined;
    _redrawSelf(): void;
    _redrawChildren(opts: MountOptions): void;
    _redraw(opt: MountOptions): void;
    _unmount(): void;
    /** 等待重画的项目 */
    private __awaitDraw;
    /** 标记需要绘制的元素 */
    markDraw(proxy: BaseProxy<any>): void;
    drawContainer(): void;
    private __containers;
    markDrawContainer(container: ContainerProxy<any>): void;
    drawAll(): void;
}

declare class RenderComponentProxy<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends RenderComponent<TProps, TExpose, TEmit>> extends ComponentProxy<TProps, TExpose, TEmit, C> {
    get content(): (MountedNode | MountedNode[])[];
    /** 原生子代 */
    nativeNodes: TreeNodeList | undefined;
    protected _init(): void;
    protected _initRender(): IRender;
    _destroy(): void;
    childNodes: any[];
    /** 刷新 */
    requestDraw(): void;
    _redraw(mountOptions: MountOptions): void;
    _mount(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class StandardComponentProxy<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends StandardComponent<TProps, TExpose, TEmit>> extends ComponentProxy<TProps, TExpose, TEmit, C> {
    content: (MountedNode | MountedNode[])[];
    /** 原生组件 */
    native: NativeComponentNode | undefined;
    shadowTree: (MountedNode | MountedNode[])[];
    nativeTree: (MountedNode | MountedNode[])[];
    private _shadow;
    protected _init(): void;
    protected _initRender(): IRender;
    _destroy(): void;
    childNodes: any[];
    /** 刷新 */
    requestDraw(): void;
    private __nativeTreeNountOptions;
    _mount(mountOptions: MountOptions): MountOptions | void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare abstract class NodeProxy<TTag> extends BaseProxy<TTag> {
    /** 所属容器 */
    readonly container: ContainerProxy$1<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    readonly componentRoot?: ComponentProxy<any, any, any, any>;
    constructor(originalTag: any, tag: TTag, attrs: Record<string, any>, children: any[], parent: BaseProxy<any>, delivered?: Record<any, any>);
    requestDraw(): void;
    callHook(id: string): void;
}

declare class ValueProxy extends NodeProxy<null> {
    get content(): (MountedNode | MountedNode[])[];
    __value: any;
    text?: string | null;
    isValue?: boolean;
    set value(v: any);
    get value(): any;
    __nodes?: TreeNodeList;
    src?: any;
    /** 结果渲染函数 */
    private __render;
    constructor(attrs: any, parent: BaseProxy<any>);
    /** 是否为刷新中 */
    private __refreshing;
    /** 是否需要继续刷新 */
    private __needRefresh;
    refresh(): void;
    _update({ value }: any): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class ShellProxy<T extends ShellComponent<any, any>> extends RefProxy<any, T, ShellEntity> {
    get content(): (MountedNode | MountedNode[])[];
    props: any;
    childNodes: any[];
    src?: any;
    /** 组件槽 */
    readonly slots: Slots;
    lastSlots: Record<string | symbol, any[]> | undefined;
    /** 结果渲染函数 */
    private __render;
    /** 所属容器 */
    readonly container: ContainerProxy<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    readonly componentRoot?: ComponentProxy<any, any, any, any>;
    requestDraw(): void;
    callHook(id: string): void;
    createEntity(events: EventEmitter<any>): ShellEntity;
    constructor(originalTag: any, tag: T, props: object, children: any[], parent: BaseProxy<any>);
    /** 是否为刷新中 */
    private __refreshing;
    /** 是否需要继续刷新 */
    private __needRefresh;
    /** 延时刷新计数 */
    private __delayedRefresh;
    /** 渲染结果 */
    protected _nodes: TreeNodeList;
    refresh(): void;
    refresh<T>(f: () => T): T;
    refresh<T>(f?: () => T): T | void;
    _update(props: object, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class GroupProxy<T> extends NodeProxy<T> {
    private __nodes;
    get content(): (MountedNode | MountedNode[])[];
    constructor(tag: T, children: any[], parent: BaseProxy<any>);
    /** 更新属性及子代 */
    _update(props: object, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class ElementProxy<T extends string | ElementComponent<any, any>> extends RefProxy<NativeElementNode, T, ElementEntity<NativeElementNode>> {
    /** 所属容器 */
    readonly container: ContainerProxy<any>;
    /** 渲染组件根部，如果自身是 ComponentProxy 则为自身 */
    readonly componentRoot?: ComponentProxy<any, any, any, any>;
    props: object;
    private __nodes;
    node?: NativeElementNode;
    content: (MountedNode | MountedNode[])[];
    private __elementTagData;
    constructor(originalTag: any, tag: T, props: object, children: any[], parent: BaseProxy<any>);
    requestDraw(): void;
    callHook(id: string): void;
    createEntity(events: EventEmitter<any>): ElementEntity<NativeElementNode>;
    /** 更新属性及子代 */
    _update(props: object, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): MountOptions | void;
    _redrawChildren(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class DeliverProxy<T> extends NodeProxy<DeliverComponent<T>> {
    private __valueObject;
    private __nodes;
    get content(): (MountedNode | MountedNode[])[];
    constructor(originalTag: any, tag: DeliverComponent<T>, props: {
        value?: T;
    }, children: any[], parent: BaseProxy<any>);
    /** 更新属性及子代 */
    _update({ value }: {
        value?: T;
    }, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare const NativeElementSymbol: unique symbol;
declare const NativeTextSymbol: unique symbol;
declare const NativeComponentSymbol: unique symbol;
declare const NativePlaceholderSymbol: unique symbol;
declare const NativeShadowSymbol: unique symbol;
/** 原生元素节点 */
interface NativeElementNodes {
    core: {
        [NativeElementSymbol]: true;
    };
}
/** 原生文本节点 */
interface NativeTextNodes {
    core: {
        [NativeTextSymbol]: true;
    };
}
/** 原生占位组件 */
interface NativePlaceholderNodes {
    core: {
        [NativePlaceholderSymbol]: true;
    };
}
/** 原生组件 */
interface NativeComponentNodes {
    core: {
        [NativeComponentSymbol]: true;
    };
}
/** 原生组件内部 */
interface NativeShadowNodes {
    core: {
        [NativeShadowSymbol]: true;
    };
}
/** 原生元素节点 */
declare type NativeElementNode = ValueOf<NativeElementNodes>;
/** 原生文本节点 */
declare type NativeTextNode = ValueOf<NativeTextNodes>;
/** 原生占位组件 */
declare type NativePlaceholderNode = ValueOf<NativePlaceholderNodes>;
/** 原生组件 */
declare type NativeComponentNode = ValueOf<NativeComponentNodes>;
/** 原生组件内部 */
declare type NativeShadowNode = ValueOf<NativeShadowNodes>;
declare type ValueOf<T extends object> = T[keyof T];
declare type NativeContainerNode = NativeElementNode | NativeComponentNode | NativeShadowNode;
declare type NativeNode = NativeContainerNode | NativeTextNode | NativePlaceholderNode;
interface Rect {
    readonly bottom: number;
    readonly height: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly width: number;
}
declare type MountOptions = Record<string, any>;
interface MountContainerResult {
    container: NativeContainerNode;
    target: NativeContainerNode | null;
    insert: NativeNode | null;
    next: NativeNode | null;
    exposed: any;
}
interface UpdateContainerResult {
    target: NativeContainerNode | null;
    insert: NativeNode | null;
    next: NativeNode | null;
}
interface IRenderer<T = any> {
    type: string;
    nextFrame?(this: this, fn: () => void): void;
    getContainer(this: this, container: NativeContainerNode, target: any, next: any): [NativeContainerNode | null, NativeNode | null];
    /**
     * 创建挂载容器组件
     * @param data 创建数据
     * @param props 创建参数
     * @param parent 父渲染器
     */
    mountContainer(this: this, data: T, props: Record<string, any>, emit: Emit<Record<string, any>>, parent: IRenderer | undefined): MountContainerResult;
    updateContainer(this: this, container: NativeContainerNode, target: NativeContainerNode | null, insert: NativeNode | null, next: NativeNode | null, data: T, props: Record<string, any>, emit: Emit<Record<string, any>>, parent: IRenderer | undefined): UpdateContainerResult;
    recoveryContainer(this: this, container: NativeContainerNode, target: NativeContainerNode | null, insert: NativeNode | null, next: NativeNode | null, newTarget: NativeContainerNode | null, newInsert: NativeNode | null, newNext: NativeNode | null, data: T, props: Record<string, any>, parent: IRenderer | undefined): void;
    unmountContainer(this: this, container: NativeContainerNode, target: NativeContainerNode | null, insert: NativeNode | null, next: NativeNode | null, data: T, props: Record<string, any>, parent: IRenderer | undefined): void;
    getMountOptions(this: this, node: NativeNode, options: MountOptions): MountOptions | undefined | void;
    isNode(this: this, v: any): v is NativeNode;
    createElement(this: this, data: string | T, props: Record<string, any>, mountOptions: MountOptions): NativeElementNode | null;
    updateProps(this: this, node: NativeElementNode, data: string | T, props: Record<string, any>, emit: Emit<Record<string, any>>, mountOptions: MountOptions): void;
    createText(this: this, text: string): NativeTextNode;
    createPlaceholder(this: this): NativePlaceholderNode;
    createComponent?(this: this): [NativeComponentNode, NativeShadowNode];
    getParent(this: this, node: NativeNode): NativeContainerNode | null;
    nextNode(this: this, node: NativeNode): NativeNode | null;
    insertNode(this: this, parent: NativeContainerNode, node: NativeNode, next?: NativeNode | null): void;
    removeNode(this: this, n: NativeNode): void;
}

declare type BaseProxy$1<TTag> = BaseProxy<TTag>;
declare type RefProxy$1<TExposed extends object, TTag, TEntity extends Entity<any, any>> = RefProxy<TExposed, TTag, TEntity>;
declare type NodeProxy$1<TTag> = NodeProxy<TTag>;
declare type DeliverProxy$1<T> = DeliverProxy<T>;
declare type ElementProxy$1<T extends string> = ElementProxy<T>;
declare type GroupProxy$1<T> = GroupProxy<T>;
declare type ShellProxy$1<T extends ShellComponent<any, any>> = ShellProxy<T>;
declare type ValueProxy$1 = ValueProxy;
declare type ComponentProxy$1<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends StandardComponent<TProps, TExpose, TEmit>> = ComponentProxy<TProps, TExpose, TEmit, C>;
declare type StandardComponentProxy$1<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends StandardComponent<TProps, TExpose, TEmit>> = StandardComponentProxy<TProps, TExpose, TEmit, C>;
declare type RenderComponentProxy$1<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, C extends StandardComponent<TProps, TExpose, TEmit>> = RenderComponentProxy<TProps, TExpose, TEmit, C>;
declare type ContainerProxy$1<P extends object> = ContainerProxy<P>;
interface Devtools {
    renderHook(rootEntity: RootEntity<any>, container: ContainerProxy$1<any>): void;
}
interface Label {
    text: string;
    color?: string;
}
interface ValueElement {
    /** 标签名 */
    tag?: undefined;
    /** 属性 */
    props: {
        value: any;
    };
    /** 子节点 */
    children?: any[];
    /** 插槽 */
    slot?: undefined;
    /** 列表对比 key */
    key: any;
    /** 是否是已插入的 */
    inserted?: undefined;
    execed?: undefined;
}
declare type TreeNodeList = (TreeNode | null | TreeNode[])[];
interface TreeNode {
    proxy: BaseProxy$1<any>;
    /** 标签名 */
    tag?: Tag<any> | undefined;
    /** 属性 */
    props?: {
        [key: string]: any;
    };
    /** 列表对比 key */
    key?: any;
}
interface ProxyMountedNode extends TreeNode {
    node?: undefined;
}
interface ValueMountedNode {
    tag?: undefined | null;
    text?: string;
    key?: any;
    proxy?: undefined;
    children?: undefined;
    node: NativeNode;
}
/**
* @description node / component / children 至少一个有效
*/
declare type MountNode = ProxyMountedNode | ValueMountedNode;
declare type MountedNode = MountNode & {
    id: number;
};

interface Entity<T, TEmit extends Record<string, any>> {
    readonly exposed?: T;
    data: Record<string, any>;
    readonly on: On<T, TEmit>;
    readonly emit: Emit<TEmit>;
}
interface ElementEntity<T, TEmit extends Record<string, any> = Record<string, any>> extends Entity<T, TEmit> {
}
interface ShellEntity<TEmit extends Record<string, any> = Record<string, any>> extends Entity<undefined, TEmit> {
}
interface HookEntity<T, TEmit extends Record<string, any> = Record<string, any>, THE extends HookEntity<any> = HookEntity<any, any, any>> extends Entity<T, TEmit> {
    [objectTypeSymbol]: typeof objectTypeSymbolHookEntity;
    callHook<H extends HookNames>(hook: H): void;
    callHook(hook: string): void;
    setHook<H extends HookNames>(id: H, hook: Hook<THE>): () => void;
    setHook(id: string, hook: Hook<this>): () => void;
    readonly $_hooks: {
        [name: string]: Set<Hook>;
    };
}
interface ComponentEntity<C extends StandardComponent<any, any, any> | RenderComponent<any, any, any>, Parent extends ComponentEntity<any, any> | undefined | never = ComponentEntity<any, any> | undefined> extends HookEntity<C extends StandardComponent<any, infer E, any> ? E : C extends RenderComponent<any, infer E, any> ? E : any, C extends StandardComponent<any, any, infer E> ? E : C extends RenderComponent<any, any, infer E> ? E : any, ComponentEntity<any, any>> {
    readonly component: C;
    readonly parent: Parent;
    readonly created: boolean;
    readonly destroyed: boolean;
    readonly mounted: boolean;
    readonly unmounted: boolean;
    refresh(): void;
    refresh<T>(f: () => T, async?: false): T;
    refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
    refresh<T>(f: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T;
    refresh<T>(f?: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T | undefined;
    readonly $_useHookValues: UseHook[];
    /** Only the development mode is valid */
    readonly $_label?: Label[];
}
interface EntityConstructor {
    (entity: ComponentEntity<any>): void;
}
interface ContainerEntity<T, TEmit extends Record<string, any> = Record<string, any>> extends HookEntity<undefined, TEmit, ContainerEntity<any, any>> {
    readonly created: boolean;
    readonly destroyed: boolean;
    readonly mounted: boolean;
    readonly unmounted: boolean;
}
interface RootEntity<T, TEmit extends Record<string, any> = Record<string, any>> extends ContainerEntity<T, TEmit> {
    update(node?: Element | StandardComponent<any, any, any>): this;
    mount(target?: any): this;
    unmount(): void;
}

/** 槽列表 */
interface Slots {
    readonly [name: string]: any[] | undefined;
}
interface SlotApi {
    (name?: string, argv?: any): Element;
    has(name?: string): boolean;
}

interface Delivered {
    <T>(d: DeliverComponent<T>): T;
}
/** 上下文环境 */
interface Context<TExpose extends object, TEmit extends Record<string, any>, Parent extends ComponentEntity<any, any>> {
    isShell: boolean;
    delivered: Delivered;
    refresh(fn?: () => void): void;
    childNodes: any[];
    emit: Emit<TEmit>;
    /** 作用域槽 */
    slot: SlotApi;
    /** 父组件 */
    parent?: Parent;
    expose?(value?: TExpose): void;
    /** 是否已经完成初始化 */
    created?: boolean;
    /** 子组件集合 */
    children?: object[];
}
/** 上下文环境 */
interface ShellContext<TEmit extends Record<string, any>, Parent extends ComponentEntity<any, any> = ComponentEntity<any, any>> extends Context<never, TEmit, Parent> {
    isShell: true;
    expose?: undefined;
    /** 是否已经完成初始化 */
    created?: undefined;
    /** 子组件集合 */
    children?: undefined;
}
/** 上下文环境 */
interface ComponentContext<TExpose extends object, TEmit extends Record<string, any>, Parent extends ComponentEntity<any, any> = ComponentEntity<any, any>> extends Context<TExpose, TEmit, Parent> {
    isShell: false;
    expose(value?: TExpose): void;
    /** 是否已经完成初始化 */
    created: boolean;
    /** 子组件集合 */
    children: object[];
}
interface ContextConstructor {
    (context: ShellContext<any>): void;
    (context: ComponentContext<any, any>, entity?: ComponentEntity<any>): void;
    (context: Context<any, any, any>, entity?: ComponentEntity<any>): void;
}

interface SelfComponent<TProps extends object> {
    (props: TProps): Element<this>;
}
interface PropsDefinition {
    value?: 'mix' | 'always' | 'valueify';
}
/** 构造函数 */
interface ComponentFunc<TProps extends object, TExpose extends object, TEmit extends Record<string, any>> {
    (props: TProps, context: ComponentContext<TExpose, TEmit>): Node;
}
interface SimpleComponentFunc<TProps extends object, TEmit extends Record<string, any>> {
    (props: TProps, context: ShellContext<TEmit>): Node;
}
interface ShellComponentFunc<TProps extends object, TEmit extends Record<string, any>> {
    (props: TProps, context: ShellContext<TEmit>): Node;
}
interface SpecialComponentFunc<P extends object, C extends any[]> {
    (attrs: P, ...children: C): Node;
}
interface DeliverComponent<T> extends SelfComponent<{
    value?: T;
}> {
    readonly [objectTypeSymbol]: typeof objectTypeSymbolDeliverComponent;
    readonly [deliverKeySymbol]: symbol;
    readonly [deliverDefaultSymbol]: T;
}
interface RenderComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>> extends SelfComponent<TProps> {
    readonly [objectTypeSymbol]: typeof objectTypeSymbolRenderComponent;
    readonly [componentValueSymbol]: ComponentFunc<TProps, TExpose, TEmit>;
    readonly [nameSymbol]?: string;
    readonly [componentsSymbol]?: Record<string, Component<any>>;
    readonly [propsSymbol]?: (keyof TProps)[];
}
interface ContainerComponent<P extends object, T = any> extends SelfComponent<P> {
    readonly [objectTypeSymbol]: typeof objectTypeSymbolContainerComponent;
    readonly [componentValueSymbol]: T;
    readonly [nameSymbol]?: string;
    readonly [rendererSymbol]?: string | IRenderer;
}
interface ElementComponent<P extends object, T> extends SelfComponent<P> {
    readonly [objectTypeSymbol]: typeof objectTypeSymbolElementComponent;
    readonly [componentValueSymbol]: T;
    readonly [nameSymbol]?: string;
}
interface StandardComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>> extends ComponentFunc<TProps, TExpose, TEmit> {
    /** 组件名称 */
    [nameSymbol]?: string;
    [componentsSymbol]?: Record<string, Component<any>>;
    [objectTypeSymbol]?: typeof objectTypeSymbolNativeComponent;
    [propsSymbol]?: (keyof TProps)[];
}
interface NativeComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>> extends StandardComponent<TProps, TExpose, TEmit> {
    [objectTypeSymbol]: typeof objectTypeSymbolNativeComponent;
}
interface SimpleComponent<TProps extends object, TEmit extends Record<string, any>> extends SimpleComponentFunc<TProps, TEmit> {
    [objectTypeSymbol]: typeof objectTypeSymbolSimpleComponent;
    /** 组件名称 */
    [nameSymbol]?: string;
    [componentsSymbol]?: Record<string, Component<any>>;
}
interface ShellComponent<TProps extends object, TEmit extends Record<string, any>> extends ShellComponentFunc<TProps, TEmit> {
    [objectTypeSymbol]: typeof objectTypeSymbolShellComponent;
    /** 组件名称 */
    [nameSymbol]?: string;
}
declare type Component<P extends object = any> = StandardComponent<P, any, any> | SimpleComponent<P, any> | ShellComponent<P, any> | ContainerComponent<P> | ElementComponent<P, any> | DeliverComponent<P extends {
    value?: infer T;
} ? T : any>;
interface Service<T, P extends any[]> {
    (entity: ComponentEntity<any, any>, ...p: P): T;
}

declare type Tags = typeof _mp_rt1____auxiliary_tags__;
declare type CoreTags = Tags[keyof Tags];
declare type Tag<P extends object> = string | CoreTags | Component<P> | RenderComponent<P, any, any>;
interface Element<T extends Tag<any> = Tag<any>> {
    [objectTypeSymbol]: typeof objectTypeSymbolElement;
    /** 标签名 */
    tag: T;
    /** 属性 */
    props?: {
        [key: string]: any;
    };
    /** 子节点 */
    children: any[];
    /** 插槽 */
    slot?: string;
    /** 列表对比 key */
    key?: any;
    /** 槽是否是已插入的 */
    inserted?: boolean;
    /** 是否为槽默认值 */
    isDefault?: boolean;
    /** 简单组件，是否是已经执行的 */
    execed?: boolean;
}
interface ElementIteratorOptions {
    simple?: boolean | SimpleComponent<any, any>[] | ((c: SimpleComponent<any, any>) => boolean);
}
/** source 对象 */
declare type Node = Element | null;

interface Recognizer {
    (any: any): Component<any> | null;
}

interface Ref<TExposed extends object | Function, TEntity extends Entity<any, any>> {
    (newNode: TExposed | undefined, oldNode: TExposed | undefined, entity: TEntity, 
    /**
     * true: 添加
     * false: 移除
     */
    state?: boolean): void;
}
interface RefSet<T extends object> {
    add(value: T): void;
    delete(value: T): void;
    replace?(newNode: T, oldNode: T): void;
}
interface RefValue<T extends object> extends Ref<T, any> {
    readonly value: T | null;
}
interface RefEntityValue<T extends Entity<any, any>> extends Ref<any, T> {
    readonly value: T | null;
}

declare function ref<T extends object>(watch?: boolean, isEntity?: false): RefValue<T>;
declare function ref<T extends Entity<any, any>>(watch: boolean, isEntity: true): RefEntityValue<T>;
declare function ref<T extends object>(set: RefSet<T>, isEntity?: false): Ref<T, any>;
declare function ref<T extends Entity<any, any>>(set: RefSet<T>, isEntity: true): Ref<any, T>;

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
declare function watch<T>(value: Value<T>, cb: WatchCallback<T>, run?: boolean): () => void;
/**
 * 监听指定值的变化
 * @description 本质是创建调用 Value 对象的 watch 方法
 * @description 但是通过此方法进行的观察，会在组件生命周期结束时自动停止观察
 * @description 此函数只有在初始化调用时有效
 * @param value 用于计算观测值的函数
 * @param cb    当监听的值发送变化时调用的函数
 */
declare function watch<T>(value: () => T, cb: (v: T, stopped: boolean) => void, run?: boolean): () => void;
declare function useValue(): Value<any>;
declare function useValue<T>(fn: () => T): T;
declare function useValue<T>(fn?: () => T): T | Value<any>;
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
declare function hook<H extends HookNames>(name: H, hook: () => void, initOnly?: boolean): undefined | (() => void);
declare function hook(name: string, hook: () => void, initOnly?: boolean): undefined | (() => void);

/**
 * 判读是否为元素
 */
declare function isElement(v: any): v is Element;
declare function isFragmentElement(v: any): v is Element<'template'>;
declare function isRenderElement(v: any): v is Element<typeof Render>;
declare function isSimpleElement(v: any): boolean;
declare function createElement<T extends DeliverComponent<any>>(tag: T, attrs?: (T extends DeliverComponent<infer P> ? {
    value: P;
} : never), ...children: any[]): Element;
declare function createElement<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(tag: T, attrs?: P, ...children: any[]): Element;
declare function createElement<T extends string>(tag: T, attrs?: Record<string, any>, ...children: any[]): Element;
declare function createElement(tag: any, attrs?: Record<string, any> | null, ...children: any[]): Element;
declare function createElementBase<T extends DeliverComponent<any>>(tag: T, attrs?: (T extends DeliverComponent<infer P> ? {
    value: P;
} : never), ...children: any[]): Element;
declare function createElementBase<P extends object, T extends Component<P> | RenderComponent<P, any, any>>(tag: T, attrs?: P, ...children: any[]): Element;
declare function createElementBase<T extends string>(tag: T, attrs?: Record<string, any>, ...children: any[]): Element;
declare function createElementBase<T extends Tag<any>>(tag: T, attrs?: Record<string, any> | null, ...children: any[]): Element;
declare function createRenderElement(render: (_?: any) => Node, { slot, key }?: {
    slot?: string;
    key?: string;
}): Element;
declare function elements(node: any, opt?: ElementIteratorOptions): any[];
declare function equal(a: any, b: any): boolean;
declare function createTemplateElement(...children: any[]): Element;

declare function label(...label: (string | Label)[]): void;

interface Attributes<T extends object> {
    slot?: string;
    'n:ref'?: Ref<T, Entity<any, any>>;
    'n-ref'?: Ref<T, Entity<any, any>>;
    '@'?: Emit | EventSet;
    'n:on'?: Emit | EventSet;
    'n-on'?: Emit | EventSet;
}
interface NativeAttributes extends Attributes<any> {
    id?: string | Value<string>;
    class?: string | Value<string>;
}
interface ClassAttributes<T> extends Attributes<T & object> {
}
interface SlotAttr {
    name?: string;
}
interface ScopeSlotAttr {
    name?: string;
    render?(...params: any[]): Node | Node[];
}
interface SlotRenderAttr {
}
interface CoreIntrinsicElements {
    [Slot]: SlotAttr & ScopeSlotAttr;
    [Render]: SlotRenderAttr;
    [ScopeSlot]: ScopeSlotAttr;
    slot: SlotAttr;
}
declare type NeepElement = Element;
declare global {
    namespace JSX {
        interface IntrinsicAttributes extends NativeAttributes {
        }
        interface IntrinsicClassAttributes<T> extends ClassAttributes<T> {
        }
        interface Element extends NeepElement {
        }
        interface IntrinsicElements extends CoreIntrinsicElements {
            [k: string]: any;
        }
    }
}

interface InstallOptions {
    monitorable?: typeof _mp_rt1_monitorable__;
    renderer?: IRenderer;
    devtools?: Devtools;
}
declare function install(apis: InstallOptions): void;

declare class NeepError extends Error {
    readonly tag: string;
    constructor(message: string, tag?: string);
}

declare function render(e?: Element | Component<any>, p?: Record<string, any>): RootEntity<any>;

declare function register(name: string, component: Component<any>): void;

declare function getNode(id: number | NativeNode): MountNode | undefined;

declare type Render$1<TObject extends object, TExpose extends object, TEmit extends Record<string, any>> = ((params: TObject, context: ComponentContext<TExpose, TEmit>) => Node) | RenderComponent<TObject, TExpose, TEmit>;
interface Options<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, TObject extends object> {
    name?: string;
    components?: Record<string, Component<any>>;
    render?: Render$1<TObject, TExpose, TEmit>;
    props?: (keyof TProps)[];
}
declare function createDeliverComponent<T>(def: T): DeliverComponent<T>;
declare function createDeliverComponent<T>(def?: T): DeliverComponent<T | undefined>;
declare function createDeliverComponent<T, D>(def: D): DeliverComponent<T | D>;
declare function createRenderComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>>(f: ComponentFunc<TProps, TExpose, TEmit>, { name, components }?: {
    name?: string;
    components?: Record<string, Component<any>>;
}): RenderComponent<TProps, TExpose, TEmit>;
declare function createContainerComponent<P extends object, T = any>(value: T, { name, renderer }?: {
    name?: string;
    renderer?: string | IRenderer;
}): ContainerComponent<P, T>;
declare function createElementComponent<P extends object, T>(value: T, { name }?: {
    name?: string;
}): ElementComponent<P, T>;
declare function createStandardComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>>(f: ComponentFunc<TProps, TExpose, TEmit>, options?: Options<TProps, TExpose, TEmit, never> & {
    render?: undefined;
}): StandardComponent<TProps, TExpose, TEmit>;
declare function createStandardComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, TObject extends object>(f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject, options: Options<TProps, TExpose, TEmit, TObject> & {
    render: Render$1<TObject, TExpose, TEmit>;
}): StandardComponent<TProps, TExpose, TEmit>;
declare function createNativeComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>>(f: ComponentFunc<TProps, TExpose, TEmit>, options: Options<TProps, TExpose, TEmit, never> & {
    render?: undefined;
}): NativeComponent<TProps, TExpose, TEmit>;
declare function createNativeComponent<TProps extends object, TExpose extends object, TEmit extends Record<string, any>, TObject extends object>(f: (props: TProps, context: ComponentContext<TExpose, TEmit>) => TObject, options: Options<TProps, TExpose, TEmit, TObject> & {
    render: Render$1<TObject, TExpose, TEmit>;
}): NativeComponent<TProps, TExpose, TEmit>;
declare function createSimpleComponent<TProps extends object, TEmit extends Record<string, any>>(f: SimpleComponentFunc<TProps, TEmit>, { name, components }?: {
    name?: string;
    components?: Record<string, Component<any>>;
}): SimpleComponent<TProps, TEmit>;
declare function createShellComponent<TProps extends object, TEmit extends Record<string, any>>(f: ShellComponentFunc<TProps, TEmit>, { name }?: {
    name?: string;
}): ShellComponent<TProps, TEmit>;

declare function isSimpleComponent(v: any): v is SimpleComponent<any, any>;
declare function isShellComponent(v: any): v is ShellComponent<any, any>;
declare function isNativeComponent(v: any): v is NativeComponent<any, any, any>;
declare function isRenderComponent(v: any): v is RenderComponent<any, any, any>;
declare function isContainerComponent(v: any): v is ContainerComponent<any, any>;
declare function isElementComponent(v: any): v is ElementComponent<any, any>;
declare function isDeliverComponent(v: any): v is DeliverComponent<any>;

declare function lazy<P extends object, C extends Component<P>>(component: () => Promise<C | {
    default: C;
}>, Placeholder?: Component<{
    loading: boolean;
}>): SimpleComponent<P, any>;

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

declare function setHook<H extends HookNames, T extends HookEntity<any, any>>(id: H, hook: Hook<T>, entity: T): () => void;
declare function setHook<T extends HookEntity<any, any>>(id: string, hook: Hook<T>, entity: T): () => void;
declare function setHook<H extends HookNames>(id: H, hook: Hook, entity?: HookEntity<any, any>): () => void;
declare function setHook(id: string, hook: Hook, entity?: HookEntity<any, any>): () => void;
declare function callHook<H extends HookNames>(id: H, entity: ComponentEntity<any, any> | ContainerEntity<any>): void;
declare function callHook(id: string, entity: ComponentEntity<any, any> | ContainerEntity<any>): void;

/** 当前正在执行的对象 */
declare let current: ComponentEntity<any, any> | undefined;
declare function execUseHooks<T>(name: string, lib: string, run: (entity: ComponentEntity<any, any>) => T): T;
declare function checkCurrent(name: string, initOnly?: boolean): ComponentEntity<any, any>;

declare function addContextConstructor(constructor: ContextConstructor): void;

declare function addEntityConstructor(constructor: EntityConstructor): void;

declare function refresh<T>(f: () => T, async?: false): T;
declare function refresh<T>(f: () => PromiseLike<T> | T, async: true): Promise<T>;
declare function refresh<T>(f: () => PromiseLike<T> | T, async?: boolean): PromiseLike<T> | T;

declare function nextTick(fn: () => void, level?: number, type?: 'middle' | 'end'): void;
declare function addRendererDraw(fn: () => void): void;

declare function addRecognizer(recognizer: Recognizer): void;

declare class SlotProxy extends NodeProxy<typeof ScopeSlot> {
    __nodes: TreeNodeList;
    get content(): (MountedNode | MountedNode[])[];
    constructor(children: any[], parent: BaseProxy<any>, isDefault?: boolean);
    /** 更新属性及子代 */
    _update(props: object, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare class RenderProxy extends NodeProxy<typeof Render> {
    get content(): (MountedNode | MountedNode[])[];
    childNodes: any[];
    /** 结果渲染函数 */
    private __render;
    constructor(props: object, children: any[], parent: BaseProxy<any>);
    /** 是否为刷新中 */
    private __refreshing;
    /** 是否需要继续刷新 */
    private __needRefresh;
    /** 延时刷新计数 */
    private __delayedRefresh;
    /** 渲染结果 */
    protected _nodes: TreeNodeList;
    refresh(): void;
    refresh<T>(f: () => T): T;
    refresh<T>(f?: () => T): T | void;
    _update(props: object, children: any[]): void;
    _destroy(): void;
    _mount(mountOptions: MountOptions): void;
    _redraw(mountOptions: MountOptions): void;
    _unmount(): void;
}

declare function isProxy(v: any, type?: ''): v is RefProxy<any, any, any>;
declare function isProxy(v: any, type?: ''): v is BaseProxy<any>;
declare function isProxy(v: any, type: 'component'): v is ComponentProxy<any, any, any, any>;
declare function isProxy(v: any, type: 'standardComponent'): v is StandardComponentProxy<any, any, any, any>;
declare function isProxy(v: any, type: 'renderComponent'): v is RenderComponentProxy<any, any, any, any>;
declare function isProxy(v: any, type: 'container'): v is ContainerProxy<any>;
declare function isProxy(v: any, type: 'node'): v is NodeProxy<any>;
declare function isProxy(v: any, type: 'deliver'): v is DeliverProxy<any>;
declare function isProxy(v: any, type: 'element'): v is ElementProxy<any>;
declare function isProxy(v: any, type: 'group'): v is GroupProxy<any>;
declare function isProxy(v: any, type: 'shell'): v is ShellProxy<any>;
declare function isProxy(v: any, type: 'value'): v is ValueProxy;
declare function isProxy(v: any, type: 'render'): v is RenderProxy;
declare function isProxy(v: any, type: 'slot'): v is SlotProxy;


declare namespace Neep {
  export {
    install,
    NeepError as Error,
    render,
    register,
    getNode,
    createDeliverComponent,
    createRenderComponent,
    createContainerComponent,
    createElementComponent,
    createStandardComponent,
    createNativeComponent,
    createSimpleComponent,
    createShellComponent,
    createStandardComponent as createComponent,
    isSimpleComponent,
    isShellComponent,
    isNativeComponent,
    isRenderComponent,
    isContainerComponent,
    isElementComponent,
    isDeliverComponent,
    isDeliverComponent as isDeliver,
    lazy,
    version,
    isProduction,
    ScopeSlot,
    Render,
    Slot,
    Container,
    Template,
    Fragment,
    value,
    computed,
    isValue,
    encase,
    valueify,
    asValue,
    mixValue,
    defineProperty,
    ref,
    watch,
    useValue,
    useService,
    byService,
    hook,
    isElement,
    isFragmentElement,
    isRenderElement,
    isSimpleElement,
    createElement,
    createElementBase,
    createRenderElement,
    elements,
    equal,
    createTemplateElement,
    label,
    SelfComponent,
    PropsDefinition,
    ComponentFunc,
    SimpleComponentFunc,
    ShellComponentFunc,
    SpecialComponentFunc,
    DeliverComponent,
    RenderComponent,
    ContainerComponent,
    ElementComponent,
    StandardComponent,
    NativeComponent,
    SimpleComponent,
    ShellComponent,
    Component,
    Service,
    Delivered,
    Context,
    ShellContext,
    ComponentContext,
    ContextConstructor,
    BaseProxy$1 as BaseProxy,
    RefProxy$1 as RefProxy,
    NodeProxy$1 as NodeProxy,
    DeliverProxy$1 as DeliverProxy,
    ElementProxy$1 as ElementProxy,
    GroupProxy$1 as GroupProxy,
    ShellProxy$1 as ShellProxy,
    ValueProxy$1 as ValueProxy,
    ComponentProxy$1 as ComponentProxy,
    StandardComponentProxy$1 as StandardComponentProxy,
    RenderComponentProxy$1 as RenderComponentProxy,
    ContainerProxy$1 as ContainerProxy,
    Devtools,
    Label,
    ValueElement,
    TreeNodeList,
    TreeNode,
    ProxyMountedNode,
    ValueMountedNode,
    MountNode,
    MountedNode,
    Entity,
    ElementEntity,
    ShellEntity,
    HookEntity,
    ComponentEntity,
    EntityConstructor,
    ContainerEntity,
    RootEntity,
    EmitOptions,
    Emit,
    EventSet,
    EventInfo,
    Listener,
    On,
    EventEmitter$1 as EventEmitter,
    Hook,
    HookNames as HookName,
    ReadMap,
    ObserveOptions,
    ExecOptions,
    ExecResult,
    MonitorOptions,
    Monitored,
    Value,
    WatchCallback,
    CancelWatch,
    ComputedOptions,
    Valueify,
    AsValue,
    DeValue,
    EnValue,
    Tag,
    Element,
    ElementIteratorOptions,
    Node,
    Recognizer,
    Ref,
    RefSet,
    RefValue,
    RefEntityValue,
    NativeElementNodes,
    NativeTextNodes,
    NativePlaceholderNodes,
    NativeComponentNodes,
    NativeShadowNodes,
    NativeElementNode,
    NativeTextNode,
    NativePlaceholderNode,
    NativeComponentNode,
    NativeShadowNode,
    NativeContainerNode,
    NativeNode,
    Rect,
    MountOptions,
    MountContainerResult,
    UpdateContainerResult,
    IRenderer,
    Slots,
    SlotApi,
    UseHook,
    rendererSymbol,
    nameSymbol,
    componentsSymbol,
    propsSymbol,
    componentValueSymbol,
    objectTypeSymbol,
    objectTypeSymbolElement,
    objectTypeSymbolDeliverComponent,
    objectTypeSymbolNativeComponent,
    objectTypeSymbolSimpleComponent,
    objectTypeSymbolShellComponent,
    objectTypeSymbolRenderComponent,
    objectTypeSymbolContainerComponent,
    objectTypeSymbolElementComponent,
    objectTypeSymbolHookEntity,
    objectTypeSymbolRootEntity,
    deliverKeySymbol,
    deliverDefaultSymbol,
    setHook,
    callHook,
    current,
    checkCurrent,
    execUseHooks,
    addContextConstructor,
    addEntityConstructor,
    refresh,
    nextTick,
    addRendererDraw,
    addRecognizer,
    isProxy,
  };
}

export default Neep;
export { BaseProxy$1 as BaseProxy, Component, ComponentContext, ComponentEntity, ComponentFunc, ComponentProxy$1 as ComponentProxy, Container, ContainerComponent, ContainerEntity, ContainerProxy$1 as ContainerProxy, Context, ContextConstructor, DeliverComponent, DeliverProxy$1 as DeliverProxy, Delivered, Devtools, Element, ElementComponent, ElementEntity, ElementIteratorOptions, ElementProxy$1 as ElementProxy, Emit, EmitOptions, Entity, EntityConstructor, NeepError as Error, EventEmitter$1 as EventEmitter, EventInfo, EventSet, Fragment, GroupProxy$1 as GroupProxy, Hook, HookEntity, HookNames as HookName, IRenderer, Label, Listener, MountContainerResult, MountNode, MountOptions, MountedNode, NativeComponent, NativeComponentNode, NativeComponentNodes, NativeContainerNode, NativeElementNode, NativeElementNodes, NativeNode, NativePlaceholderNode, NativePlaceholderNodes, NativeShadowNode, NativeShadowNodes, NativeTextNode, NativeTextNodes, Node, NodeProxy$1 as NodeProxy, On, PropsDefinition, ProxyMountedNode, Recognizer, Rect, Ref, RefEntityValue, RefProxy$1 as RefProxy, RefSet, RefValue, Render, RenderComponent, RenderComponentProxy$1 as RenderComponentProxy, RootEntity, ScopeSlot, SelfComponent, Service, ShellComponent, ShellComponentFunc, ShellContext, ShellEntity, ShellProxy$1 as ShellProxy, SimpleComponent, SimpleComponentFunc, Slot, SlotApi, Slots, SpecialComponentFunc, StandardComponent, StandardComponentProxy$1 as StandardComponentProxy, Tag, Template, TreeNode, TreeNodeList, UpdateContainerResult, UseHook, ValueElement, ValueMountedNode, ValueProxy$1 as ValueProxy, addContextConstructor, addEntityConstructor, addRecognizer, addRendererDraw, byService, callHook, checkCurrent, componentValueSymbol, componentsSymbol, createStandardComponent as createComponent, createContainerComponent, createDeliverComponent, createElement, createElementBase, createElementComponent, createNativeComponent, createRenderComponent, createRenderElement, createShellComponent, createSimpleComponent, createStandardComponent, createTemplateElement, current, deliverDefaultSymbol, deliverKeySymbol, elements, equal, execUseHooks, getNode, hook, install, isContainerComponent, isDeliverComponent as isDeliver, isDeliverComponent, isElement, isElementComponent, isFragmentElement, isNativeComponent, isProduction, isProxy, isRenderComponent, isRenderElement, isShellComponent, isSimpleComponent, isSimpleElement, label, lazy, nameSymbol, nextTick, objectTypeSymbol, objectTypeSymbolContainerComponent, objectTypeSymbolDeliverComponent, objectTypeSymbolElement, objectTypeSymbolElementComponent, objectTypeSymbolHookEntity, objectTypeSymbolNativeComponent, objectTypeSymbolRenderComponent, objectTypeSymbolRootEntity, objectTypeSymbolShellComponent, objectTypeSymbolSimpleComponent, propsSymbol, ref, refresh, register, render, rendererSymbol, setHook, useService, useValue, version, watch };
