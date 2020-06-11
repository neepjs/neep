/*!
 * Neep v0.1.0-alpha.14
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
const version = '0.1.0-alpha.14';
const isProduction = "development" === 'production';

const devtools = {
  renderHook() {}

};
function installDevtools(tools) {
  if (!tools) {
    return;
  }

  if (typeof tools !== 'object') {
    return;
  }

  const {
    renderHook
  } = tools;

  if (typeof renderHook === 'function') {
    devtools.renderHook = renderHook;
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

class NeepError extends Error {
  constructor(message, tag = '') {
    super(tag ? `[${tag}] ${message}` : message);

    _defineProperty(this, "tag", void 0);

    this.tag = tag;
  }

}
function assert(v, message, tag) {
  if (v) {
    return;
  }

  throw new NeepError(message, tag);
}

let nextFrameApi;
function nextFrame(fn) {
  assert(nextFrameApi, 'The basic renderer is not installed', 'install');

  if (nextFrameApi) {
    nextFrameApi(fn);
  }
}
const renders = Object.create(null);
function getRender(type = '') {
  if (typeof type === 'object') {
    return type;
  }

  return renders[type] || renders.default;
}
function installRender(render) {
  if (!render) {
    return;
  }

  renders[render.type] = render;

  if (nextFrameApi) {
    return;
  }

  if (!renders.default) {
    renders.default = render;
  }

  if (!nextFrameApi && render.nextFrame) {
    renders.default = render;
    nextFrameApi = render.nextFrame;
  }
}

let value;
let computed;
let isValue;
let encase;
let recover;
let valueify;
let markRead;
let markChange;
let safeify;
let asValue;
let exec;
let monitor;
let printError;
function installMonitorable(api) {
  if (!api) {
    return;
  }

  ({
    value,
    computed,
    isValue,
    encase,
    recover,
    valueify,
    markRead,
    markChange,
    safeify,
    asValue,
    exec,
    monitor,
    printError
  } = api);
}

function install(apis) {
  installMonitorable(apis.monitorable);
  installRender(apis.render);

  {
    installDevtools(apis.devtools);
  }
}

let current;
function setCurrent(fn, entity) {
  const oldEntity = current;
  current = entity;

  try {
    current.$_valueIndex = 0;
    current.$_serviceIndex = 0;
    const ret = fn();

    if (current.$_valueIndex !== current.$_values.length) {
      throw new NeepError('Inconsistent number of useValue executions', 'life');
    }

    if (current.$_serviceIndex && current.$_serviceIndex !== current.$_services.length) {
      throw new NeepError('Inconsistent number of useService executions', 'life');
    }

    return ret;
  } finally {
    current = oldEntity;
  }
}
function checkCurrent(name, initOnly = false) {
  if (!current) {
    throw new NeepError(`Function \`${name}\` can only be called within a cycle.`, 'life');
  }

  if (!initOnly) {
    return current;
  }

  if (!current.created) {
    return current;
  }

  throw new NeepError(`Function \`${name}\` can only be called at initialization time.`, 'life');
}

const constructors = [];
function initContext(context, entity) {
  for (const constructor of constructors) {
    constructor(context, entity);
  }

  return context;
}
function addContextConstructor(constructor) {
  constructors.push(safeify(constructor));
}

const constructors$1 = [];
function initEntity(entity) {
  for (const constructor of constructors$1) {
    constructor(entity);
  }

  return entity;
}
function addEntityConstructor(constructor) {
  constructors$1.push(safeify(constructor));
}

let delayedRefresh = 0;
const objectSet = new Set();
function wait(obj) {
  if (delayedRefresh <= 0) {
    return false;
  }

  objectSet.add(obj);
  return true;
}

function run() {
  if (delayedRefresh > 0) {
    return;
  }

  const list = [...objectSet];
  objectSet.clear();
  list.forEach(o => o.refresh());
}

async function asyncRefresh(f) {
  try {
    delayedRefresh++;
    return await f();
  } finally {
    delayedRefresh--;
    run();
  }
}

function refresh(f, async) {
  if (async) {
    return asyncRefresh(f);
  }

  try {
    delayedRefresh++;
    return f();
  } finally {
    delayedRefresh--;
    run();
  }
}

function getEventName(k) {
  if (k[0] === '@') {
    return k.substr(1);
  }

  if (/^on[:-]/.test(k)) {
    return k.substr(3);
  }

  if (/^n([:-])on(\1|:)/.test(k)) {
    return k.substr(5);
  }

  return '';
}

function addEventFromCollection(addEvent, events) {
  if (!events) {
    return;
  }

  if (typeof events === 'function') {
    const {
      names
    } = events;

    if (!Array.isArray(names)) {
      return;
    }

    for (const n of names) {
      if (!n) {
        continue;
      }

      addEvent(n, (...p) => events(n, ...p));
    }

    return;
  }

  if (typeof events !== 'object') {
    return;
  }

  for (const k of Object.keys(events)) {
    const f = events[k];

    if (typeof f !== 'function') {
      continue;
    }

    addEvent(k, f);
  }
}

class EventEmitter {
  static update(emitter, events) {
    if (!events) {
      return [];
    }

    const newHandles = [];

    if (events && typeof events === 'object') {
      for (const n of Object.keys(events)) {
        if (!n) {
          continue;
        }

        const fn = events[n];

        if (typeof fn !== 'function') {
          continue;
        }

        newHandles.push(emitter.on(n, fn));
      }
    }

    return newHandles;
  }

  static updateInProps(emitter, props, custom) {
    if (!props) {
      return [];
    }

    const newHandles = [];

    function addEvent(entName, listener) {
      newHandles.push(emitter.on(entName, listener));
    }

    for (const k of Object.keys(props)) {
      const fn = props[k];

      if (typeof fn !== 'function') {
        continue;
      }

      const entName = getEventName(k);

      if (!entName) {
        continue;
      }

      addEvent(entName, fn);
    }

    addEventFromCollection(addEvent, props['@']);
    addEventFromCollection(addEvent, props['n:on']);
    addEventFromCollection(addEvent, props['n-on']);

    if (typeof custom === 'function') {
      custom(addEvent);
    }

    newHandles.push(...EventEmitter.update(emitter, props['@']));
    return newHandles;
  }

  get names() {
    return [...this._names];
  }

  constructor() {
    _defineProperty(this, "_names", new Set());

    _defineProperty(this, "_cancelHandles", new Set());

    _defineProperty(this, "emit", void 0);

    _defineProperty(this, "on", void 0);

    const events = Object.create(null);
    const names = this._names;

    function createEmit(...omitNames) {
      function emit(name, ...p) {
        const event = events[name];

        if (!event) {
          return true;
        }

        return refresh(() => {
          let res = true;

          for (const fn of [...event]) {
            res = fn(...p) && res;
          }

          return res;
        });
      }

      emit.omit = (...names) => createEmit(...omitNames, ...names);

      Reflect.defineProperty(emit, 'names', {
        get: () => {
          markRead(createEmit, 'names');
          return [...names].filter(t => !omitNames.includes(t));
        },
        configurable: true
      });
      return emit;
    }

    const on = (name, listener) => {
      var _event;

      function fn(...p) {
        try {
          return listener(...p) !== false;
        } catch (e) {
          printError(e);
          return true;
        }
      }

      let event = events[name];

      if (!((_event = event) === null || _event === void 0 ? void 0 : _event.size)) {
        event = new Set();
        events[name] = event;
        markChange(createEmit, 'names');
        names.add(name);
      }

      event.add(fn);
      let removed = false;
      return () => {
        if (removed) {
          return;
        }

        removed = true;
        event.delete(fn);

        if (event.size) {
          return;
        }

        markChange(createEmit, 'names');
        names.delete(name);
      };
    };

    this.emit = createEmit();
    this.on = on;
  }

  updateHandles(newHandles) {
    const eventCancelHandles = this._cancelHandles;
    const oldHandles = [...eventCancelHandles];
    eventCancelHandles.clear();

    for (const fn of oldHandles) {
      fn();
    }

    newHandles.forEach(f => eventCancelHandles.add(f));
    return newHandles;
  }

  update(list) {
    const handles = EventEmitter.update(this, list);
    return this.updateHandles(handles);
  }

  updateInProps(list, custom) {
    const handles = EventEmitter.updateInProps(this, list, custom);
    return this.updateHandles(handles);
  }

}

const ScopeSlot = 'Neep:ScopeSlot';
const SlotRender = 'Neep:SlotRender';
const Slot = 'Neep:Slot';
const Value = 'Neep:Value';
const Container = 'Neep:Container';
const Deliver = 'Neep:Deliver';
const Template = 'template';
const Fragment = Template;

const hooks = Object.create(null);
function setHook(id, hook, entity) {
  let list = (entity === null || entity === void 0 ? void 0 : entity.$_hooks) || hooks;

  if (!list) {
    return () => {};
  }

  hook = safeify(hook);
  let set = list[id];

  if (!set) {
    set = new Set();
    list[id] = set;
  }

  set.add(hook);
  return () => set.delete(hook);
}
function callHook(id, exposed) {
  if (!exposed) {
    return;
  }

  for (const hook of exposed.$_hooks[id] || []) {
    hook(exposed);
  }

  for (const hook of hooks[id] || []) {
    hook(exposed);
  }
}

function watch(value, cb) {
  const entity = checkCurrent('watch');

  if (typeof value !== 'function') {
    return () => {};
  }

  const stop = isValue(value) ? value.watch(cb) : computed(value).watch((v, s) => cb(v(), s));
  setHook('beforeDestroy', () => stop(), entity);
  return stop;
}
function useValue(fn) {
  const entity = checkCurrent('useValue');
  const index = entity.$_valueIndex++;
  const values = entity.$_values;

  if (!entity.created) {
    values[index] = undefined;
    const v = typeof fn === 'function' ? fn() : value(undefined);
    return values[index] = v;
  }

  if (index >= values.length) {
    throw new NeepError('Inconsistent number of useValue executions', 'life');
  }

  return values[index];
}
function useService(fn, ...p) {
  const entity = checkCurrent('useService');
  const index = entity.$_serviceIndex++;
  const services = entity.$_services;

  if (!entity.created) {
    services[index] = undefined;
    const v = fn(entity, ...p);
    services[index] = v;
    return v;
  }

  if (index >= services.length) {
    throw new NeepError('Inconsistent number of useService executions', 'life');
  }

  return services[index];
}
function byService(fn, ...p) {
  const entity = checkCurrent('byService');
  return fn(entity, ...p);
}
function hook(name, hook, initOnly) {
  const entity = checkCurrent('setHook');

  if (initOnly && entity.created) {
    return undefined;
  }

  return setHook(name, () => hook(), entity);
}

function setValue(obj, name, value, opt) {
  if (typeof name === 'string' && ['$', '_'].includes(name[0])) {
    return;
  }

  if (isValue(value) && opt) {
    Reflect.defineProperty(obj, name, {
      get() {
        return value();
      },

      set(v) {
        value(v);
      },

      configurable: true,
      enumerable: true
    });
    return;
  }

  if (typeof value === 'function' && opt) {
    Reflect.defineProperty(obj, name, {
      get: value,
      set: typeof opt === 'function' ? opt : undefined,
      configurable: true,
      enumerable: true
    });
    return;
  }

  Reflect.defineProperty(obj, name, {
    get() {
      return value;
    },

    configurable: true,
    enumerable: true
  });
}

function expose(name, value, opt) {
  setValue(checkCurrent('expose', true).exposed, name, value, opt);
}
function deliver(name, value, opt) {
  setValue(checkCurrent('deliver', true).delivered, name, value, opt);
}

const isElementSymbol = Symbol.for('------isNeepElement------');
const typeSymbol = Symbol.for('type');
const nameSymbol = Symbol.for('name');
const renderSymbol = Symbol.for('render');
const componentsSymbol = Symbol.for('components');
const configSymbol = Symbol.for('config');

function isElement(v) {
  if (!v) {
    return false;
  }

  if (typeof v !== 'object') {
    return false;
  }

  return v[isElementSymbol] === true;
}
function createElement(tag, attrs, ...children) {
  attrs = attrs ? { ...attrs
  } : {};
  const node = {
    [isElementSymbol]: true,
    tag,
    key: undefined,
    props: attrs,
    children
  };

  if ('n:key' in attrs) {
    node.key = attrs.key;
  } else if ('n-key' in attrs) {
    node.key = attrs.key;
  }

  if ('slot' in attrs) {
    node.slot = attrs.slot;
  }

  if (typeof attrs['n:ref'] === 'function') {
    node.ref = attrs['n:ref'];
  } else if (typeof attrs['n-ref'] === 'function') {
    node.ref = attrs['n-ref'];
  } else if (typeof attrs.ref === 'function') {
    node.ref = attrs.ref;
  }

  if (tag === Value) {
    node.value = attrs.value;
  }

  return node;
}
function elements(node, opt = {}) {
  if (Array.isArray(node)) {
    const list = [];

    for (let n of node) {
      list.push(elements(n, opt));
    }

    return [].concat(...list);
  }

  if (!isElement(node)) {
    return [node];
  }

  let {
    tag
  } = node;

  if (!tag) {
    return [node];
  }

  if ([Template, ScopeSlot].includes(tag)) {
    return elements(node.children, opt);
  }

  if (typeof tag !== 'function') {
    return [node];
  }

  if (tag[typeSymbol] !== 'simple') {
    return [node];
  }

  const {
    simple = true
  } = opt;

  if (!simple) {
    return [node];
  }

  if (Array.isArray(simple)) {
    if (simple.includes(tag)) {
      return [node];
    }
  } else if (typeof simple === 'function') {
    if (!simple(tag)) {
      return [node];
    }
  }

  return elements(node.children, opt);
}
function equalProps(a, b) {
  if (a === b) {
    return true;
  }

  if (!a) {
    return false;
  }

  if (!b) {
    return false;
  }

  if (typeof a !== 'object') {
    return false;
  }

  if (typeof b !== 'object') {
    return false;
  }

  const aKeys = new Set(Reflect.ownKeys(a));
  const bKeys = Reflect.ownKeys(b);

  if (aKeys.size !== bKeys.length) {
    return false;
  }

  for (const k of bKeys) {
    if (!aKeys.has(k)) {
      return false;
    }

    if (a[k] !== b[k]) {
      return false;
    }
  }

  return true;
}
function equal(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (typeof a === 'function') {
    return false;
  }

  if (!a) {
    return false;
  }

  if (!b) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    for (let i = a.length - 1; i >= 0; i--) {
      if (!equal(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (Array.isArray(b)) {
    return false;
  }

  if (!isElement(a)) {
    return false;
  }

  if (!isElement(b)) {
    return false;
  }

  if (a.tag !== b.tag) {
    return false;
  }

  if (a.execed !== b.execed) {
    return false;
  }

  if (a.inserted !== b.inserted) {
    return false;
  }

  if (a.ref !== b.ref) {
    return false;
  }

  if (a.value !== b.value) {
    return false;
  }

  if (a.key !== b.key) {
    return false;
  }

  if (a.slot !== b.slot) {
    return false;
  }

  return equalProps(a.props, b.props) && equal(a.children, b.children);
}

let label;
function setLabel(l) {
  label = l;
}
function getLabel() {
  const l = label;
  label = undefined;
  return l;
}

function label$1(text, color = '') {
  {
    if (!current) {
      setLabel([text, color]);
      return;
    }

    Reflect.defineProperty(current.exposed, '$label', {
      value: [text, color],
      configurable: true
    });
  }
}

function getRect(n) {
  for (const t of Object.keys(renders)) {
    const render = renders[t];

    if (!render) {
      continue;
    }

    if (!render.isNode(n)) {
      continue;
    }

    const rect = render.getRect(n);

    if (rect) {
      return rect;
    }
  }

  return null;
}

let ids = 0;
const Nodes = {};
let IdMap;

{
  IdMap = new Map();
}

function createMountedNode(n, id) {
  {
    id = id || ++ids;
    const {
      node
    } = n;

    if (node && IdMap) {
      IdMap.set(node, id);
    }

    return Nodes[id] = { ...n,
      id
    };
  }
}
function recoveryMountedNode(node) {
  {
    delete Nodes[node.id];
  }
}

function* recursive2iterable(list) {
  if (!Array.isArray(list)) {
    yield list;
    return;
  }

  for (const it of list) {
    yield* recursive2iterable(it);
  }
}

let refList;
function setRefList(list) {
  refList = list;
}
function setRef(ref, node, isRemove) {
  if (typeof ref !== 'function') {
    return;
  }

  if (!node) {
    return;
  }

  if (!refList) {
    ref(node, isRemove);
  } else {
    refList.push(() => ref(node, isRemove));
  }
}
function* getNodes(tree) {
  if (Array.isArray(tree)) {
    for (const it of tree) {
      yield* getNodes(it);
    }

    return;
  }

  const {
    children,
    node,
    component
  } = tree;

  if (node) {
    yield node;
    return;
  }

  if (component) {
    yield* getNodes(component.tree);
    return;
  }

  yield* getNodes(children);
}
function unmount(iRender, tree) {
  if (Array.isArray(tree)) {
    tree.forEach(e => unmount(iRender, e));
    return;
  }

  const {
    component,
    children,
    node,
    ref
  } = tree;
  recoveryMountedNode(tree);

  if (component) {
    setRef(ref, component.exposed, true);
    component.unmount();
    return;
  }

  if (node) {
    setRef(ref, node, true);
    iRender.removeNode(node);
  }

  unmount(iRender, children);
}

function createValue(iRender, source, value) {
  let {
    ref
  } = source;

  if (iRender.isNode(value)) {
    setRef(ref, value);
    return createMountedNode({ ...source,
      value,
      node: value,
      children: [],
      component: undefined
    });
  }

  const type = typeof value;
  let node;

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'string' || type === 'symbol' || value instanceof RegExp) {
    node = iRender.createText(String(value));
  } else if (value instanceof Date) {
    node = iRender.createText(value.toISOString());
  } else if (type === 'object' && value) {
    node = iRender.createText(String(value));
  }

  if (!node) {
    node = iRender.createPlaceholder();
  }

  setRef(ref, node);
  return createMountedNode({ ...source,
    value,
    node,
    component: undefined,
    children: []
  });
}
function createAll(iRender, source) {
  if (!source.length) {
    return [createMountedNode({
      tag: null,
      node: iRender.createPlaceholder(),
      component: undefined,
      children: []
    })];
  }

  return source.map(item => Array.isArray(item) ? createList(iRender, item) : createItem(iRender, item));
}
function createList(iRender, source) {
  if (source.length) {
    return source.map(it => createItem(iRender, it));
  }

  return [createMountedNode({
    tag: null,
    node: iRender.createPlaceholder(),
    component: undefined,
    children: []
  })];
}
function createItem(iRender, source) {
  var _source$children;

  const {
    tag,
    ref,
    component
  } = source;

  if (!tag) {
    const node = iRender.createPlaceholder();
    setRef(ref, node);
    return createMountedNode({
      tag: null,
      node,
      component: undefined,
      children: []
    });
  }

  const ltag = typeof tag !== 'string' ? '' : tag.toLowerCase();

  if (typeof tag !== 'string' || ltag === 'neep:container') {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: createAll(iRender, source.children)
      });
    }

    component.mount();
    setRef(ref, component.exposed);
    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    });
  }

  if (ltag === 'neep:value') {
    let {
      value
    } = source;

    if (isValue(value)) {
      value = value();
    }

    return createValue(iRender, source, value);
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: createAll(iRender, source.children)
    });
  }

  const node = iRender.createElement(tag, source.props || {});
  setRef(ref, node);
  let children = [];

  if ((_source$children = source.children) === null || _source$children === void 0 ? void 0 : _source$children.length) {
    children = createAll(iRender, source.children);

    for (const it of getNodes(children)) {
      iRender.insertNode(node, it);
    }
  }

  return createMountedNode({ ...source,
    node,
    component: undefined,
    children
  });
}

function getLastNode(tree) {
  if (Array.isArray(tree)) {
    return getLastNode(tree[tree.length - 1]);
  }

  const {
    component,
    children,
    node
  } = tree;

  if (node) {
    return node;
  }

  if (component) {
    return getLastNode(component.tree);
  }

  return getLastNode(children);
}

function getFirstNode(tree) {
  if (Array.isArray(tree)) {
    return getFirstNode(tree[0]);
  }

  const {
    component,
    children,
    node
  } = tree;

  if (node) {
    return node;
  }

  if (component) {
    return getFirstNode(component.tree);
  }

  return getFirstNode(children[0]);
}

function replace(iRender, newTree, oldTree) {
  const next = getFirstNode(oldTree);

  if (!next) {
    return newTree;
  }

  const parent = iRender.getParent(next);

  if (!parent) {
    return newTree;
  }

  for (const it of getNodes(newTree)) {
    iRender.insertNode(parent, it, next);
  }

  unmount(iRender, oldTree);
  return newTree;
}

function updateList(iRender, source, tree) {
  if (!source.length) {
    const node = createItem(iRender, {
      tag: null,
      children: []
    });
    return [replace(iRender, node, tree)];
  }

  if (!Array.isArray(tree)) {
    tree = [tree];
  }

  const newList = [];
  const list = [...tree];
  const mountedMap = new Map();

  for (const src of source) {
    const index = list.findIndex(it => it.tag === src.tag && it.key === src.key);

    if (index >= 0) {
      const old = list[index];
      const item = updateItem(iRender, src, old);
      mountedMap.set(old, item);
      newList.push(item);
      list.splice(index, 1);
    } else {
      const item = createItem(iRender, src);
      newList.push(item);
    }
  }

  if (!mountedMap.size) {
    return replace(iRender, newList, list);
  }

  unmount(iRender, list);
  tree = tree.filter(t => mountedMap.has(t));
  const last = getLastNode(tree[tree.length - 1]);
  const parent = iRender.getParent(last);

  if (!parent) {
    return newList;
  }

  let next = iRender.nextNode(last);

  for (let i = newList.length - 1; i >= 0; i--) {
    const item = newList[i];
    const index = tree.findIndex(o => mountedMap.get(o) === item);

    if (index >= 0) {
      for (const it of tree.splice(index)) {
        mountedMap.delete(it);
      }
    } else {
      for (const it of getNodes(item)) {
        iRender.insertNode(parent, it, next);
      }
    }

    next = getFirstNode(item) || next;
  }

  return newList;
}

function updateAll(iRender, source, tree) {
  let index = 0;
  let length = Math.min(source.length, source.length || 1);
  const list = [];

  for (; index < length; index++) {
    const src = source[index];

    if (Array.isArray(src)) {
      list.push(updateList(iRender, src, tree[index]));
    } else {
      list.push(updateItem(iRender, src, tree[index]));
    }
  }

  length = Math.max(source.length, tree.length);

  if (tree.length > length) {
    for (; index < length; index++) {
      unmount(iRender, tree[index]);
    }
  }

  if (source.length > length) {
    const last = getLastNode(list[list.length - 1]);
    const parent = iRender.getParent(last);
    const next = iRender.nextNode(last);

    for (; index < length; index++) {
      const src = source[index];
      const item = Array.isArray(src) ? createList(iRender, src) : createItem(iRender, src);
      list.push(item);

      if (!parent) {
        continue;
      }

      for (const it of getNodes(item)) {
        iRender.insertNode(parent, it, next);
      }
    }
  }

  return list;
}

function updateItem(iRender, source, tree) {
  if (Array.isArray(tree)) {
    const index = tree.findIndex(it => it.tag === source.tag && it.component === source.component);

    if (index < 0) {
      return replace(iRender, createItem(iRender, source), tree);
    }

    const all = tree;
    [tree] = tree.splice(index, 1);
    unmount(iRender, all);
  }

  const {
    tag,
    component
  } = source;
  const ref = source.ref !== tree.ref && source.ref || undefined;

  if (tag !== tree.tag || component !== tree.component) {
    return replace(iRender, createItem(iRender, source), tree);
  }

  if (!tag) {
    return tree;
  }

  const ltag = typeof tag !== 'string' ? '' : tag.toLowerCase();

  if (typeof tag !== 'string' || ltag === 'neep:container') {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: updateAll(iRender, source.children, tree.children)
      }, tree.id);
    }

    setRef(ref, component.exposed);
    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    }, tree.id);
  }

  if (ltag === 'neep:value') {
    let {
      value
    } = source;

    if (isValue(value)) {
      value = value();
    }

    if (tree.value === value) {
      setRef(ref, tree.node);
      return createMountedNode({ ...tree,
        ...source,
        value,
        children: []
      }, tree.id);
    }

    return replace(iRender, createValue(iRender, source, value), tree);
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: updateAll(iRender, source.children, tree.children)
    }, tree.id);
  }

  const {
    node
  } = tree;
  iRender.updateProps(node, source.props || {});
  setRef(ref, node);

  if (!source.children.length && !tree.children.length) {
    return createMountedNode({ ...tree,
      ...source,
      children: []
    }, tree.id);
  }

  if (!source.children.length && tree.children.length) {
    unmount(iRender, tree.children);
  }

  if (source.children.length && !tree.children.length) {
    const children = createAll(iRender, source.children);

    for (const it of getNodes(children)) {
      iRender.insertNode(node, it);
    }

    return createMountedNode({ ...tree,
      ...source,
      children
    }, tree.id);
  }

  return createMountedNode({ ...tree,
    ...source,
    children: updateAll(iRender, source.children, tree.children)
  }, tree.id);
}

function draw(iRender, source, tree) {
  if (tree) {
    return updateAll(iRender, source, tree);
  }

  return createAll(iRender, source);
}

function getSlots(iRender, children, slots, native = false) {
  const nativeList = [];

  for (const it of children) {
    if (Array.isArray(it)) {
      const list = Object.create(null);
      nativeList.push(getSlots(iRender, it, list, native));

      for (const k of Reflect.ownKeys(list)) {
        if (k in slots) {
          slots[k].push(list[k]);
        } else {
          slots[k] = [list[k]];
        }
      }

      continue;
    }

    if (isElement(it) && it.slot === undefined) {
      if (typeof it.tag === 'function' && it.tag[typeSymbol] === 'simple' && it.execed || it.tag === Template) {
        const list = Object.create(null);
        nativeList.push(getSlots(iRender, it.children, list, native));

        for (const k of Reflect.ownKeys(list)) {
          const node = { ...it,
            children: list[k]
          };

          if (k in slots) {
            slots[k].push(node);
          } else {
            slots[k] = [node];
          }
        }

        continue;
      }
    }

    if (native) {
      if (iRender.isNode(it)) {
        nativeList.push(it);
        continue;
      }

      if (!isElement(it)) {
        nativeList.push(it);
        continue;
      }

      if (it.tag !== SlotRender && it.tag !== Template) {
        nativeList.push(it);
        continue;
      }
    }

    const slot = isElement(it) && it.slot || 'default';
    const el = isElement(it) ? { ...it,
      slot: undefined,
      props: { ...it.props,
        slot: undefined
      }
    } : it;

    if (slot in slots) {
      slots[slot].push(el);
    } else {
      slots[slot] = [el];
    }
  }

  return nativeList;
}

function renderSlots(list, ...props) {
  return list.map(it => {
    if (Array.isArray(it)) {
      return renderSlots(it, ...props);
    }

    if (!isElement(it)) {
      return it;
    }

    if (it.tag !== SlotRender) {
      return { ...it,
        slot: undefined
      };
    }

    const {
      children
    } = it;

    if ((children === null || children === void 0 ? void 0 : children.length) !== 1) {
      return children;
    }

    const [render] = children;

    if (isValue(render) || typeof render !== 'function') {
      return children;
    }

    return render(...props);
  });
}

function createSlots(name, list) {
  const slot = (...props) => ({
    [isElementSymbol]: true,
    tag: ScopeSlot,
    children: renderSlots(list, ...props),
    inserted: true,
    label:  [`[${name}]`, '#00F']
  });

  slot.children = list;
  return slot;
}

function setSlots(children, slots = Object.create(null), oldChildren) {
  for (const k of Reflect.ownKeys(slots)) {
    if (k in children) {
      continue;
    }

    delete slots[k];
  }

  if (!oldChildren) {
    for (const k of Reflect.ownKeys(children)) {
      slots[k] = createSlots(k, children[k]);
    }

    return slots;
  }

  for (const k of Reflect.ownKeys(children)) {
    const list = children[k];

    if (equal(list, oldChildren[k])) {
      continue;
    }

    slots[k] = createSlots(k, list);
  }

  return slots;
}

const disabledKey = new Set([':', '@', '#', '*', '!', '%', '^', '~', '&', '=', '+', '.', '(', ')', '[', ']', '{', '}', '<', '>']);

function filter(k) {
  if (typeof k !== 'string') {
    return true;
  }

  if (disabledKey.has(k[0])) {
    return false;
  }

  if (/^n[:-]/.test(k)) {
    return false;
  }

  if (/^on[:-]/.test(k)) {
    return false;
  }

  return true;
}

function updateProps(obj, props, oldProps = {}, define = false, isProps = false) {
  const keys = Reflect.ownKeys(props);
  const newKeys = new Set(isProps ? keys.filter(filter) : keys);

  for (const k of Reflect.ownKeys(obj)) {
    if (!newKeys.has(k)) {
      delete obj[k];
    }
  }

  if (!define) {
    for (const k of newKeys) {
      obj[k] = props[k];
    }

    return obj;
  }

  for (const k of newKeys) {
    const value = props[k];

    if (k in oldProps && oldProps[k] === value) {
      continue;
    }

    if (isValue(value)) {
      Reflect.defineProperty(obj, k, {
        configurable: true,
        enumerable: true,

        get() {
          return value();
        },

        set(v) {
          value(v);
        }

      });
      continue;
    }

    Reflect.defineProperty(obj, k, {
      configurable: true,
      enumerable: true,
      value
    });
  }

  return obj;
}

const components = Object.create(null);
function register(name, component) {
  components[name] = component;
}

function findComponent(tag, components$1) {
  if (!tag) {
    return null;
  }

  if (typeof tag !== 'string') {
    return tag;
  }

  if (tag === 'template') {
    return tag;
  }

  if (/^neep:.+/i.test(tag)) {
    return tag;
  }

  for (const list of components$1) {
    const component = list[tag];

    if (component) {
      return component;
    }
  }

  return components[tag] || tag;
}

function getChildren(children, args) {
  if (children.length !== 1) {
    return children;
  }

  const [fn] = children;

  if (typeof fn !== 'function') {
    return children;
  }

  return fn(...args);
}

function replaceNode(node, slots, components, native, isRoot) {
  var _node$props;

  if (Array.isArray(node)) {
    return node.map(n => replaceNode(n, slots, components, native, isRoot));
  }

  if (!isElement(node)) {
    return node;
  }

  let {
    children,
    props
  } = node;
  let tag = findComponent(node.tag, components);

  if (tag === SlotRender && isRoot) {
    return null;
  }

  if (tag === Slot) {
    tag = native ? 'slot' : ScopeSlot;
  }

  if (tag !== ScopeSlot) {
    return { ...node,
      tag,
      children: replaceNode(children, slots, components, native, isRoot)
    };
  }

  if (node.tag === ScopeSlot && node.inserted) {
    return node;
  }

  const args = (props === null || props === void 0 ? void 0 : props.argv) && [props.argv] || Array.isArray(props === null || props === void 0 ? void 0 : props.args) && (props === null || props === void 0 ? void 0 : props.args.length) && props.args || [{}];
  const slotName = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.name) || 'default';
  const slot = slots[slotName];

  if (typeof slot === 'function') {
    return { ...node,
      ...slot(...args)
    };
  }

  const label =  [`[${slotName}]`, '#00F'];
  return { ...node,
    tag: ScopeSlot,
    label,
    children: replaceNode(getChildren(children, args), slots, components, native, false)
  };
}

function getComponents(...components) {
  return components.filter(Boolean);
}

function execSimple(nObject, delivered, node, tag, components, children) {
  if (node.execed) {
    return node;
  }

  const {
    iRender
  } = nObject;
  const slotMap = Object.create(null);
  getSlots(iRender, children, slotMap);
  const slots = setSlots(slotMap);
  const event = new EventEmitter();
  event.updateInProps(node.props);
  const props = { ...node.props
  };
  const context = initContext({
    slots,
    created: false,
    parent: nObject.exposed,
    delivered,
    children: new Set(),
    childNodes: children,

    refresh(f) {
      nObject.refresh(f);
    },

    emit: event.emit
  });

  {
    getLabel();
  }

  const result = tag(props, context);
  let label;

  {
    label = getLabel();
  }

  const nodes = init(nObject, delivered, renderNode(nObject.iRender, result, context, tag[renderSymbol]), slots, getComponents(...components, tag[componentsSymbol]), false);
  return { ...node,
    tag,
    execed: true,
    children: Array.isArray(nodes) ? nodes : [nodes],
    label
  };
}

function getSlotRenderFn(nObject, delivered, children, slots, components, native) {
  if (children.length !== 1) {
    return null;
  }

  const [renderFn] = children;

  if (isValue(renderFn) || typeof renderFn !== 'function') {
    return null;
  }

  const {
    slotRenderFnList
  } = nObject;
  const fn = slotRenderFnList.get(renderFn);

  if (fn) {
    return fn;
  }

  const newFn = function (...p) {
    return init(nObject, delivered, renderFn.call(this, ...p), slots, components, native);
  };

  slotRenderFnList.set(renderFn, newFn);
  return newFn;
}

function exec$1(nObject, delivered, node, slots, components, native) {
  if (Array.isArray(node)) {
    return node.map(n => exec$1(nObject, delivered, n, slots, components, native));
  }

  if (!isElement(node)) {
    return node;
  }

  let {
    tag,
    children
  } = node;

  if (tag === Deliver) {
    const props = { ...node.props
    };
    delete props.ref;
    delete props.slot;
    delete props.key;
    return { ...node,
      tag,
      children: children.map(n => exec$1(nObject, updateProps(Object.create(delivered), props || {}, {}, true), n, slots, components, native))
    };
  }

  if (tag === SlotRender) {
    const slotRenderFn = getSlotRenderFn(nObject, delivered, children, slots, components, native);

    if (slotRenderFn) {
      return { ...node,
        children: [slotRenderFn]
      };
    }
  }

  if (typeof tag !== 'function' || tag[typeSymbol] !== 'simple') {
    return { ...node,
      tag,
      children: children.map(n => exec$1(nObject, delivered, n, slots, components, native))
    };
  }

  return execSimple(nObject, delivered, node, tag, components, children);
}

function renderNode(iRender, node, context, render) {
  if (Array.isArray(node)) {
    return node;
  }

  if (isElement(node)) {
    return [node];
  }

  if (node === undefined || node === null) {
    return [{
      [isElementSymbol]: true,
      tag: null,
      key: undefined,
      children: []
    }];
  }

  if (!iRender.isNode(node) && node && typeof node === 'object' && render) {
    node = render(node, context);
  }

  if (isElement(node)) {
    return [node];
  }

  if (node === undefined || node === null) {
    return [{
      [isElementSymbol]: true,
      tag: null,
      key: undefined,
      children: []
    }];
  }

  return [{
    [isElementSymbol]: true,
    key: undefined,
    tag: Value,
    value: node,
    children: []
  }];
}

function init(nObject, delivered, node, slots, components, native) {
  return exec$1(nObject, delivered, replaceNode(node, slots, components, native, true), slots, components, native);
}
function normalize(nObject, result) {
  const {
    component
  } = nObject;
  return init(nObject, nObject.delivered, renderNode(nObject.iRender, result, nObject.context, component[renderSymbol]), nObject.slots, getComponents(component[componentsSymbol]), Boolean(nObject.native));
}

function createExposed(obj) {
  const cfg = {
    $parent: {
      configurable: true,
      get: () => {
        var _obj$parent;

        return (_obj$parent = obj.parent) === null || _obj$parent === void 0 ? void 0 : _obj$parent.exposed;
      }
    },
    $component: {
      configurable: true,
      value: null
    },
    $isContainer: {
      configurable: true,
      value: false
    },
    $created: {
      configurable: true,
      get: () => obj.created
    },
    $destroyed: {
      configurable: true,
      get: () => obj.destroyed
    },
    $mounted: {
      configurable: true,
      get: () => obj.mounted
    },
    $unmounted: {
      configurable: true,
      get: () => obj.unmounted
    }
  };
  const exposed = Object.create(null, cfg);
  return exposed;
}

let completeList;
function setCompleteList(list) {
  completeList = list;
}
function complete(it) {
  if (!completeList) {
    it();
  } else {
    completeList.push(it);
  }
}

function createEntity(obj) {
  const cfg = {
    exposed: {
      configurable: true,
      get: () => obj.exposed
    },
    delivered: {
      configurable: true,
      get: () => obj.delivered
    },
    parent: {
      configurable: true,
      get: () => {
        var _obj$parent2;

        return (_obj$parent2 = obj.parent) === null || _obj$parent2 === void 0 ? void 0 : _obj$parent2.entity;
      }
    },
    component: {
      configurable: true,
      value: null
    },
    isContainer: {
      configurable: true,
      value: false
    },
    created: {
      configurable: true,
      get: () => obj.created
    },
    destroyed: {
      configurable: true,
      get: () => obj.destroyed
    },
    mounted: {
      configurable: true,
      get: () => obj.mounted
    },
    unmounted: {
      configurable: true,
      get: () => obj.unmounted
    },
    $_hooks: {
      configurable: true,
      value: Object.create(null)
    },
    $_valueIndex: {
      configurable: true,
      value: 0,
      writable: true
    },
    $_values: {
      configurable: true,
      value: []
    },
    $_serviceIndex: {
      configurable: true,
      value: 0,
      writable: true
    },
    $_services: {
      configurable: true,
      value: []
    },
    callHook: {
      configurable: true,

      value(h) {
        callHook(h, entity);
      }

    },
    setHook: {
      configurable: true,

      value(id, hook) {
        return setHook(id, hook, entity);
      }

    },
    refresh: {
      configurable: true,
      value: obj.refresh.bind(obj)
    },
    on: {
      configurable: true,
      value: obj.on
    },
    emit: {
      configurable: true,
      value: obj.emit
    },
    config: {
      configurable: true,
      value: obj.config
    }
  };
  const entity = Object.create(null, cfg);
  return initEntity(entity);
}

class EntityObject {
  constructor(iRender, parent, delivered = (parent === null || parent === void 0 ? void 0 : parent.delivered) || Object.create(null), container) {
    _defineProperty(this, "slotRenderFnList", new WeakMap());

    _defineProperty(this, "events", new EventEmitter());

    _defineProperty(this, "emit", this.events.emit);

    _defineProperty(this, "on", this.events.on);

    _defineProperty(this, "eventCancelHandles", new Set());

    _defineProperty(this, "iRender", void 0);

    _defineProperty(this, "components", Object.create(null));

    _defineProperty(this, "config", Object.create(null));

    _defineProperty(this, "parentDelivered", void 0);

    _defineProperty(this, "delivered", void 0);

    _defineProperty(this, "exposed", createExposed(this));

    _defineProperty(this, "entity", createEntity(this));

    _defineProperty(this, "parent", void 0);

    _defineProperty(this, "native", void 0);

    _defineProperty(this, "created", false);

    _defineProperty(this, "destroyed", false);

    _defineProperty(this, "mounted", false);

    _defineProperty(this, "unmounted", false);

    _defineProperty(this, "children", new Set());

    _defineProperty(this, "tree", []);

    _defineProperty(this, "container", void 0);

    _defineProperty(this, "_render", () => []);

    _defineProperty(this, "_needRefresh", false);

    _defineProperty(this, "_delayedRefresh", 0);

    _defineProperty(this, "_refreshing", false);

    _defineProperty(this, "_nodes", []);

    _defineProperty(this, "childNodes", []);

    _defineProperty(this, "__executed_destroy", false);

    _defineProperty(this, "__executed_mount", false);

    _defineProperty(this, "__executed_mounted", false);

    _defineProperty(this, "_cancelDrawMonitor", void 0);

    this.iRender = iRender;
    this.parentDelivered = delivered;
    this.delivered = Object.create(delivered);

    if (parent) {
      this.parent = parent;
    }

    this.container = container || this;
  }

  get canRefresh() {
    if (wait(this)) {
      return false;
    }

    return !this._delayedRefresh;
  }

  get needRefresh() {
    if (wait(this)) {
      return false;
    }

    if (this._delayedRefresh) {
      return false;
    }

    const needRefresh = this._needRefresh;
    this._needRefresh = false;
    return needRefresh;
  }

  requestDraw() {}

  async asyncRefresh(f) {
    try {
      this._delayedRefresh++;
      return await f();
    } finally {
      this._delayedRefresh--;
      this.refresh();
    }
  }

  refresh(f, async) {
    if (typeof f === 'function') {
      if (async) {
        return this.asyncRefresh(f);
      }

      try {
        this._delayedRefresh++;
        return f();
      } finally {
        this._delayedRefresh--;

        if (this._delayedRefresh <= 0) {
          this.refresh();
        }
      }
    }

    if (this.destroyed) {
      return;
    }

    this._needRefresh = true;

    if (!this.created) {
      return;
    }

    if (this._refreshing) {
      return;
    }

    this._refreshing = true;
    let nodes;

    while (this.needRefresh) {
      nodes = this._render();

      if (this.destroyed) {
        return;
      }
    }

    this._refreshing = false;

    if (!this.canRefresh) {
      return;
    }

    if (!nodes) {
      return;
    }

    this._nodes = convert(this, nodes, this._nodes);

    if (!this.mounted) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    if (this.unmounted) {
      return;
    }

    this.requestDraw();
  }

  callHook(id) {
    callHook(id, this.entity);
  }

  _update(props, children) {
    this.childNodes = children;
  }

  update(props, children) {
    this._update(props, children);
  }

  _destroy() {}

  destroy() {
    if (this.__executed_destroy) {
      return;
    }

    this.__executed_destroy = true;
    this.callHook('beforeDestroy');

    this._destroy();

    this.callHook('destroyed');
    this.destroyed = true;
  }

  _mount() {}

  mount() {
    if (this.__executed_destroy) {
      return;
    }

    if (this.__executed_mount) {
      return;
    }

    this.__executed_mount = true;
    this.callHook('beforeMount');
    const result = exec(c => c && this.requestDraw(), () => {
      this._mount();

      this.mounted = true;
    });
    this._cancelDrawMonitor = result.stop;
    complete(() => this.callHook('mounted'));
  }

  _unmount() {}

  unmount() {
    if (!this.mounted) {
      return;
    }

    if (this.__executed_mounted) {
      return;
    }

    this.__executed_mounted = true;
    this.callHook('beforeUnmount');

    this._unmount();

    this.callHook('unmounted');
    this.unmounted = true;
  }

  _draw() {}

  draw() {
    if (this.__executed_destroy) {
      return;
    }

    if (this._cancelDrawMonitor) {
      this._cancelDrawMonitor();
    }

    this.callHook('beforeDraw');
    const result = exec(c => c && this.requestDraw(), () => this._draw());
    this._cancelDrawMonitor = result.stop;
    complete(() => this.callHook('drawn'));
  }

}

function update(nObject, props, children) {
  updateProps(nObject.props, props, {}, false, true);
  nObject.events.updateInProps(props);
  const slots = Object.create(null);
  const {
    native
  } = nObject;
  const childNodes = getSlots(nObject.iRender, children, slots, Boolean(native));
  setSlots(slots, nObject.slots, nObject.lastSlots);
  nObject.lastSlots = slots;

  if (!native) {
    return;
  }

  nObject.nativeNodes = convert(nObject, childNodes, nObject.nativeNodes);

  if (!nObject.mounted) {
    return;
  }

  nObject.requestDraw();
}

function createContext(nObject) {
  return initContext({
    slots: nObject.slots,

    get created() {
      return nObject.created;
    },

    get parent() {
      return nObject.parent.exposed;
    },

    get delivered() {
      return nObject.parentDelivered;
    },

    get children() {
      return nObject.children;
    },

    get childNodes() {
      return nObject.childNodes;
    },

    get emit() {
      return nObject.emit;
    },

    refresh(f) {
      nObject.refresh(f);
    }

  }, nObject.entity);
}

function initRender(nObject) {
  const {
    component,
    props,
    context,
    entity
  } = nObject;

  function refresh(changed) {
    if (!changed) {
      return;
    }

    nObject.refresh();
  }

  const result = exec(refresh, () => setCurrent(() => component(props, context), entity), {
    resultOnly: true
  });

  if (typeof result === 'function') {
    const render = monitor(refresh, () => normalize(nObject, result()));
    return {
      nodes: render(),
      render,
      stopRender: () => render.stop()
    };
  }

  const render = monitor(refresh, () => normalize(nObject, setCurrent(() => component(props, context), entity)));
  return {
    nodes: exec(refresh, () => normalize(nObject, result), {
      resultOnly: true
    }),
    render,
    stopRender: () => render.stop()
  };
}

class ComponentEntity extends EntityObject {
  constructor(component, props, children, parent, delivered) {
    var _this$iRender$createC, _this$iRender;

    super(parent.iRender, parent, delivered, parent.container);

    _defineProperty(this, "component", void 0);

    _defineProperty(this, "props", encase(Object.create(null)));

    _defineProperty(this, "slots", encase(Object.create(null)));

    _defineProperty(this, "lastSlots", void 0);

    _defineProperty(this, "_stopRender", void 0);

    _defineProperty(this, "nativeNodes", void 0);

    _defineProperty(this, "shadowTree", []);

    _defineProperty(this, "nativeTree", []);

    _defineProperty(this, "_shadow", void 0);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "parent", void 0);

    this.component = component;
    Object.assign(this.config, component[configSymbol]);
    Object.assign(this.components, component[componentsSymbol]);
    Reflect.defineProperty(this.exposed, '$component', {
      value: component,
      enumerable: true,
      configurable: true
    });
    [this.native, this._shadow] = component[typeSymbol] === 'native' && ((_this$iRender$createC = (_this$iRender = this.iRender).createComponent) === null || _this$iRender$createC === void 0 ? void 0 : _this$iRender$createC.call(_this$iRender)) || [];
    this.parent = parent;
    parent.children.add(this.exposed);
    const context = createContext(this);
    this.context = context;
    this.callHook('beforeCreate');
    this.childNodes = children;
    refresh(() => update(this, props, children));
    const {
      render,
      nodes,
      stopRender
    } = initRender(this);
    this._render = render;
    this._stopRender = stopRender;
    this._nodes = convert(this, nodes);
    this.callHook('created');
    this.created = true;

    if (this._needRefresh) {
      this.refresh();
    }
  }

  _update(props, children) {
    if (this.destroyed) {
      return;
    }

    this.childNodes = children;
    refresh(() => update(this, props, children));
  }

  _destroy() {
    if (this._stopRender) {
      this._stopRender();
    }

    this.parent.children.delete(this.exposed);
    destroy(this._nodes);
  }

  requestDraw() {
    this.container.markDraw(this);
  }

  _draw() {
    const {
      nativeNodes,
      iRender,
      _shadow,
      native
    } = this;

    if (!native || !nativeNodes || !_shadow) {
      this.tree = draw(iRender, this._nodes, this.tree);
      return;
    }

    this.shadowTree = draw(iRender, this._nodes, this.shadowTree);
    this.nativeTree = draw(iRender, nativeNodes, this.nativeTree);
  }

  _mount() {
    const {
      nativeNodes,
      iRender,
      _shadow,
      native,
      _nodes
    } = this;

    if (!native || !nativeNodes || !_shadow) {
      this.tree = draw(iRender, _nodes);
      return;
    }

    this.tree = draw(iRender, convert(this, native));
    this.shadowTree = draw(iRender, _nodes);

    for (const it of getNodes(this.shadowTree)) {
      iRender.insertNode(_shadow, it);
    }

    this.nativeTree = draw(iRender, nativeNodes);

    for (const it of getNodes(this.nativeTree)) {
      iRender.insertNode(native, it);
    }
  }

  _unmount() {
    const {
      iRender,
      nativeTree
    } = this;
    unmount(iRender, this.tree);

    if (!nativeTree) {
      return;
    }

    unmount(iRender, nativeTree);
  }

}

function toElement(t) {
  if (t === false || t === null || t === undefined) {
    return null;
  }

  if (isElement(t)) {
    return t;
  }

  return {
    [isElementSymbol]: true,
    tag: 'Neep:Value',
    key: t,
    value: t,
    children: []
  };
}
function destroy(tree) {
  if (Array.isArray(tree)) {
    tree.forEach(t => destroy(t));
    return;
  }

  const {
    component
  } = tree;

  if (component) {
    component.destroy();
  }
}

function createItem$1(nObject, delivered, source) {
  if (!source) {
    return {
      tag: null,
      key: undefined,
      children: []
    };
  }

  const {
    tag
  } = source;

  if (!tag) {
    return {
      tag: null,
      key: undefined,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: createAll$1(nObject, delivered, source.children),
        component: undefined
      };
    }

    return { ...source,
      children: [],
      component: new ComponentEntity(tag, source.props || {}, source.children, nObject, delivered)
    };
  }

  const ltag = tag.toLowerCase();

  if (ltag === 'neep:container') {
    var _source$props;

    const type = source === null || source === void 0 ? void 0 : (_source$props = source.props) === null || _source$props === void 0 ? void 0 : _source$props.type;
    const iRender = type ? getRender(type) : nObject.iRender;
    return { ...source,
      children: [],
      component: new ContainerEntity(iRender, source.props || {}, source.children, nObject, delivered)
    };
  }

  if (ltag === 'neep:value') {
    return { ...source,
      children: []
    };
  }

  if (ltag === 'neep:deliver') {
    const props = { ...source.props
    };
    delete props.ref;
    delete props.slot;
    delete props.key;
    const newDelivered = updateProps(Object.create(delivered), props, {}, true);
    return { ...source,
      delivered: newDelivered,
      children: createAll$1(nObject, newDelivered, source.children)
    };
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return { ...source,
      children: createAll$1(nObject, delivered, source.children)
    };
  }

  return { ...source,
    children: createAll$1(nObject, delivered, source.children)
  };
}
function createAll$1(nObject, delivered, source) {
  if (!Array.isArray(source)) {
    source = [source];
  }

  if (!source.length) {
    return [];
  }

  return source.map(item => {
    if (!Array.isArray(item)) {
      return createItem$1(nObject, delivered, toElement(item));
    }

    return [...recursive2iterable(item)].map(it => createItem$1(nObject, delivered, toElement(it)));
  });
}

function updateList$1(nObject, delivered, source, tree) {
  if (!Array.isArray(tree)) {
    tree = [tree];
  }

  const newList = [];

  for (const src of recursive2iterable(source)) {
    const node = toElement(src);

    if (!node) {
      continue;
    }

    const index = tree.findIndex(it => it.tag === node.tag && it.key === node.key);

    if (index >= 0) {
      newList.push(updateItem$1(nObject, delivered, node, tree[index]));
      tree.splice(index, 1);
    } else {
      newList.push(createItem$1(nObject, delivered, node));
    }
  }

  destroy(tree);
  return newList;
}

function updateItem$1(nObject, delivered, source, tree) {
  if (!tree) {
    return createItem$1(nObject, delivered, source);
  }

  if (!source) {
    destroy(tree);
    return {
      tag: null,
      key: undefined,
      children: []
    };
  }

  if (Array.isArray(tree)) {
    if (!tree.length) {
      return createItem$1(nObject, delivered, source);
    }

    const index = tree.findIndex(it => it.tag === source.tag);

    if (index < 0) {
      destroy(tree);
      return createItem$1(nObject, delivered, source);
    }

    const all = tree;
    [tree] = tree.splice(index, 1);
    destroy(all);
  }

  const {
    tag
  } = source;

  if (tag !== tree.tag) {
    destroy(tree);
    return createItem$1(nObject, delivered, source);
  }

  if (!tag) {
    return {
      tag: null,
      key: undefined,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: [...updateAll$1(nObject, delivered, source.children, tree.children)],
        component: undefined
      };
    }

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, delivered, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  const ltag = tag.toLowerCase();

  if (ltag === 'neep:container') {
    var _source$props;

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, delivered, source);
    }

    const type = source === null || source === void 0 ? void 0 : (_source$props = source.props) === null || _source$props === void 0 ? void 0 : _source$props.type;
    const iRender = type ? getRender(type) : nObject.iRender;

    if (iRender !== component.iRender) {
      return createItem$1(nObject, delivered, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  if (ltag === 'neep:value') {
    return { ...source,
      children: []
    };
  }

  if (ltag === 'neep:deliver') {
    const props = { ...source.props
    };
    delete props.ref;
    delete props.slot;
    delete props.key;
    const newDelivered = updateProps(tree.delivered || Object.create(delivered), props, tree.props, true);
    return { ...source,
      delivered: newDelivered,
      children: [...updateAll$1(nObject, newDelivered, source.children, tree.children)]
    };
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return { ...source,
      children: [...updateAll$1(nObject, delivered, source.children, tree.children)]
    };
  }

  return { ...source,
    children: [...updateAll$1(nObject, delivered, source.children, tree.children)]
  };
}

function* updateAll$1(nObject, delivered, source, tree) {
  if (!Array.isArray(source)) {
    source = [source];
  }

  let index = 0;
  let length = Math.min(source.length, source.length);

  for (; index < length; index++) {
    const src = source[index];

    if (Array.isArray(src)) {
      yield updateList$1(nObject, delivered, src, tree[index]);
    } else {
      yield updateItem$1(nObject, delivered, toElement(src), tree[index]);
    }
  }

  length = Math.max(source.length, source.length);

  if (tree.length > length) {
    for (; index < length; index++) {
      destroy(tree[index]);
    }
  }

  if (source.length > length) {
    for (; index < length; index++) {
      const src = toElement(source[index]);

      if (Array.isArray(src)) {
        yield [...recursive2iterable(src)].map(it => createItem$1(nObject, delivered, it));
      } else {
        yield createItem$1(nObject, delivered, src);
      }
    }
  }
}

function convert(nObject, source, tree) {
  if (!tree) {
    return createAll$1(nObject, nObject.delivered, source);
  }

  return [...updateAll$1(nObject, nObject.delivered, source, tree)];
}

let awaitDraw = new Set();
let requested = false;

function markDraw(c) {
  awaitDraw.add(c);

  if (requested) {
    return;
  }

  requested = true;
  nextFrame(() => {
    requested = false;
    const list = [...awaitDraw];
    awaitDraw.clear();
    list.map(c => c.drawAll());
  });
}

class ContainerEntity extends EntityObject {
  constructor(iRender, props, children, parent, delivered) {
    super(iRender, parent, delivered);

    _defineProperty(this, "props", void 0);

    _defineProperty(this, "content", []);

    _defineProperty(this, "_node", null);

    _defineProperty(this, "_container", null);

    _defineProperty(this, "rootContainer", this);

    _defineProperty(this, "_drawChildren", false);

    _defineProperty(this, "_drawContainer", false);

    _defineProperty(this, "_awaitDraw", new Set());

    _defineProperty(this, "_needDraw", false);

    _defineProperty(this, "_containers", new Set());

    this.props = props;
    this.parent = parent;

    if (parent) {
      this.rootContainer = parent.container.rootContainer;
    }

    this.callHook('beforeCreate');
    this.childNodes = children;

    const refresh = changed => {
      if (!changed) {
        return;
      }

      this._drawChildren = true;
      this.refresh();
    };

    const slots = Object.create(null);
    this._render = monitor(refresh, () => init(this, this.delivered, this.childNodes, slots, [], false));
    this._nodes = convert(this, this._render());
    this.callHook('created');
    this.created = true;
  }

  setChildren(children) {
    if (this.destroyed) {
      return;
    }

    this.childNodes = children;
    this._drawChildren = true;
    this.refresh();
  }

  setProps(props) {
    if (this.destroyed) {
      return;
    }

    this.props = props;
    this._drawContainer = true;
    this.refresh();
  }

  update(props, children) {
    this.refresh(() => {
      this.setProps(props);
      this.setChildren(children);
    });
  }

  requestDraw() {
    this.markDraw(this);
  }

  _mount() {
    const {
      props,
      parent,
      iRender
    } = this;
    const content = draw(this.container.iRender, this._nodes);
    this.content = content;
    const [container, node] = iRender.mount(props, parent === null || parent === void 0 ? void 0 : parent.iRender);

    for (const it of getNodes(content)) {
      iRender.insertNode(container, it);
    }

    this.tree = [createMountedNode({
      tag: Value,
      key: undefined,
      component: undefined,
      node,
      value: node,
      children: []
    })];
    this._node = node;
    this._container = container;
  }

  _destroy() {
    destroy(this.content);
  }

  _unmount() {
    const {
      parent,
      iRender
    } = this;

    if (parent) {
      unmount(parent.iRender, this.tree);
    }

    iRender.unmount(this._container, this._node, Boolean(parent));
    unmount(this.iRender, this.content);
  }

  _draw() {
    const {
      _drawChildren: drawChildren,
      _drawContainer: drawContainer
    } = this;
    this._drawContainer = false;

    if (drawContainer) {
      var _this$parent;

      this.iRender.drawContainer(this._container, this._node, this.props, (_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.iRender);
    }

    if (this.parent && this.parent.iRender !== this.iRender) {
      return;
    }

    this._drawChildren = false;

    if (drawChildren) {
      this.content = draw(this.iRender, this._nodes, this.content);
    }
  }

  _drawSelf() {
    const {
      _drawChildren: drawChildren,
      _drawContainer: drawContainer
    } = this;
    this._needDraw = false;
    this._drawChildren = false;
    this._drawContainer = false;

    if (drawContainer) {
      var _this$parent2;

      this.iRender.drawContainer(this._container, this._node, this.props, (_this$parent2 = this.parent) === null || _this$parent2 === void 0 ? void 0 : _this$parent2.iRender, true);
    }

    if (drawChildren) {
      this.content = draw(this.iRender, this._nodes, this.content);
    }
  }

  drawSelf() {
    if (!this.mounted) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    this.callHook('beforeDraw');
    exec(c => c && this.markDraw(this), () => this._drawSelf());
    complete(() => this.callHook('drawn'));
  }

  markDraw(nObject, remove = false) {
    var _this$parent3;

    if (((_this$parent3 = this.parent) === null || _this$parent3 === void 0 ? void 0 : _this$parent3.iRender) === this.iRender) {
      this.parent.container.markDraw(nObject, remove);
      return;
    }

    if (nObject === this && this.parent) {
      this.parent.container.markDraw(this, remove);
      this._needDraw = !remove;
    } else if (remove) {
      this._awaitDraw.delete(nObject);
    } else {
      this._awaitDraw.add(nObject);
    }

    this.rootContainer.markDrawContainer(this, !this._needDraw && !this._awaitDraw.size || this.destroyed);
  }

  drawContainer() {
    const {
      _node: node,
      _container: container,
      _awaitDraw: awaitDraw
    } = this;

    if (!node || !container) {
      return;
    }

    this.callHook('beforeDraw');
    const needDraw = this._needDraw;
    this._needDraw = false;
    const list = [...awaitDraw];
    awaitDraw.clear();

    if (needDraw) {
      this.drawSelf();
    }

    list.map(c => c.draw());
    this.iRender.drawNode(container, node);
    complete(() => this.callHook('drawn'));
  }

  markDrawContainer(container, remove = false) {
    if (remove) {
      this._containers.delete(container);
    } else {
      this._containers.add(container);
    }

    markDraw(this);
  }

  drawAll() {
    const containers = this._containers;

    if (!containers.size) {
      return;
    }

    this.callHook('beforeDrawAll');
    const refs = [];
    const completeList = [];
    setCompleteList(completeList);
    setRefList(refs);
    const list = [...containers];
    containers.clear();
    list.forEach(c => c.drawContainer());
    setRefList();
    refs.forEach(r => r());
    completeList.forEach(r => r());
    this.callHook('drawnAll');
  }

}

function render(e, p = {}) {
  let params = { ...p
  };
  const container = new ContainerEntity(getRender(p.type), params, e === undefined ? [] : isElement(e) ? [e] : [createElement(e)]);

  {
    devtools.renderHook(container);
  }

  const {
    exposed
  } = container;
  Reflect.defineProperty(exposed, '$update', {
    value(c) {
      container.setChildren(c === undefined ? [] : isElement(c) ? [c] : [createElement(c)]);
      return exposed;
    },

    configurable: true
  });
  Reflect.defineProperty(exposed, '$mount', {
    value(target) {
      if (exposed.$mounted) {
        return exposed;
      }

      if (target) {
        params.target = target;
        container.setProps(params);
      }

      container.mount();
      return exposed;
    },

    configurable: true
  });
  Reflect.defineProperty(exposed, '$unmount', {
    value() {
      if (!exposed.$mounted) {
        return;
      }

      if (exposed.$unmounted) {
        return;
      }

      if (exposed.$destroyed) {
        return container.destroy();
      }

      container.unmount();
    },

    configurable: true
  });

  if (params.target) {
    container.mount();
  }

  return exposed;
}

function Mark(symbol, value) {
  return component => {
    component[symbol] = value;
    return component;
  };
}

function MarkValue(symbol, key, value) {
  return component => {
    let obj = component[symbol];

    if (!obj) {
      obj = Object.create(null);
      component[symbol] = obj;
    }

    obj[key] = value;
    return component;
  };
}

function mName(name, component) {
  if (!component) {
    return Mark(nameSymbol, name);
  }

  component[nameSymbol] = name;
  return component;
}
function mType(type, component) {
  if (!component) {
    return Mark(typeSymbol, type);
  }

  component[typeSymbol] = type;
  return component;
}
function mSimple(component) {
  if (!component) {
    return Mark(typeSymbol, 'simple');
  }

  component[typeSymbol] = 'simple';
  return component;
}
function mNative(component) {
  if (!component) {
    return Mark(typeSymbol, 'native');
  }

  component[typeSymbol] = 'native';
  return component;
}
function mRender(fn, component) {
  if (!component) {
    return Mark(renderSymbol, fn);
  }

  component[renderSymbol] = fn;
  return component;
}
function mConfig(name, config, component) {
  const mark = MarkValue(configSymbol, name, config);

  if (!component) {
    return mark;
  }

  return mark(component);
}
function mComponent(name, item, component) {
  const mark = MarkValue(componentsSymbol, name, item);

  if (!component) {
    return mark;
  }

  return mark(component);
}
function create(c, r) {
  if (typeof r === 'function') {
    c[renderSymbol] = r;
  }

  return c;
}
function mark(component, ...marks) {
  for (const m of marks) {
    m(component);
  }

  return component;
}

function lazy(component, Placeholder) {
  const reslut = value(0);
  const ComponentValue = value(undefined);

  async function load() {
    if (reslut()) {
      return;
    }

    reslut(1);

    try {
      const c = await component();

      if (typeof c === 'function') {
        ComponentValue(c);
        return;
      }

      if (!c) {
        reslut(-1);
        return;
      }

      if (typeof c.default === 'function') {
        ComponentValue(c.default);
        return;
      }

      reslut(-1);
    } catch (_unused) {
      reslut(-1);
    }
  }

  function Lazy(props, {
    childNodes
  }) {
    const com = ComponentValue();

    if (com) {
      return createElement(com, props, ...childNodes);
    }

    load();

    if (!Placeholder) {
      return null;
    }

    return createElement(Placeholder, {
      loading: reslut() > 0
    });
  }

  return mark(Lazy, mSimple, mName('Lazy'));
}

export { Container, Deliver, NeepError as Error, EventEmitter, Fragment, ScopeSlot, Slot, SlotRender, Template, Value, addContextConstructor, addEntityConstructor, asValue, byService, callHook, checkCurrent, componentsSymbol, computed, configSymbol, create, createElement, current, deliver, elements, encase, equal, equalProps, expose, getRect, hook, install, isElement, isElementSymbol, isProduction, isValue, label$1 as label, lazy, mComponent, mConfig, mName, mNative, mRender, mSimple, mType, mark, nameSymbol, recover, refresh, register, render, renderSymbol, setHook, typeSymbol, useService, useValue, value, valueify, version, watch };
