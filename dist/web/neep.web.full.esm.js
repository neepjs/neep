/*!
 * neep v0.1.0-alpha.0
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
const version = '0.1.0-alpha.0';
const mode = 'development';
const isProduction = mode === 'production';

var Constant = /*#__PURE__*/Object.freeze({
	__proto__: null,
	version: version,
	mode: mode,
	isProduction: isProduction
});

let monitorable;
const renders = Object.create(null);
function getRender(type = '') {
  if (typeof type === 'object') {
    return type;
  }

  return renders[type] || renders.default;
}

function installRender({
  render,
  renders: list
}) {
  if (render) {
    renders[render.type] = render;

    if (!renders.default) {
      renders.default = render;
    }
  }

  if (Array.isArray(list)) {
    for (const render of list) {
      renders[render.type] = render;
    }

    if (!renders.default) {
      const [render] = list;

      if (render) {
        renders.default = render;
      }
    }
  }
}

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

function install(apis) {
  if (apis.monitorable) {
    monitorable = apis.monitorable;
  }

  installRender(apis);

  {
    installDevtools(apis.devtools);
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

const ScopeSlot = 'Neep:ScopeSlot';
const SlotRender = 'Neep:SlotRender';
const Slot = 'Neep:Slot';
const Value = 'Neep:Value';
const Container = 'Neep:Container';
const Deliver = 'Neep:Deliver';
const Template = 'template';
const Fragment = Template;

var Tags = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ScopeSlot: ScopeSlot,
	SlotRender: SlotRender,
	Slot: Slot,
	Value: Value,
	Container: Container,
	Deliver: Deliver,
	Template: Template,
	Fragment: Fragment
});

function value(...v) {
  return monitorable.value(...v);
}
function computed(...v) {
  return monitorable.computed(...v);
}
function isValue(...v) {
  return monitorable.isValue(...v);
}
function encase(...v) {
  return monitorable.encase(...v);
}
function recover(...v) {
  return monitorable.recover(...v);
}

var State = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value,
	computed: computed,
	isValue: isValue,
	encase: encase,
	recover: recover
});

let current;
function setCurrent(fn, entity) {
  const oldEntity = current;
  current = entity;

  try {
    return fn();
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
function initContext(context, exposed) {
  for (const constructor of constructors) {
    constructor(context, exposed);
  }

  return context;
}
function addContextConstructor(constructor) {
  constructors.push(monitorable.safeify(constructor));
}

const hooks = Object.create(null);
function setHook(id, hook, entity) {
  let list = (entity === null || entity === void 0 ? void 0 : entity.$_hooks) || hooks;

  if (!list) {
    return () => {};
  }

  hook = monitorable.safeify(hook);
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

  const stop = isValue(value) ? value.watch(cb) : monitorable.computed(value).watch((v, s) => cb(v(), s));
  setHook('beforeDestroy', () => stop(), entity);
  return stop;
}
function hook(name, hook, initOnly) {
  const entity = checkCurrent('setHook');

  if (initOnly && entity.created) {
    return undefined;
  }

  return setHook(name, hook, entity);
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

var Life = /*#__PURE__*/Object.freeze({
	__proto__: null,
	watch: watch,
	hook: hook,
	setValue: setValue,
	expose: expose,
	deliver: deliver
});

const isElementSymbol = Symbol.for('isNeepElement');
const typeSymbol = Symbol.for('type');
const nameSymbol = Symbol.for('name');
const renderSymbol = Symbol.for('render');

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
    children: []
  };

  if ('key' in attrs) {
    node.key = attrs.key;
  }

  if ('slot' in attrs) {
    node.slot = attrs.slot;
  }

  if (typeof attrs.ref === 'function') {
    node.ref = attrs.ref;
  }

  if (tag === Value) {
    node.value = attrs.value;
    return node;
  }

  node.children = children;

  if (tag === Template) {
    return node;
  }

  if (tag === SlotRender) {
    node.render = attrs.render;
    return node;
  }

  if (tag === ScopeSlot || tag === Slot) {
    const {
      render,
      argv,
      args,
      name
    } = attrs;
    node.render = render;
    node.args = argv && [argv] || Array.isArray(args) && args.length && args || [{}];

    if (tag === ScopeSlot) {
      node.props = {
        name
      };
      return node;
    }
  }

  node.on = {};
  node.props = {};

  for (let k in attrs) {
    const onInfo = /^(::|@|on:)([a-zA-Z0-9].*)$/.exec(k);

    if (onInfo) {
      node.on[onInfo[2]] = attrs[k];
      continue;
    }

    const nCmd = /^n([:-])([a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*)$/i.exec(k);

    if (!nCmd) {
      node.props[k] = attrs[k];
      continue;
    }
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
    return [];
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
    simple
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

var Element$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	isElement: isElement,
	createElement: createElement,
	elements: elements
});

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

var Dev = /*#__PURE__*/Object.freeze({
	__proto__: null,
	label: label$1
});

const auxiliary = { ...Tags,
  ...State,
  ...Life,
  ...Element$1,
  ...Dev,
  ...Constant
};
function setAuxiliary(name, value) {
  Reflect.defineProperty(auxiliary, name, {
    value,
    enumerable: true,
    configurable: true
  });
}
function defineAuxiliary(name, get) {
  Reflect.defineProperty(auxiliary, name, {
    get,
    enumerable: true,
    configurable: true
  });
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

  if (node) {
    if (ref) {
      ref(node, true);
    }

    iRender.remove(node);
    return;
  }

  if (component) {
    if (ref) {
      ref(component.exposed, true);
    }

    component.unmount();
    return;
  }

  unmount(iRender, children);
}

function replace(iRender, newTree, oldTree) {
  const next = getFirstNode(oldTree);

  if (!next) {
    return newTree;
  }

  const parent = iRender.parent(next);

  if (!parent) {
    return newTree;
  }

  for (const it of getNodes(newTree)) {
    iRender.insert(parent, it, next);
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
  const parent = iRender.parent(last);

  if (!parent) {
    return newList;
  }

  let next = iRender.next(last);

  for (let i = newList.length - 1; i >= 0; i--) {
    const item = newList[i];
    const index = tree.findIndex(o => mountedMap.get(o) === item);

    if (index >= 0) {
      for (const it of tree.splice(index)) {
        mountedMap.delete(it);
      }
    } else {
      for (const it of getNodes(item)) {
        iRender.insert(parent, it, next);
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
    const parent = iRender.parent(last);
    const next = iRender.next(last);

    for (; index < length; index++) {
      const src = source[index];
      const item = Array.isArray(src) ? createList(iRender, src) : createItem(iRender, src);
      list.push(item);

      if (!parent) {
        continue;
      }

      for (const it of getNodes(item)) {
        iRender.insert(parent, it, next);
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
  const ref = source.ref !== tree.ref && source.ref;

  if (tag !== tree.tag || component !== tree.component) {
    return replace(iRender, createItem(iRender, source), tree);
  }

  if (!tag) {
    return tree;
  }

  if (typeof tag !== 'string' || tag === Container) {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: draw(iRender, source.children, tree.children)
      }, tree.id);
    }

    if (ref) {
      ref(component.exposed);
    }

    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    }, tree.id);
  }

  if (tag === Value) {
    if (tree.value === source.value) {
      if (ref && tree.node) {
        ref(tree.node);
      }

      return createMountedNode({ ...tree,
        ...source,
        children: []
      }, tree.id);
    }

    return replace(iRender, createValue(iRender, source), tree);
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: updateAll(iRender, source.children, tree.children)
    }, tree.id);
  }

  const {
    node
  } = tree;
  iRender.update(node, source.props || {});

  if (ref) {
    ref(node);
  }

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
      iRender.insert(node, it);
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

function createValue(iRender, source) {
  const {
    value,
    ref
  } = source;

  if (iRender.isNode(source.value)) {
    if (ref) {
      ref(value);
    }

    return createMountedNode({ ...source,
      node: value,
      children: [],
      component: undefined
    });
  }

  const type = typeof value;
  let node;

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'string' || type === 'symbol' || value instanceof RegExp) {
    node = iRender.text(String(value));
  } else if (value instanceof Date) {
    node = iRender.text(value.toISOString());
  } else if (type === 'object' && value) {
    node = iRender.text(String(value));
  }

  if (!node) {
    node = iRender.placeholder();
  }

  if (ref) {
    ref(node);
  }

  return createMountedNode({ ...source,
    node,
    component: undefined,
    children: []
  });
}

function createAll(iRender, source) {
  if (!source.length) {
    return [createMountedNode({
      tag: null,
      node: iRender.placeholder(),
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
    node: iRender.placeholder(),
    component: undefined,
    children: []
  })];
}

function createItem(iRender, source) {
  const {
    tag,
    ref,
    component
  } = source;

  if (!tag) {
    const node = iRender.placeholder();

    if (ref) {
      ref(node);
    }

    return createMountedNode({
      tag: null,
      node,
      component: undefined,
      children: []
    });
  }

  if (typeof tag !== 'string' || tag === Container) {
    if (!component) {
      return createMountedNode({ ...source,
        node: undefined,
        component: undefined,
        children: draw(iRender, source.children)
      });
    }

    component.mount();

    if (ref) {
      ref(component.exposed);
    }

    return createMountedNode({ ...source,
      node: undefined,
      component,
      children: []
    });
  }

  if (tag === Value) {
    return createValue(iRender, source);
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return createMountedNode({ ...source,
      node: undefined,
      component: undefined,
      children: createAll(iRender, source.children)
    });
  }

  const node = iRender.create(tag, source.props || {});

  if (ref) {
    ref(node);
  }

  let children = [];

  if (source.children) {
    children = createAll(iRender, source.children);

    for (const it of getNodes(children)) {
      iRender.insert(node, it);
    }
  }

  return createMountedNode({ ...source,
    node,
    component: undefined,
    children
  });
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

    if (native) {
      if (iRender.isNode(it)) {
        nativeList.push(it);
        continue;
      }

      if (!isElement(it)) {
        nativeList.push(it);
        continue;
      }

      if (it.tag !== SlotRender) {
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

    if (typeof it.render === 'function') {
      return it.render(...props);
    }

    return it.children;
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

function setSlots(children, slots = Object.create(null)) {
  for (const k of Reflect.ownKeys(slots)) {
    if (!(k in children)) {
      delete slots[k];
    }
  }

  for (const k of Reflect.ownKeys(children)) {
    slots[k] = createSlots(k, children[k]);
  }

  return slots;
}

function updateProps(obj, props, oldProps = {}, define = false) {
  const newKeys = new Set(Reflect.ownKeys(props));

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

function execSimple(nObject, delivered, node, tag, children) {
  const {
    iRender
  } = nObject.container;
  const slotMap = Object.create(null);
  getSlots(iRender, children, slotMap);
  const slots = setSlots(slotMap);
  const context = initContext({
    slots,
    created: false,
    parent: nObject.exposed,
    delivered,
    children: new Set(),
    childNodes: children,

    refresh(f) {
      nObject.refresh(f);
    }

  });

  {
    getLabel();
  }

  const result = tag({ ...node.props
  }, context, auxiliary);
  let label;

  {
    label = getLabel();
  }

  const nodes = exec(nObject, delivered, renderNode(iRender, result, context, tag[renderSymbol]), slots);
  return { ...node,
    children: Array.isArray(nodes) ? nodes : [nodes],
    label
  };
}

function execSlot(node, slots, children, args = [{}]) {
  var _node$props;

  const slotName = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.name) || 'default';
  const slot = slots[slotName];

  if (typeof slot === 'function') {
    return { ...node,
      ...slot(...args)
    };
  }

  const {
    render
  } = node;
  const label =  [`[${slotName}]`, '#00F'];
  return { ...node,
    tag: ScopeSlot,
    label,
    children: typeof render !== 'function' ? children : render(...args)
  };
}

function exec(nObject, delivered, node, slots, native = false) {
  if (Array.isArray(node)) {
    return node.map(n => exec(nObject, delivered, n, slots, native));
  }

  if (!isElement(node)) {
    return node;
  }

  let {
    tag,
    inserted,
    args = [{}]
  } = node;

  if (tag === Deliver) {
    const props = { ...node.props
    };
    delete props.ref;
    delete props.slot;
    delete props.key;
    const newDelivered = Object.create(delivered);
    updateProps(newDelivered, props || {}, {}, true);
    return { ...node,
      tag,
      $__neep__delivered: newDelivered,
      children: node.children.map(n => exec(nObject, newDelivered, n, slots, native))
    };
  }

  const children = node.children.map(n => exec(nObject, delivered, n, slots, native));

  if (typeof tag === 'function') {
    if (tag[typeSymbol] === 'simple') {
      return execSimple(nObject, delivered, node, tag, children);
    }

    return { ...node,
      $__neep__delivered: delivered,
      children,
      tag
    };
  }

  if (tag === Slot) {
    tag = native ? 'slot' : ScopeSlot;
  }

  if (tag !== ScopeSlot || inserted) {
    return { ...node,
      children,
      tag
    };
  }

  return execSlot(node, slots, children, args);
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
      children: []
    }];
  }

  if (!iRender.isNode(node) && typeof node === 'object' && render) {
    node = render(node, context, auxiliary);
  }

  if (isElement(node)) {
    return [node];
  }

  if (node === undefined || node === null) {
    return [{
      [isElementSymbol]: true,
      tag: null,
      children: []
    }];
  }

  return [{
    [isElementSymbol]: true,
    tag: Value,
    value: node,
    children: []
  }];
}

function normalize(nObject, result) {
  return exec(nObject, nObject.delivered, renderNode(nObject.iRender, result, nObject.context, nObject.component[renderSymbol]), nObject.context.slots, Boolean(nObject.native));
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

      value(f) {
        obj.refresh(f);
      }

    }
  };
  const entity = Object.create(null, cfg);
  return entity;
}

class NeepObject {
  constructor(iRender, parent, delivered = (parent === null || parent === void 0 ? void 0 : parent.delivered) || Object.create(null), container) {
    _defineProperty(this, "iRender", void 0);

    _defineProperty(this, "parentDelivered", void 0);

    _defineProperty(this, "delivered", void 0);

    _defineProperty(this, "exposed", createExposed(this));

    _defineProperty(this, "entity", createEntity(this));

    _defineProperty(this, "parent", void 0);

    _defineProperty(this, "native", null);

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

    this.iRender = iRender;
    this.parentDelivered = delivered;
    this.delivered = Object.create(delivered);

    if (parent) {
      this.parent = parent;
    }

    this.container = container || this;
  }

  get canRefresh() {
    return !this._delayedRefresh;
  }

  get needRefresh() {
    if (this._delayedRefresh) {
      return false;
    }

    const needRefresh = this._needRefresh;
    this._needRefresh = false;
    return needRefresh;
  }

  _refresh() {}

  refresh(f) {
    if (typeof f === 'function') {
      try {
        this._delayedRefresh++;
        f();
      } finally {
        this._delayedRefresh--;

        if (this._delayedRefresh <= 0) {
          this.refresh();
        }
      }

      return;
    }

    if (this.destroyed) {
      return;
    }

    if (!this.created) {
      return;
    }

    this._needRefresh = true;

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

    this._refresh();
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

    this._mount();

    this.callHook('mounted');
    this.mounted = true;
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

    this.callHook('beforeUpdate');

    this._draw();

    this.callHook('updated');
  }

}

function update(nObject, props, children) {
  updateProps(nObject.props, props);
  const slots = Object.create(null);
  const {
    native,
    container: {
      iRender
    }
  } = nObject;
  const childNodes = getSlots(iRender, children, slots, Boolean(native));
  setSlots(slots, nObject.slots);

  if (!native) {
    return;
  }

  nObject.nativeNodes = convert(nObject, childNodes, nObject.nativeNodes);
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

    refresh(f) {
      nObject.refresh(f);
    }

  }, nObject.exposed);
}

function initRender(nObject) {
  const {
    component,
    props,
    context,
    entity
  } = nObject;

  const refresh = changed => changed && nObject.refresh();

  const result = monitorable.exec(() => setCurrent(() => component(props, context, auxiliary), entity), refresh, true);

  if (typeof result === 'function') {
    const render = monitorable.createExecutable(() => normalize(nObject, result()), refresh);
    return {
      nodes: render(),
      render,
      stopRender: () => render.stop()
    };
  }

  const render = monitorable.createExecutable(() => normalize(nObject, setCurrent(() => component(props, context, auxiliary), entity)), refresh);
  return {
    nodes: monitorable.exec(() => normalize(nObject, result), refresh, true),
    render,
    stopRender: () => render.stop()
  };
}

class Entity extends NeepObject {
  constructor(component, props, children, parent, delivered) {
    super(parent.iRender, parent, delivered, parent.container);

    _defineProperty(this, "component", void 0);

    _defineProperty(this, "props", monitorable.encase(Object.create(null)));

    _defineProperty(this, "slots", monitorable.encase(Object.create(null)));

    _defineProperty(this, "_stopRender", void 0);

    _defineProperty(this, "nativeNodes", void 0);

    _defineProperty(this, "nativeTree", []);

    _defineProperty(this, "context", void 0);

    _defineProperty(this, "parent", void 0);

    this.component = component;
    Reflect.defineProperty(this.exposed, '$component', {
      value: component,
      enumerable: true,
      configurable: true
    });
    this.parent = parent;
    parent.children.add(this.exposed);
    const context = createContext(this);
    this.context = context;
    this.callHook('beforeCreate');
    this.childNodes = children;
    update(this, props, children);
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
    update(this, props, children);
  }

  _destroy() {
    if (this._stopRender) {
      this._stopRender();
    }

    this.parent.children.delete(this.exposed);
    destroy(this._nodes);
  }

  _refresh() {
    this.container.markDraw(this);
  }

  _draw() {
    this.tree = draw(this.container.iRender, this._nodes, this.tree);
  }

  _mount() {
    this.tree = draw(this.container.iRender, this._nodes);
  }

  _unmount() {
    unmount(this.container.iRender, this.tree);
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
    tag: Value,
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

function createItem$1(nObject, source) {
  if (!source) {
    return {
      tag: null,
      children: []
    };
  }

  const {
    tag
  } = source;

  if (!tag) {
    return {
      tag: null,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: convert(nObject, source.children),
        component: undefined
      };
    }

    return { ...source,
      children: [],
      component: new Entity(tag, source.props || {}, source.children, nObject, source.$__neep__delivered)
    };
  }

  if (tag === Container) {
    var _source$props;

    const type = source === null || source === void 0 ? void 0 : (_source$props = source.props) === null || _source$props === void 0 ? void 0 : _source$props.type;
    const iRender = type ? getRender(type) : nObject.iRender;
    return { ...source,
      children: [],
      component: new Container$1(iRender, source.props || {}, source.children, nObject, source.$__neep__delivered)
    };
  }

  if (tag === Value) {
    return { ...source,
      children: []
    };
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    return { ...source,
      children: convert(nObject, source.children)
    };
  }

  return { ...source,
    children: convert(nObject, source.children)
  };
}

function updateList$1(nObject, source, tree) {
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
      newList.push(updateItem$1(nObject, node, tree[index]));
      tree.splice(index, 1);
    } else {
      newList.push(createItem$1(nObject, node));
    }
  }

  destroy(tree);
  return newList;
}

function updateItem$1(nObject, source, tree) {
  if (!tree) {
    return createItem$1(nObject, source);
  }

  if (!source) {
    destroy(tree);
    return {
      tag: null,
      children: []
    };
  }

  if (Array.isArray(tree)) {
    if (!tree.length) {
      return createItem$1(nObject, source);
    }

    const index = tree.findIndex(it => it.tag === source.tag);

    if (index < 0) {
      destroy(tree);
      return createItem$1(nObject, source);
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
    return createItem$1(nObject, source);
  }

  if (!tag) {
    return {
      tag: null,
      children: []
    };
  }

  if (typeof tag !== 'string') {
    if (tag[typeSymbol] === 'simple') {
      return { ...source,
        children: convert(nObject, source.children, tree.children),
        component: undefined
      };
    }

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  if (tag === Container) {
    var _source$props2;

    const {
      component
    } = tree;

    if (!component) {
      return createItem$1(nObject, source);
    }

    const type = source === null || source === void 0 ? void 0 : (_source$props2 = source.props) === null || _source$props2 === void 0 ? void 0 : _source$props2.type;
    const iRender = type ? getRender(type) : nObject.iRender;

    if (iRender !== component.iRender) {
      return createItem$1(nObject, source);
    }

    component.update(source.props || {}, source.children);
    return { ...source,
      children: [],
      component
    };
  }

  if (tag === Value) {
    return { ...source,
      children: []
    };
  }

  if (tag === Template || tag.substr(0, 5) === 'Neep:') {
    let delivered;

    if (Deliver === tag) {
      const props = { ...source.props
      };
      delete props.ref;
      delete props.slot;
      delete props.key;
      delivered = updateProps(tree.$__neep__delivered, props, tree.props, true);
    }

    return { ...source,
      $__neep__delivered: delivered,
      children: convert(nObject, source.children, tree.children)
    };
  }

  return { ...source,
    children: convert(nObject, source.children, tree.children)
  };
}

function createAll$1(nObject, source) {
  if (!source.length) {
    return [];
  }

  return source.map(item => {
    if (!Array.isArray(item)) {
      return createItem$1(nObject, toElement(item));
    }

    return [...recursive2iterable(item)].map(it => createItem$1(nObject, toElement(it)));
  });
}

function* updateAll$1(nObject, source, tree) {
  let index = 0;
  let length = Math.min(source.length, source.length);

  for (; index < length; index++) {
    const src = source[index];

    if (Array.isArray(src)) {
      yield updateList$1(nObject, src, tree[index]);
    } else {
      yield updateItem$1(nObject, toElement(src), tree[index]);
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
      const src = source[index];

      if (Array.isArray(src)) {
        yield [...recursive2iterable(src)].map(it => createItem$1(nObject, it));
      } else {
        yield createItem$1(nObject, src);
      }
    }
  }
}

function convert(nObject, source, tree) {
  if (!Array.isArray(source)) {
    source = [];
  }

  if (!tree) {
    return createAll$1(nObject, source);
  }

  return [...updateAll$1(nObject, source, tree)];
}

let awaitDraw = new Set();
let requested = false;

function markDraw(c) {
  awaitDraw.add(c);

  if (requested) {
    return;
  }

  requested = true;
  window.requestAnimationFrame(() => {
    requested = false;
    const list = [...awaitDraw];
    awaitDraw.clear();
    list.map(c => c.drawAll());
  });
}

class Container$1 extends NeepObject {
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

    this._render = () => children;

    this._nodes = convert(this, children);
    this.callHook('created');
    this.created = true;
  }

  setChildren(children) {
    if (this.destroyed) {
      return;
    }

    this.childNodes = children;

    this._render = () => children;

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

  _refresh() {
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
      iRender.insert(container, it);
    }

    this.tree = [createMountedNode({
      tag: Value,
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

  _draw() {}

  drawSelf() {
    if (!this.mounted) {
      return;
    }

    if (this.destroyed) {
      return;
    }

    const {
      _drawChildren: drawChildren,
      _drawContainer: drawContainer
    } = this;
    this._needDraw = false;
    this._drawChildren = false;
    this._drawContainer = false;
    this.callHook('beforeUpdate');

    if (drawContainer) {
      var _this$parent;

      this.iRender.drawContainer(this._container, this._node, this.props, (_this$parent = this.parent) === null || _this$parent === void 0 ? void 0 : _this$parent.iRender);
    }

    if (drawChildren) {
      this.content = draw(this.iRender, this._nodes, this.content);
    }

    this.callHook('updated');
  }

  markDraw(nObject, remove = false) {
    if (nObject === this) {
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
    this.iRender.draw(container, node);
    this.callHook('drawn');
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
    const list = [...containers];
    list.map(c => c.drawContainer());
    this.callHook('drawnAll');
  }

}

function render(e, p = {}) {
  let params = { ...p
  };
  const container = new Container$1(getRender(p.type), params, e === undefined ? [] : isElement(e) ? [e] : [createElement(e)]);

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
      return;
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

function getId(v) {
  if (typeof v === 'string') {
    return v;
  }

  if (typeof v === 'number') {
    return String(v);
  }

  return undefined;
}

function getClass(list) {
  const set = new Set();

  for (const v of recursive2iterable(list)) {
    if (!v) {
      continue;
    }

    if (typeof v === 'string') {
      for (let k of v.split(' ').filter(Boolean)) {
        set.add(k);
      }
    } else if (typeof v === 'object') {
      for (const k in v) {
        const add = v[k];

        for (let it of k.split(' ').filter(Boolean)) {
          set[add ? 'add' : 'delete'](it);
        }
      }
    }
  }

  if (!set.size) {
    return undefined;
  }

  return set;
}

function getStyle(style) {
  if (typeof style === 'string') {
    return style;
  }

  if (!style) {
    return undefined;
  }

  if (typeof style !== 'object') {
    return undefined;
  }

  const css = Object.create(null);

  for (let k in style) {
    let value = style[k];
    const key = k.substr(0, 2) === '--' ? k : k.replace(/[A-Z]/g, '-$1').replace(/-+/g, '-').toLowerCase();

    if (typeof value === 'number') {
      css[key] = [value === 0 ? '0' : `${value}px`, null];
    } else if (value && typeof value === 'string') {
      const v = value.replace(/\!important\s*$/, '');
      css[key] = [v, v === value ? null : 'important'];
    }
  }

  return css;
}

function stringify(data, isOn = false) {
  if (data === undefined || data === null) {
    return null;
  }

  if (isOn && typeof data === 'function') {
    return null;
  }

  if (typeof data === 'boolean') {
    return data ? '' : null;
  }

  if (typeof data !== 'object') {
    return String(data);
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (data instanceof RegExp) {
    return data.toString();
  }

  return JSON.stringify(data);
}

function getAttrs(props) {
  const attrs = Object.create(null);

  for (const k in props) {
    const name = k.replace(/([A-Z])/g, '-$1').replace(/(\-)\-+/g, '$1').toLowerCase();

    switch (name) {
      case 'is':
        continue;

      case 'id':
        continue;

      case 'style':
        continue;

      case 'class':
        continue;
    }

    const value = stringify(props[k], name.substr(0, 2) === 'on');

    if (value !== null) {
      attrs[name] = value;
    }
  }

  return attrs;
}

function getEvent(props) {
  const evt = Object.create(null);

  for (const k in props) {
    const f = props[k];

    if (typeof f !== 'function') {
      continue;
    }

    if (k.substr(0, 2) !== 'on') {
      continue;
    }

    evt[k.substr(2).toLowerCase()] = new Set([f]);
  }

  return evt;
}

function getProps({
  id,
  class: className,
  style,
  ...attrs
}) {
  return {
    id: getId(id),
    classes: getClass(className),
    style: getStyle(style),
    attrs: getAttrs(attrs),
    event: getEvent(attrs)
  };
}

function updateClass(el, classes, oClasses) {
  if (classes && oClasses) {
    const list = el.getAttribute('class') || '';
    const classList = new Set(list.split(' ').filter(Boolean));
    oClasses.forEach(c => classList.delete(c));
    classes.forEach(c => classList.add(c));
    el.setAttribute('class', [...classList].join(' '));
  } else if (classes) {
    el.setAttribute('class', [...classes].join(' '));
  } else if (oClasses) {
    el.removeAttribute('class');
  }
}

function updateStyle(css, style, oStyle) {
  if (!style) {
    if (!oStyle) {
      return;
    }

    if (typeof oStyle === 'string') {
      css.cssText = '';
      return;
    }

    for (const k of Object.keys(oStyle)) {
      css.removeProperty(k);
    }

    return;
  }

  if (typeof style === 'string') {
    if (style !== typeof oStyle) {
      css.cssText = style;
    }

    return;
  }

  if (!oStyle || typeof oStyle === 'string') {
    if (typeof oStyle === 'string') {
      css.cssText = '';
    }

    for (const k of Object.keys(style)) {
      css.setProperty(k, ...style[k]);
    }

    return;
  }

  for (const k of Object.keys(style)) {
    const v = style[k];

    if (!oStyle[k] || oStyle[k][0] !== v[0] || oStyle[k][1] !== v[1]) {
      css.setProperty(k, ...v);
    }
  }

  for (const k of Object.keys(oStyle)) {
    if (!style[k]) {
      css.removeProperty(k);
    }
  }
}

function updateAttrs(el, attrs, oAttrs) {
  for (const k of Object.keys(attrs)) {
    const v = attrs[k];

    if (!(k in oAttrs) || oAttrs[k] !== v) {
      el.setAttribute(k, v);
    }
  }

  for (const k of Object.keys(oAttrs)) {
    if (!(k in attrs)) {
      el.removeAttribute(k);
    }
  }
}

function updateEvent(el, evt, oEvt) {
  for (const k of Object.keys(evt)) {
    const set = evt[k];

    if (k in oEvt) {
      const oSet = oEvt[k];

      for (const f of set) {
        if (!oSet.has(f)) {
          el.addEventListener(k, f);
        }
      }

      for (const f of oSet) {
        if (!set.has(f)) {
          el.removeEventListener(k, f);
        }
      }
    } else {
      for (const f of set) {
        el.addEventListener(k, f);
      }
    }
  }

  for (const k of Object.keys(oEvt)) {
    if (k in evt) {
      continue;
    }

    for (const f of oEvt[k]) {
      el.removeEventListener(k, f);
    }
  }
}

const PropsMap = new WeakMap();
function update$1(el, props) {
  const old = PropsMap.get(el) || {
    attrs: {},
    event: {}
  };
  const {
    id,
    classes,
    style,
    attrs,
    event
  } = getProps(props);
  PropsMap.set(el, {
    id,
    classes,
    style,
    attrs,
    event
  });

  if (id !== old.id) {
    if (typeof id === 'string') {
      el.id = props.id;
    } else {
      el.removeAttribute('id');
    }
  }

  updateClass(el, classes, old.classes);
  updateStyle(el.style, style, old.style);
  updateAttrs(el, attrs, old.attrs);
  updateEvent(el, event, old.event);
  return el;
}

const render$1 = {
  type: 'html',

  isNode(v) {
    return v instanceof Node;
  },

  mount({
    target,
    class: className,
    style,
    tag
  }, parent) {
    if (!(typeof tag === 'string' && /^[a-z][a-z0-9]*(?:\-[a-z0-9]+)?(?:\:[a-z0-9]+(?:\-[a-z0-9]+)?)?$/i.test(tag))) {
      tag = 'div';
    }

    const container = render$1.create(tag, {
      class: className,
      style
    });

    if (typeof target === 'string') {
      target = document.querySelector(target);
    }

    if (target instanceof Element) {
      target.appendChild(container);

      if (parent) {
        return [container, parent.placeholder];
      }

      return [container, container];
    }

    if (parent !== render$1) {
      document.body.appendChild(container);
      return [container, container];
    }

    return [container, container];
  },

  unmount(container, node, removed) {
    if (container === node && removed) {
      return;
    }

    container.remove();
  },

  drawContainer(container, node, {
    target,
    class: className,
    style,
    tag
  }, parent) {
    render$1.update(container, {
      class: className,
      style
    });

    if (typeof target === 'string') {
      target = document.querySelector(target);
    }

    if (parent !== render$1 && !(target instanceof Element)) {
      target = document.body;
    }

    const oldTarget = parent === render$1 && container === node ? undefined : render$1.parent(node);

    if (oldTarget === target) {
      return [container, node];
    }

    if (parent !== render$1) {
      target.appendChild(container);
      return [container, node];
    }

    if (!oldTarget) {
      const newNode = parent.placeholder();
      const pNode = parent.parent(node);

      if (pNode) {
        render$1.insert(pNode, newNode, node);
        render$1.remove(node);
      }

      return [container, newNode];
    }

    if (!target) {
      const pNode = parent.parent(node);

      if (pNode) {
        render$1.insert(pNode, container, node);
        render$1.remove(node);
      }

      return [container, container];
    }

    target.appendChild(node);
    return [container, node];
  },

  draw() {},

  create(tag, props) {
    return update$1(document.createElement(tag), props);
  },

  text(text) {
    return document.createTextNode(text);
  },

  placeholder() {
    return document.createComment('');
  },

  component() {
    const node = document.createElement('neep-component');
    node.attachShadow({
      mode: 'open'
    });
    return [node, node.attachShadow({
      mode: 'open'
    })];
  },

  parent(node) {
    return node.parentNode;
  },

  next(node) {
    return node.nextSibling;
  },

  update(node, props) {
    update$1(node, props);
  },

  insert(parent, node, next = null) {
    parent.insertBefore(node, next);
  },

  remove(node) {
    const p = render$1.parent(node);

    if (!p) {
      return;
    }

    p.removeChild(node);
  }

};

/*!
 * monitorable v0.1.0-alpha.3
 * (c) 2020 Fierflame
 * @license MIT
 */
let printErrorLog;

function printError(info, print = false) {
  if (!print && (typeof info === 'function' || info === undefined)) {
    printErrorLog = info;
    return;
  }

  if (typeof printErrorLog === 'function') {
    printErrorLog(info);
    return;
  }

  console.error(info);
}

function encashable(v) {
  return Boolean(v && ['object', 'function'].includes(typeof v));
}

function safeify(fn) {
  return (...p) => {
    try {
      fn(...p);
    } catch (e) {
      printError(e, true);
    }
  };
}

function getMapValue(map, key, def) {
  if (map.has(key)) {
    return map.get(key);
  }

  const value = def();
  map.set(key, value);
  return value;
}

let read;

function markRead(obj, prop) {
  if (!read) {
    return;
  }

  const set = getMapValue(read, obj, () => new Set());

  if (typeof prop === 'number') {
    prop = String(prop);
  }

  set.add(prop);
}

function observe(fn, map) {
  const oldRead = read;
  read = map;

  try {
    return fn();
  } finally {
    read = oldRead;
  }
}

const watchList = new WeakMap();

function markChange(target, prop) {
  var _watchList$get, _watchList$get$get;

  if (!target) {
    return;
  }

  if (!encashable(target)) {
    return;
  }

  if (typeof prop === 'number') {
    prop = String(prop);
  } else if (typeof prop !== 'symbol' && typeof prop !== 'string' && typeof prop !== 'boolean') {
    return;
  }

  const watch = (_watchList$get = watchList.get(target)) === null || _watchList$get === void 0 ? void 0 : (_watchList$get$get = _watchList$get.get) === null || _watchList$get$get === void 0 ? void 0 : _watchList$get$get.call(_watchList$get, prop);

  if (!watch) {
    return;
  }

  for (const w of [...watch]) {
    w();
  }
}

function watchProp(target, prop, cb) {
  if (!target) {
    return () => {};
  }

  if (!(typeof target === 'object' || typeof target === 'function')) {
    return () => {};
  }

  if (typeof cb !== 'function') {
    return () => {};
  }

  if (typeof prop === 'number') {
    prop = String(prop);
  }

  if (typeof prop !== 'symbol' && typeof prop !== 'string' && typeof prop !== 'boolean') {
    return () => {};
  }

  const key = prop;
  let map = watchList.get(target);

  if (!map) {
    map = new Map();
    watchList.set(target, map);
  }

  const list = getMapValue(map, key, () => new Set());
  cb = safeify(cb);
  list.add(cb);
  let removed = false;
  return () => {
    if (removed) {
      return;
    }

    removed = true;
    list.delete(cb);

    if (list.size) {
      return;
    }

    if (!map) {
      return;
    }

    map.delete(key);

    if (map.size) {
      return;
    }

    watchList.delete(target);
  };
}

function encashable$1(v) {
  return Boolean(v && ['object', 'function'].includes(typeof v));
}

let getValue;

function encase$1(value, nest = 0) {
  if (!encashable$1(value)) {
    return value;
  }

  const original = recover$1(value);
  const nestLayer = nest === true ? Infinity : nest || 0;
  const proxy = new Proxy(original, {
    set(target, prop, value, receiver) {
      if (nest === false) {
        return Reflect.set(target, prop, value, receiver);
      }

      const has = Reflect.has(target, prop);
      const modified = Reflect.set(target, prop, value, encase$1(receiver));

      if (!modified) {
        return modified;
      }

      if (has !== Reflect.has(target, prop)) {
        markChange(target, true);
      }

      return modified;
    },

    get(target, prop, receiver) {
      if (getValue === proxy) {
        if (prop === '__monitorable__recover__') {
          getValue = original;
          return;
        }
      }

      if (nest === false) {
        return Reflect.get(target, prop, receiver);
      }

      markRead(target, prop);
      const value = Reflect.get(target, prop, encase$1(receiver));

      if (nestLayer > 0) {
        return encase$1(value, nestLayer - 1);
      }

      return value;
    },

    setPrototypeOf(target, proto) {
      if (nest === false) {
        return Reflect.setPrototypeOf(target, proto);
      }

      const oldProto = Reflect.getPrototypeOf(target);
      const modified = Reflect.setPrototypeOf(target, proto);

      if (modified && oldProto !== proto) {
        markChange(target, false);
      }

      return modified;
    },

    getPrototypeOf(target) {
      if (nest === false) {
        return Reflect.getPrototypeOf(target);
      }

      markRead(target, false);
      const value = Reflect.getPrototypeOf(target);

      if (nestLayer > 0) {
        return encase$1(value, nestLayer - 1);
      }

      return value;
    },

    defineProperty(target, prop, attr) {
      if (nest === false) {
        return Reflect.defineProperty(target, prop, attr);
      }

      let changed = true;

      if ('value' in attr) {
        const desc = Reflect.getOwnPropertyDescriptor(target, prop);

        if (desc && 'value' in desc && recover$1(attr.value) === recover$1(desc.value)) {
          changed = false;
        }
      }

      const modified = Reflect.defineProperty(target, prop, attr);

      if (changed && modified) {
        markChange(target, prop);
      }

      return modified;
    },

    getOwnPropertyDescriptor(target, prop) {
      if (nest === false) {
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }

      markRead(target, prop);
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },

    deleteProperty(target, prop) {
      if (nest === false) {
        return Reflect.deleteProperty(target, prop);
      }

      const has = Reflect.has(target, prop);
      const deleted = Reflect.deleteProperty(target, prop);

      if (has && !Reflect.has(target, prop)) {
        markChange(target, prop);
        markChange(target, true);
      }

      return deleted;
    },

    ownKeys(target) {
      if (nest === false) {
        return Reflect.ownKeys(target);
      }

      markRead(target, true);
      return Reflect.ownKeys(target);
    },

    has(target, prop) {
      if (nest === false) {
        return Reflect.has(target, prop);
      }

      markRead(target, true);
      return Reflect.has(target, prop);
    }

  });
  return proxy;
}

function recover$1(v) {
  if (!v) {
    return v;
  }

  if (!encashable$1(v)) {
    return v;
  }

  let value = v;

  try {
    getValue = v;
    value = v.__monitorable__recover__;
  } catch (_unused) {}

  value = getValue;
  getValue = false;

  if (!value) {
    return v;
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value === 'function') {
    return value;
  }

  return v;
}

function equal(a, b) {
  return recover$1(a) === recover$1(b);
}

function exec$1(fn, cb, resultOnly) {
  cb = safeify(cb);
  let cancelList;

  function cancel() {
    if (!cancelList) {
      return false;
    }

    const list = cancelList;
    cancelList = undefined;
    list.forEach(f => f());
    return true;
  }

  function trigger() {
    if (!cancel()) {
      return;
    }

    cb(true);
  }

  const thisRead = new Map();
  const result = observe(fn, thisRead);

  if (!thisRead.size) {
    cb(false);

    if (resultOnly) {
      return result;
    }

    return {
      result,

      stop() {}

    };
  }

  cancelList = [];

  for (let [obj, props] of thisRead) {
    for (const p of props) {
      cancelList.push(watchProp(recover$1(obj), p, trigger));
    }
  }

  if (resultOnly) {
    return result;
  }

  return {
    result,

    stop() {
      if (!cancel()) {
        return;
      }

      cb(false);
    }

  };
}

function createExecutable(fn, cb) {
  cb = safeify(cb);
  let cancelList;

  function cancel() {
    if (!cancelList) {
      return false;
    }

    const list = cancelList;
    cancelList = undefined;
    list.forEach(f => f());
    return true;
  }

  function trigger() {
    if (!cancel()) {
      return;
    }

    cb(true);
  }

  function exec() {
    cancel();
    const thisRead = new Map();

    try {
      return observe(fn, thisRead);
    } catch (e) {
      thisRead.clear();
      throw e;
    } finally {
      if (thisRead.size) {
        cancelList = [];

        for (let [obj, props] of thisRead) {
          for (const p of props) {
            cancelList.push(watchProp(recover$1(obj), p, trigger));
          }
        }
      } else {
        cb(false);
      }
    }
  }

  exec.stop = () => {
    if (!cancel()) {
      return;
    }

    cb(false);
  };

  return exec;
}

const values = new WeakSet();

function isValue$1(x) {
  return values.has(x);
}

function createValue$1(recover, setValue, stop = () => {}, change = () => {}) {
  function set(v, marked = false) {
    if (!setValue) {
      return;
    }

    try {
      setValue(v, () => {
        marked = true;
      });
    } finally {
      if (marked) {
        trigger();
      }
    }
  }

  function get() {
    markRead(value, 'value');
    return recover();
  }

  const value = (...v) => {
    if (v.length) {
      set(v[0], v[1]);
      return v[0];
    }

    return get();
  };

  Reflect.defineProperty(value, 'value', {
    get,
    set,
    enumerable: true,
    configurable: true
  });

  function watch(cb) {
    if (!callbacks) {
      return () => {};
    }

    cb = safeify(cb);
    callbacks.push(cb);
    change();
    let cancelled = false;
    return () => {
      if (cancelled) {
        return;
      }

      cancelled = true;

      if (!callbacks) {
        return;
      }

      const index = callbacks.findIndex(a => a === cb);

      if (index < 0) {
        return;
      }

      callbacks.splice(index, 1);
      change();
    };
  }

  let callbacks = [];
  Reflect.defineProperty(value, 'watch', {
    get() {
      return watch;
    },

    set() {},

    configurable: true
  });

  const trigger = () => {
    if (!callbacks) {
      return;
    }

    markChange(value, 'value');

    for (const cb of [...callbacks]) {
      cb(value, false);
    }
  };

  trigger.has = () => {
    var _callbacks;

    return Boolean((_callbacks = callbacks) === null || _callbacks === void 0 ? void 0 : _callbacks.length);
  };

  trigger.stop = () => {
    if (!callbacks) {
      return;
    }

    const list = callbacks;
    callbacks = undefined;

    for (const cb of [...list]) {
      cb(value, true);
    }
  };

  values.add(value);
  let stoped = false;

  value.stop = () => {
    if (stoped) {
      return;
    }

    stoped = true;
    stop();
    trigger.stop();
  };

  return {
    value,
    trigger
  };
}

function value$1(def, options) {
  const proxy = options === true || options && options.proxy;
  let source;
  let proxyed;
  const {
    value
  } = createValue$1(() => proxyed, (v, mark) => {
    if (proxy) {
      v = recover$1(v);
    }

    if (v === source) {
      return;
    }

    source = v;
    proxyed = proxy ? encase$1(source) : source;
    mark();
  });
  value(def);
  return value;
}

function computed$1(getter, setter, options) {
  if (typeof setter !== 'function') {
    options = setter;
    setter = undefined;
  }

  const setValue = setter;
  const proxy = options === true || options && options.proxy;
  let source;
  let proxyed;
  let stoped = false;
  let computed = false;
  let trigger;
  const executable = createExecutable(getter, changed => {
    computed = !changed;

    if (changed && trigger) {
      trigger();
    }
  });

  function run() {
    computed = true;

    try {
      source = executable();

      if (proxy) {
        source = recover$1(source);
      }

      proxyed = proxy ? encase$1(source) : source;
      return proxyed;
    } catch (e) {
      if (!stoped) {
        computed = false;
      }

      throw e;
    }
  }

  let value;
  ({
    value,
    trigger
  } = createValue$1(() => computed || stoped ? proxyed : run(), setValue && (v => setValue(proxy ? recover$1(v) : v)), () => {
    if (stoped) {
      return;
    }

    stoped = true;

    if (computed) {
      return;
    }

    run();
  }));
  return value;
}

function merge(cb) {
  let oldValue;
  let runed = false;
  return (v, stoped) => {
    if (stoped) {
      return cb(v, stoped);
    }

    const newValue = recover$1(v());

    if (newValue === oldValue && runed) {
      return;
    }

    runed = true;
    oldValue = newValue;
    cb(v, stoped);
  };
}

function mix(source) {
  for (const k of Reflect.ownKeys(source)) {
    const descriptor = Reflect.getOwnPropertyDescriptor(source, k);

    if (!descriptor) {
      continue;
    }

    if (!('value' in descriptor) || 'get' in descriptor || 'set' in descriptor) {
      continue;
    }

    const value = descriptor.value;

    if (!isValue$1(value)) {
      continue;
    }

    descriptor.get = () => value.value;

    if (descriptor.writable) {
      descriptor.set = v => value.value = v;
    }

    delete descriptor.value;
    delete descriptor.writable;
    Reflect.defineProperty(source, k, descriptor);
  }

  return source;
}

var monitorable$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	computed: computed$1,
	createExecutable: createExecutable,
	encase: encase$1,
	encashable: encashable,
	equal: equal,
	exec: exec$1,
	getMapValue: getMapValue,
	isValue: isValue$1,
	markChange: markChange,
	markRead: markRead,
	merge: merge,
	mix: mix,
	observe: observe,
	printError: printError,
	recover: recover$1,
	safeify: safeify,
	value: value$1,
	watchProp: watchProp
});

install({
  render: render$1,
  monitorable: monitorable$1
});

export { Container, Deliver, NeepError as Error, Fragment, ScopeSlot, Slot, SlotRender, Tags, Template, Value, addContextConstructor, callHook, checkCurrent, computed, create, createElement, current, defineAuxiliary, deliver, elements, encase, expose, hook, install, isElement, isElementSymbol, isProduction, isValue, label$1 as label, mName, mNative, mRender, mSimple, mType, mark, mode, nameSymbol, recover, render, renderSymbol, setAuxiliary, setHook, setValue, typeSymbol, value, version, watch };
//# sourceMappingURL=neep.web.full.esm.js.map
