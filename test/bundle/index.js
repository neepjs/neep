(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	const xmlnsMap = {
	  svg: 'http://www.w3.org/2000/svg',
	  html: 'http://www.w3.org/1999/xhtml',
	  mathml: 'http://www.w3.org/1998/Math/MathML'
	};
	const SVGTags = new Set(['altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor', 'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile', 'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line', 'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'script', 'set', 'stop', 'style', 'svg', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref', 'tspan', 'use', 'view', 'vkern']);
	const MathMLTags = new Set(['maction', 'math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msubsup', 'msup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'semantics']);
	function createElement(tagname, namespace) {
	  const res = /^([a-z][a-z0-9-]*):([a-z0-9-]+)$/i.exec(tagname);
	  const tag = res ? res[2] : tagname;
	  const ns = (namespace || (res === null || res === void 0 ? void 0 : res[1]) || SVGTags.has(tag.toLowerCase()) && 'svg' || MathMLTags.has(tag.toLowerCase()) && 'mathml' || '').toLowerCase();

	  if (!ns) {
	    return document.createElement(tag);
	  }

	  return document.createElementNS(ns in xmlnsMap && xmlnsMap[ns] || ns, tag);
	}

	function createComponent(renderer) {
	  const node = createElement('neep-component');
	  return [node, node.attachShadow({
	    mode: 'open'
	  })];
	}

	function createPlaceholder() {
	  return document.createComment('');
	}

	function createText(text) {
	  return document.createTextNode(text);
	}

	function getParent(node) {
	  return node.parentNode;
	}

	function insertNode(parent, node, next = null) {
	  parent.insertBefore(node, next);
	}

	const version = '0.1.0-alpha.16';
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

	function _extends() {
	  _extends = Object.assign || function (target) {
	    for (var i = 1; i < arguments.length; i++) {
	      var source = arguments[i];

	      for (var key in source) {
	        if (Object.prototype.hasOwnProperty.call(source, key)) {
	          target[key] = source[key];
	        }
	      }
	    }

	    return target;
	  };

	  return _extends.apply(this, arguments);
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

	  if (typeof message === 'function') {
	    message = message();
	  }

	  throw new NeepError(message, tag);
	}

	let nextFrameApi;
	function nextFrame(fn) {
	  assert(nextFrameApi, 'The basic renderer is not installed', 'install');
	  nextFrameApi(fn);
	}
	const renderers = Object.create(null);
	function getRender(type = '', def = renderers.default) {
	  if (typeof type === 'object') {
	    return type;
	  }

	  return renderers[type] || def;
	}
	function installRender(renderer) {
	  if (!renderer) {
	    return;
	  }

	  renderers[renderer.type] = renderer;

	  if (nextFrameApi) {
	    return;
	  }

	  if (!renderers.default) {
	    renderers.default = renderer;
	  }

	  if (!nextFrameApi && renderer.nextFrame) {
	    renderers.default = renderer;
	    nextFrameApi = renderer.nextFrame.bind(renderer);
	  }
	}

	/*!
	 * monitorable v0.1.0-beta.2
	 * (c) 2020-2021 Fierflame
	 * @license MIT
	 */
	let printErrorLog;

	function printError(info) {
	  if (typeof printErrorLog === 'function') {
	    printErrorLog(info);
	    return;
	  }

	  console.error(info);
	}

	function setPrintError(p) {
	  printErrorLog = typeof p === 'function' ? p : undefined;
	}

	function encashable(v) {
	  return Boolean(v && ['object', 'function'].includes(typeof v));
	}

	function safeify(fn) {
	  return (...p) => {
	    try {
	      fn(...p);
	    } catch (e) {
	      printError(e);
	    }
	  };
	}

	function safeCall(fn) {
	  try {
	    fn();
	  } catch (e) {
	    printError(e);
	  }
	}

	function getIndexes(target, prop) {
	  if (!target) {
	    return undefined;
	  }

	  if (typeof target !== 'function' && typeof target !== 'object') {
	    return undefined;
	  }

	  if (typeof prop === 'number') {
	    return [target, String(prop)];
	  }

	  if (typeof prop === 'symbol') {
	    return [target, prop];
	  }

	  if (typeof prop === 'string') {
	    return [target, prop];
	  }

	  if (typeof prop === 'boolean') {
	    return [target, prop];
	  }

	  return undefined;
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

	function markRead(target, prop) {
	  if (!read) {
	    return;
	  }

	  const indexes = getIndexes(target, prop);

	  if (!indexes) {
	    return;
	  }

	  [target, prop] = indexes;
	  const propMap = getMapValue(read, target, () => new Map());

	  if (propMap.has(prop)) {
	    return;
	  }

	  propMap.set(prop, false);
	}

	function observeRun(map, fn, options) {
	  const oldRead = read;
	  read = map;

	  try {
	    if (!(options === null || options === void 0 ? void 0 : options.postpone)) {
	      return fn();
	    }

	    return postpone(fn, options.postpone === 'priority');
	  } finally {
	    read = oldRead;
	  }
	}

	function observe(map, fn, options) {
	  if (typeof fn === 'function') {
	    return observeRun(map, fn, options);
	  }

	  if (typeof options !== 'function') {
	    throw new Error('fn needs to be a function');
	  }

	  return observeRun(map, options, fn);
	}

	const watchList = new WeakMap();

	function execWatch(target, prop, filter) {
	  var _watchList$get;

	  const watch = (_watchList$get = watchList.get(target)) === null || _watchList$get === void 0 ? void 0 : _watchList$get.get(prop);

	  if (!watch) {
	    return;
	  }

	  let list = [...watch];

	  if (filter) {
	    list = list.filter(([, t]) => filter(t));
	  }

	  list.forEach(([w]) => w());
	}

	let waitList;

	function runDeferred(list) {
	  for (const [target, set] of list.entries()) {
	    var _read;

	    const propMap = (_read = read) === null || _read === void 0 ? void 0 : _read.get(target);

	    for (const prop of set) {
	      execWatch(target, prop, t => !t);

	      if (propMap === null || propMap === void 0 ? void 0 : propMap.has(prop)) {
	        propMap.set(prop, true);
	      }
	    }
	  }
	}

	function postponeRun(f, priority) {
	  const list = !priority && waitList || new Map();
	  const old = waitList;
	  waitList = list;

	  try {
	    return f();
	  } finally {
	    waitList = old;

	    if (list !== waitList) {
	      runDeferred(list);
	    }
	  }
	}

	function postpone(fn, priority) {
	  if (typeof fn === 'function') {
	    return postponeRun(fn, priority);
	  }

	  if (typeof priority !== 'function') {
	    throw new Error('fn needs to be a function');
	  }

	  return postponeRun(priority, fn);
	}

	function wait(target, prop) {
	  if (!waitList) {
	    return false;
	  }

	  getMapValue(waitList, target, () => new Set()).add(prop);
	  return true;
	}

	function markChange(target, prop) {
	  const indexes = getIndexes(target, prop);

	  if (!indexes) {
	    return;
	  }

	  [target, prop] = indexes;

	  if (wait(target, prop)) {
	    execWatch(target, prop, Boolean);
	    return;
	  }

	  execWatch(target, prop);
	}

	function watchProp(target, prop, cb, disdeferable = false) {
	  if (typeof cb !== 'function') {
	    return () => {};
	  }

	  const indexes = getIndexes(target, prop);

	  if (!indexes) {
	    return () => {};
	  }

	  [target, prop] = indexes;
	  const key = prop;
	  let map = watchList.get(target);

	  if (!map) {
	    map = new Map();
	    watchList.set(target, map);
	  }

	  const list = getMapValue(map, key, () => new Set());
	  const item = [safeify(cb), disdeferable];
	  list.add(item);
	  let removed = false;
	  return () => {
	    if (removed) {
	      return;
	    }

	    removed = true;
	    list.delete(item);

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

	function run(cb, fn, options) {
	  cb = safeify(cb);
	  let cancelList;
	  const postpone = options === null || options === void 0 ? void 0 : options.postpone;
	  let end = false;

	  function cancel() {
	    if (end) {
	      return false;
	    }

	    end = true;

	    if (!cancelList) {
	      return true;
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

	  function run(thisRead) {
	    if (end) {
	      return false;
	    }

	    if (!thisRead.size) {
	      end = true;
	      return cb(false);
	    }

	    const list = [];

	    for (let [obj, props] of thisRead) {
	      for (const [p, m] of props) {
	        if (m) {
	          return cb(true);
	        }

	        list.push([obj, p]);
	      }
	    }

	    cancelList = list.map(([obj, p]) => watchProp(obj, p, trigger, options === null || options === void 0 ? void 0 : options.disdeferable));
	  }

	  function stop() {
	    if (!cancel()) {
	      return;
	    }

	    cb(false);
	  }

	  const thisRead = new Map();
	  const result = observe(thisRead, () => fn(stop), {
	    postpone
	  });
	  run(thisRead);

	  if (options === null || options === void 0 ? void 0 : options.resultOnly) {
	    return result;
	  }

	  return {
	    result,
	    stop
	  };
	}

	function exec(cb, fn, options) {
	  if (typeof cb !== 'function') {
	    throw new Error('cb needs to be a function');
	  }

	  if (typeof fn === 'function') {
	    return run(cb, fn, options);
	  }

	  if (typeof options !== 'function') {
	    throw new Error('fn needs to be a function');
	  }

	  return run(cb, options, fn);
	}

	function create(cb, fn, options) {
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

	  function run(thisRead) {
	    if (!thisRead.size) {
	      return cb(false);
	    }

	    const list = [];

	    for (let [obj, props] of thisRead) {
	      for (const [p, m] of props) {
	        if (m) {
	          return cb(true);
	        }

	        list.push([obj, p]);
	      }
	    }

	    cancelList = list.map(([obj, p]) => watchProp(obj, p, trigger, options === null || options === void 0 ? void 0 : options.disdeferable));
	  }

	  function exec(...p) {
	    cancel();
	    const thisRead = new Map();
	    const result = observe(thisRead, () => fn(...p), options);
	    run(thisRead);
	    return result;
	  }

	  exec.stop = () => {
	    if (!cancel()) {
	      return;
	    }

	    cb(false);
	  };

	  return exec;
	}

	function monitor(cb, fn, options) {
	  if (typeof fn === 'function') {
	    return create(cb, fn, options);
	  }

	  if (typeof options !== 'function') {
	    throw new Error('fn needs to be a function');
	  }

	  return create(cb, options, fn);
	}

	const valueSignKey = '__$$__monitorable_value__$$__';

	function isValue(x) {
	  return Boolean(typeof x === 'function' && x[valueSignKey]);
	}

	function valueOf() {
	  const value = this();

	  if (value === undefined) {
	    return value;
	  }

	  if (value === null) {
	    return value;
	  }

	  return value.valueOf();
	}

	function toString(...p) {
	  const value = this();

	  if (value === undefined) {
	    return String(value);
	  }

	  if (value === null) {
	    return String(value);
	  }

	  if (typeof value.toString === 'function') {
	    return value.toString(...p);
	  }

	  return String(value);
	}

	function toPrimitive(hint) {
	  const value = this();

	  if (value === undefined) {
	    return String(value);
	  }

	  if (value === null) {
	    return String(value);
	  }

	  if (typeof value[Symbol.toPrimitive] === 'function') {
	    return value[Symbol.toPrimitive](hint);
	  }

	  if (hint === 'string') {
	    return String(value);
	  }

	  if (hint === 'number') {
	    return Number(value);
	  }

	  return value;
	}

	function createValue(recover, setValue, stop = () => {}, change = () => {}) {
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
	  Reflect.defineProperty(value, 'valueOf', {
	    value: valueOf,
	    enumerable: true,
	    configurable: true
	  });
	  Reflect.defineProperty(value, 'toString', {
	    value: toString,
	    enumerable: true,
	    configurable: true
	  });
	  Reflect.defineProperty(value, Symbol.toPrimitive, {
	    value: toPrimitive,
	    enumerable: true,
	    configurable: true
	  });
	  let stopList = new Set();

	  function watch(cb, disdeferable) {
	    if (!stopList) {
	      return () => {};
	    }

	    const cancel = watchProp(value, 'value', () => cb(value, false), disdeferable);
	    let cancelled = false;

	    const stop = () => {
	      if (cancelled) {
	        return;
	      }

	      cancelled = true;

	      if (stopList) {
	        stopList.delete(stop);
	      }

	      cancel();
	      safeCall(() => cb(value, true));
	    };

	    stopList.add(stop);
	    change();
	    return () => {
	      if (cancelled) {
	        return;
	      }

	      cancelled = true;

	      if (stopList) {
	        stopList.delete(stop);
	      }

	      cancel();
	      change();
	    };
	  }

	  Reflect.defineProperty(value, 'watch', {
	    get() {
	      return watch;
	    },

	    set() {},

	    configurable: true
	  });

	  const trigger = () => markChange(value, 'value');

	  trigger.has = () => {
	    var _stopList;

	    return Boolean((_stopList = stopList) === null || _stopList === void 0 ? void 0 : _stopList.size);
	  };

	  trigger.stop = () => {
	    if (!stopList) {
	      return;
	    }

	    const list = stopList;
	    stopList = undefined;

	    for (const stop of [...list]) {
	      stop();
	    }
	  };

	  Reflect.defineProperty(value, valueSignKey, {
	    value: true,
	    configurable: true
	  });
	  let stopped = false;

	  value.stop = () => {
	    if (stopped) {
	      return;
	    }

	    stopped = true;
	    stop();
	    trigger.stop();
	  };

	  return {
	    value,
	    trigger
	  };
	}

	function value(def) {
	  let source;
	  let proxyValue;
	  const {
	    value
	  } = createValue(() => proxyValue, (v, mark) => {
	    if (v === source) {
	      return;
	    }

	    source = v;
	    proxyValue = source;
	    mark();
	  });
	  value(def);
	  return value;
	}

	function computed(getter, setter, options) {
	  var _options, _options2;

	  if (typeof setter !== 'function') {
	    options = setter;
	    setter = undefined;
	  }

	  const setValue = setter;
	  const postpone = (_options = options) === null || _options === void 0 ? void 0 : _options.postpone;
	  const deferable = (_options2 = options) === null || _options2 === void 0 ? void 0 : _options2.deferable;
	  let source;
	  let proxyValue;
	  let stopped = false;
	  let computed = false;
	  let trigger;
	  const executable = monitor(changed => {
	    computed = !changed;

	    if (changed && trigger) {
	      trigger();
	    }
	  }, getter, {
	    postpone,
	    disdeferable: !deferable
	  });

	  function run() {
	    computed = true;

	    try {
	      source = executable();
	      proxyValue = source;
	      return proxyValue;
	    } catch (e) {
	      if (!stopped) {
	        computed = false;
	      }

	      throw e;
	    }
	  }

	  let value;
	  ({
	    value,
	    trigger
	  } = createValue(() => computed || stopped ? proxyValue : run(), setValue && (v => setValue(v)), () => {
	    if (stopped) {
	      return;
	    }

	    stopped = true;

	    if (computed) {
	      return;
	    }

	    run();
	  }));
	  return value;
	}

	function createValue$1(props, key, def, set) {
	  function setValue(value, setted) {
	    if (!set) {
	      return;
	    }

	    set(value, setted);
	  }

	  return computed(() => {
	    const p = props[key];

	    if (p === undefined && def) {
	      return def();
	    }

	    return isValue(p) ? p() : p;
	  }, v => {
	    const p = props[key];

	    if (isValue(p)) {
	      p(v);
	      setValue(v, true);
	      return;
	    }

	    if (p === undefined && def) {
	      def(v);
	    }

	    setValue(v, false);
	  });
	}

	function valueify(props, key, def, set) {
	  if (!key) {
	    return (k, d, s) => createValue$1(props, k, d, s);
	  }

	  if (!Array.isArray(key)) {
	    return createValue$1(props, key, def, set);
	  }

	  const r = Object.create(null);

	  for (const k of key) {
	    const value = createValue$1(props, k, def && def(k), set && ((v, s) => set(v, s, k)));
	    Reflect.defineProperty(props, k, {
	      get() {
	        return value();
	      },

	      set(v) {
	        value.value = v;
	      },

	      configurable: true,
	      enumerable: true
	    });
	  }

	  return r;
	}

	function mixValue(source, props = Reflect.ownKeys(source), set) {
	  const p = Object.create(source);

	  function setValue(value, key) {
	    if (!set) {
	      return;
	    }

	    set(value, key);
	  }

	  const keys = Array.isArray(props) ? props : Reflect.ownKeys(props);
	  const values = Array.isArray(props) ? source : props;

	  for (const key of keys) {
	    const value = values[key];

	    if (!isValue(value)) {
	      continue;
	    }

	    Reflect.defineProperty(p, key, {
	      get() {
	        return value();
	      },

	      set(v) {
	        value.value = v;
	        setValue(v, key);
	      },

	      configurable: true,
	      enumerable: true
	    });
	  }

	  return p;
	}

	function createAsValue(props, key) {
	  return computed(() => {
	    const p = props[key];
	    return isValue(p) ? p() : p;
	  }, v => {
	    const p = props[key];

	    if (isValue(p)) {
	      p(v);
	    } else {
	      props[key] = v;
	    }
	  });
	}

	function asValue(props, key) {
	  if (arguments.length >= 2) {
	    return createAsValue(props, key);
	  }

	  return k => createAsValue(props, k);
	}

	function merge(cb) {
	  let oldValue;
	  let ran = false;
	  return (v, stopped) => {
	    if (stopped) {
	      return cb(v, stopped);
	    }

	    const newValue = v();

	    if (newValue === oldValue && ran) {
	      return;
	    }

	    ran = true;
	    oldValue = newValue;
	    cb(v, stopped);
	  };
	}

	function defineProperty(obj, key, val) {
	  return Reflect.defineProperty(obj, key, {
	    get() {
	      markRead(obj, key);
	      return val;
	    },

	    set(v) {
	      if (v === val) {
	        return;
	      }

	      val = v;
	      markChange(obj, key);
	    },

	    configurable: true,
	    enumerable: true
	  });
	}

	function createObject(keys, base = {}, create) {
	  const obj = create || base === null ? Object.create(base) : base;

	  for (const key of keys) {
	    let val = obj[key];
	    Reflect.defineProperty(obj, key, {
	      get() {
	        markRead(obj, key);
	        return val;
	      },

	      set(v) {
	        if (v === val) {
	          return;
	        }

	        val = v;
	        markChange(obj, key);
	      },

	      configurable: true,
	      enumerable: true
	    });
	  }

	  return obj;
	}

	function get(obj, key) {
	  markRead(obj, key);
	  return obj[key];
	}

	function set(obj, key, v) {
	  if (v === obj[key]) {
	    return v;
	  }

	  obj[key] = v;
	  markChange(obj, key);
	  return v;
	}

	function encashable$1(v) {
	  return Boolean(v && ['object', 'function'].includes(typeof v));
	}

	let getValue;

	function encase(value, nest = 0) {
	  if (!encashable$1(value)) {
	    return value;
	  }

	  const original = recover(value);
	  const nestLayer = nest === true ? Infinity : nest || 0;
	  const proxy = new Proxy(original, {
	    set(target, prop, value, receiver) {
	      if (nest === false) {
	        return Reflect.set(target, prop, value, receiver);
	      }

	      const has = Reflect.has(target, prop);
	      const old = Reflect.get(target, prop, receiver);
	      const modified = Reflect.set(target, prop, value, encase(receiver));

	      if (!modified) {
	        return modified;
	      }

	      if (has !== Reflect.has(target, prop)) {
	        markChange(receiver, true);
	      }

	      if (old !== Reflect.get(target, prop, receiver)) {
	        markChange(receiver, prop);
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

	      markRead(receiver, prop);
	      const value = Reflect.get(target, prop, encase(receiver));

	      if (nestLayer > 0) {
	        return encase(value, nestLayer - 1);
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
	        markChange(proxy, false);
	      }

	      return modified;
	    },

	    getPrototypeOf(target) {
	      if (nest === false) {
	        return Reflect.getPrototypeOf(target);
	      }

	      markRead(target, false);
	      markRead(proxy, false);
	      const value = Reflect.getPrototypeOf(target);

	      if (nestLayer > 0) {
	        return encase(value, nestLayer - 1);
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

	        if (desc && 'value' in desc && recover(attr.value) === recover(desc.value)) {
	          changed = false;
	        }
	      }

	      const modified = Reflect.defineProperty(target, prop, attr);

	      if (changed && modified) {
	        markChange(target, prop);
	        markChange(proxy, prop);
	      }

	      return modified;
	    },

	    getOwnPropertyDescriptor(target, prop) {
	      if (nest === false) {
	        return Reflect.getOwnPropertyDescriptor(target, prop);
	      }

	      markRead(target, prop);
	      markRead(proxy, prop);
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
	        markChange(proxy, prop);
	        markChange(proxy, true);
	      }

	      return deleted;
	    },

	    ownKeys(target) {
	      if (nest === false) {
	        return Reflect.ownKeys(target);
	      }

	      markRead(target, true);
	      markRead(proxy, true);
	      return Reflect.ownKeys(target);
	    },

	    has(target, prop) {
	      if (nest === false) {
	        return Reflect.has(target, prop);
	      }

	      markRead(target, true);
	      markRead(proxy, true);
	      return Reflect.has(target, prop);
	    }

	  });
	  return proxy;
	}

	function recover(v) {
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
	  return recover(a) === recover(b);
	}

	var Monitorable = Object.freeze({
	  __proto__: null,
	  printError: printError,
	  setPrintError: setPrintError,
	  encashable: encashable,
	  safeify: safeify,
	  safeCall: safeCall,
	  getIndexes: getIndexes,
	  getMapValue: getMapValue,
	  markRead: markRead,
	  observe: observe,
	  postpone: postpone,
	  markChange: markChange,
	  watchProp: watchProp,
	  exec: exec,
	  monitor: monitor,
	  isValue: isValue,
	  value: value,
	  computed: computed,
	  valueify: valueify,
	  mixValue: mixValue,
	  asValue: asValue,
	  merge: merge,
	  defineProperty: defineProperty,
	  createObject: createObject,
	  get: get,
	  set: set,
	  encase: encase,
	  recover: recover,
	  equal: equal
	});

	function installMonitorable(api) {}

	function install(apis) {
	  installMonitorable(apis.monitorable);
	  installRender(apis.renderer);

	  {
	    installDevtools(apis.devtools);
	  }
	}

	const destroyFns = Object.create(null);
	let nextId = 1;
	let isInit = false;
	let hookList;
	let root;
	let runs;
	function hookSafe() {
	  assert(isInit || !hookList || !hookList.length, 'Inconsistent number of useService executions', 'life');
	}
	function initHook(init, useData) {
	  const state =  {
	    list: hookList,
	    isInit,
	    root,
	    runs
	  };

	  if (!useData) {
	    isInit = false;
	    hookList = undefined;

	    {
	      root = [];
	      runs = [];
	    }

	    return state;
	  }

	  isInit = init;
	  hookList = init ? useData : [...useData];

	  {
	    root = useData;
	    runs = [];
	  }

	  return state;
	}
	function restoreHookState(state) {
	  {
	    ({
	      list: hookList,
	      isInit,
	      root,
	      runs
	    } = state);
	  }
	}

	function printError$1(item, isEnd) {

	  return '';
	}

	function createUse({
	  name,
	  create = () => ({}),
	  destroy,
	  exec = v => v
	}) {
	  const id = nextId++;

	  if (typeof destroy === 'function') {
	    destroyFns[id] = destroy;
	  }

	  return (...p) => {
	    assert(hookList, `Function \`${name}\` can only be called within a cycle.`, 'life');

	    if (isInit) {
	      const list = [];
	      const item = {
	        id,
	        value: create(...p)
	      };
	      const parent = hookList;
	      hookList = list;

	      try {
	        return exec(item.value, ...p);
	      } finally {
	        if (list.length) {
	          item.list = list;
	        }

	        hookList = parent;
	      }
	    }

	    const item = hookList.shift();
	    assert(item && item.id === id && item.list, () => printError$1(), 'life');
	    const {
	      value
	    } = item;
	    const list = [...item.list];
	    const parent = hookList;
	    hookList = list;

	    {
	      const runList = [];

	      if (runs) {
	        runs.push({
	          id,
	          list: runList,
	          value
	        });
	      }

	      const runParent = runs;
	      runs = runList;

	      try {
	        const ret = exec(value, ...p);
	        assert(!list.length, () => printError$1(item, true), 'life');
	        return ret;
	      } finally {
	        hookList = parent;
	        runs = runParent;
	      }
	    }
	  };
	}
	function destroyUseData(data) {
	  if (!data) {
	    return;
	  }

	  for (const {
	    id,
	    value,
	    list
	  } of data) {
	    destroyUseData(list);

	    if (!(id in destroyFns)) {
	      continue;
	    }

	    const destroy = destroyFns[id];
	    destroy(value);
	  }
	}

	let setLabels;
	let current;
	function runCurrent(newContextData, entity, fn, ...p) {
	  const oldCurrent = current;
	  current = newContextData;
	  const hookState = entity ? initHook(!newContextData.created, newContextData.useData) : initHook(false);

	  try {
	    const ret = fn(...p);

	    if (entity) {
	      hookSafe();
	    }

	    return ret;
	  } finally {
	    current = oldCurrent;
	    restoreHookState(hookState);
	  }
	}
	function runCurrentWithLabel(newContextData, entity, setLabel, fn, ...p) {
	  const oldCurrent = current;
	  current = newContextData;
	  const hookState = entity ? initHook(!newContextData.created, newContextData.useData) : initHook(false);
	  const oldSetLabel = setLabels;
	  setLabels = setLabel;

	  try {
	    const ret = fn(...p);

	    if (entity) {
	      hookSafe();
	    }

	    return ret;
	  } finally {
	    current = oldCurrent;
	    restoreHookState(hookState);
	    setLabels = oldSetLabel;
	  }
	}
	function checkCurrent(name) {
	  assert(current, `Function \`${name}\` can only be called within a cycle.`, 'life');
	  return current;
	}

	function setHook(id, hook, contextData) {
	  let {
	    hooks
	  } = contextData;

	  if (!hooks) {
	    return () => {};
	  }

	  hook = safeify(hook);
	  let set = hooks[id];

	  if (!set) {
	    set = new Set();
	    hooks[id] = set;
	  }

	  set.add(hook);
	  return () => set.delete(hook);
	}
	function callHook(id, {
	  hooks
	}) {
	  if (!hooks) {
	    return;
	  }

	  for (const hook of hooks[id] || []) {
	    hook();
	  }
	}

	function withWatch(value, cb, run) {
	  const contextData = checkCurrent('withWatch');

	  if (typeof value !== 'function') {
	    return () => {};
	  }

	  let stop;

	  if (isValue(value)) {
	    stop = value.watch(cb);

	    if (run) {
	      cb(value, false);
	    }
	  } else {
	    const v = computed(value);
	    stop = v.watch((v, s) => cb(v(), s));

	    if (run) {
	      cb(v(), false);
	    }
	  }

	  setHook('beforeDestroy', () => stop(), contextData);
	  return stop;
	}

	function withHook(name, hook, initOnly) {
	  const contextData = checkCurrent('withHook');

	  if (initOnly && contextData.created) {
	    return undefined;
	  }

	  return setHook(name, () => hook(), contextData);
	}

	const rendererSymbol = Symbol.for('renderer');
	const nameSymbol = Symbol.for('name');
	const componentsSymbol = Symbol.for('components');
	const propsSymbol = Symbol.for('props');
	const componentValueSymbol = Symbol.for('$$$componentValue$$$');
	const objectTypeSymbol = Symbol.for('$$$objectType$$$');
	const objectTypeSymbolElement = '$$$objectType$$$Element';
	const objectTypeSymbolDeliverComponent = '$$$objectType$$$DeliverComponent';
	const objectTypeSymbolNativeComponent = '$$$objectType$$$NativeComponentNode';
	const objectTypeSymbolSimpleComponent = '$$$objectType$$$SimpleComponent';
	const objectTypeSymbolShellComponent = '$$$objectType$$$ShellComponent';
	const objectTypeSymbolRenderComponent = '$$$objectType$$$RenderComponent';
	const objectTypeSymbolContainerComponent = '$$$objectType$$$ContainerComponent';
	const objectTypeSymbolElementComponent = '$$$objectType$$$ElementComponent';
	const objectTypeSymbolRootEntity = '$$$objectType$$$RootEntity';
	const deliverKeySymbol = Symbol.for('$$$deliverKey$$$');
	const deliverDefaultSymbol = Symbol.for('$$$deliverDefault$$$');

	function isSimpleComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolSimpleComponent;
	}
	function isShellComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolShellComponent;
	}
	function isNativeComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolNativeComponent;
	}
	function isRenderComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolRenderComponent;
	}
	function isContainerComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolContainerComponent;
	}
	function isElementComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolElementComponent;
	}
	function isDeliverComponent(v) {
	  if (typeof v !== 'function') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolDeliverComponent;
	}

	function withDelivered(deliver) {
	  assert(isDeliverComponent(deliver), 'The `deliver` is not a DeliverComponent.', 'deliver');
	  const {
	    delivered
	  } = checkCurrent('withDelivered');
	  const value = delivered[deliver[deliverKeySymbol]];
	  return value === undefined ? deliver[deliverDefaultSymbol] : value;
	}

	function withRefresh(f) {
	  return checkCurrent('withRefresh').refresh(f);
	}

	function withParent() {
	  return checkCurrent('withParent').parent;
	}

	function withChildren() {
	  return checkCurrent('withChildren').getChildren();
	}

	function withCallback(fn) {
	  const current = checkCurrent('withCallback');
	  return (...p) => runCurrent(current, undefined, fn, ...p);
	}

	function createElementBase(tag, attrs, ...children) {
	  const props = typeof attrs === 'object' && attrs || {};
	  const node = {
	    [objectTypeSymbol]: objectTypeSymbolElement,
	    tag,
	    props,
	    children,
	    key: undefined
	  };

	  if ('n:key' in props) {
	    node.key = props['n:key'];
	  }

	  if ('n:slot' in props) {
	    node.slot = props['n:slot'];
	  }

	  return node;
	}

	const ScopeSlot = 'core:scopeslot';
	const Render = 'core:render';
	const Slot = 'core:slot';
	const Container = 'core:container';
	const Template = 'template';
	const Fragment = Template;

	function createTemplateElement(...children) {
	  return {
	    [objectTypeSymbol]: objectTypeSymbolElement,
	    tag: Template,
	    children
	  };
	}

	function isElement(v) {
	  if (!v) {
	    return false;
	  }

	  if (typeof v !== 'object') {
	    return false;
	  }

	  return v[objectTypeSymbol] === objectTypeSymbolElement;
	}

	function equal$1(a, b) {
	  if (Object.is(a, b)) {
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

	  if (Array.isArray(a)) {
	    if (!Array.isArray(b)) {
	      return false;
	    }

	    if (a.length !== b.length) {
	      return false;
	    }

	    for (let i = a.length - 1; i >= 0; i--) {
	      if (!equal$1(a[i], b[i])) {
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

	  if (a.isDefault !== b.isDefault) {
	    return false;
	  }

	  if (a.key !== b.key) {
	    return false;
	  }

	  if (a.slot !== b.slot) {
	    return false;
	  }

	  const aprops = a.props;
	  const bprops = b.props;

	  if (Object.is(aprops, bprops)) {
	    return equal$1(a.children, b.children);
	  }

	  if (!aprops) {
	    return false;
	  }

	  if (!bprops) {
	    return false;
	  }

	  if (typeof aprops !== 'object') {
	    return false;
	  }

	  if (typeof bprops !== 'object') {
	    return false;
	  }

	  const aKeys = new Set(Object.keys(aprops));
	  const bKeys = Object.keys(bprops);

	  if (aKeys.size !== bKeys.length) {
	    return false;
	  }

	  for (const k of bKeys) {
	    if (!aKeys.has(k)) {
	      return false;
	    }

	    if (aprops[k] !== bprops[k]) {
	      return false;
	    }
	  }

	  return equal$1(a.children, b.children);
	}

	function isRenderElement(v) {
	  if (!isElement(v)) {
	    return false;
	  }

	  const {
	    tag
	  } = v;

	  if (typeof tag !== 'string') {
	    return false;
	  }

	  return tag.toLowerCase() === Render;
	}

	function withLabel(...label) {
	  {
	    const labels = label.filter(Boolean).map(t => typeof t === 'string' ? {
	      text: t
	    } : t);

	    if (!setLabels) {
	      return;
	    }

	    setLabels(labels);
	  }
	}

	let ids = 0;
	const Nodes = {};
	const IdMap =  new WeakMap();
	function createMountedNode(n, id) {
	  {
	    id = id || ++ids;
	    const {
	      node
	    } = n;

	    if (node && IdMap) {
	      IdMap.set(node, id);
	    }

	    const newNode = { ...n,
	      id
	    };
	    Nodes[id] = newNode;
	    markChange(Nodes, id);
	    return newNode;
	  }
	}
	function recoveryMountedNode(node) {
	  {
	    delete Nodes[node.id];
	  }
	}
	function getNode(id) {
	  {
	    if (typeof id !== 'number') {
	      id = (IdMap === null || IdMap === void 0 ? void 0 : IdMap.get(id)) || -1;
	    }

	    markRead(Nodes, id);
	    return Nodes[id];
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
	    key: t,
	    props: {
	      value: t
	    },
	    children: []
	  };
	}

	function drawPlaceholder(renderer) {
	  const node = renderer.createPlaceholder();
	  return createMountedNode({
	    tag: null,
	    node
	  });
	}

	function createItem(renderer, mountOptions, source) {
	  if (!source) {
	    return drawPlaceholder(renderer);
	  }

	  const {
	    proxy
	  } = source;
	  proxy.mount(mountOptions);
	  return createMountedNode({ ...source,
	    node: undefined,
	    proxy
	  });
	}

	function createList(renderer, mountOptions, source) {
	  if (source.length) {
	    return source.map(it => createItem(renderer, mountOptions, it));
	  }

	  return [drawPlaceholder(renderer)];
	}

	function createAll(renderer, mountOptions, source) {
	  if (!source.length) {
	    return [drawPlaceholder(renderer)];
	  }

	  return source.map(item => Array.isArray(item) ? createList(renderer, mountOptions, item) : createItem(renderer, mountOptions, item));
	}

	function unmount(renderer, tree) {
	  if (!tree) {
	    return;
	  }

	  if (Array.isArray(tree)) {
	    tree.forEach(e => unmount(renderer, e));
	    return;
	  }

	  recoveryMountedNode(tree);

	  if (tree.proxy) {
	    const {
	      proxy
	    } = tree;
	    proxy.unmount();
	    return;
	  }

	  if (tree.node) {
	    const {
	      node
	    } = tree;
	    renderer.removeNode(node);
	  }

	  unmount(renderer, tree.children);
	}

	function* getNodes(tree) {
	  if (Array.isArray(tree)) {
	    for (const it of tree) {
	      yield* getNodes(it);
	    }

	    return;
	  }

	  const {
	    node,
	    proxy
	  } = tree;

	  if (node) {
	    yield node;
	    return;
	  }

	  if (proxy) {
	    yield* getNodes(proxy.tree);
	  }
	}

	function getFirstNode(tree) {
	  if (Array.isArray(tree)) {
	    return getFirstNode(tree[0]);
	  }

	  if (tree.node) {
	    return tree.node;
	  }

	  return getFirstNode(tree.proxy.tree);
	}

	function drawReplace(renderer, newTree, oldTree) {
	  const next = getFirstNode(oldTree);

	  if (!next) {
	    return newTree;
	  }

	  const parentNode = renderer.getParent(next);

	  if (!parentNode) {
	    return newTree;
	  }

	  for (const it of getNodes(newTree)) {
	    renderer.insertNode(parentNode, it, next);
	  }

	  unmount(renderer, oldTree);
	  return newTree;
	}

	function getLastNode(tree) {
	  if (Array.isArray(tree)) {
	    return getLastNode(tree[tree.length - 1]);
	  }

	  if (tree.node) {
	    return tree.node;
	  }

	  return getLastNode(tree.proxy.tree);
	}

	function updateItem(renderer, mountOptions, source, tree) {
	  if (!source) {
	    if (Array.isArray(tree)) {
	      if (tree.length === 1 && tree[0].tag === null) {
	        return tree[0];
	      }
	    } else if (tree.tag === null) {
	      return tree;
	    }

	    return drawReplace(renderer, drawPlaceholder(renderer), tree);
	  }

	  if (Array.isArray(tree)) {
	    const index = tree.findIndex(it => it.tag === source.tag && it.proxy === source.proxy);

	    if (index < 0) {
	      return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
	    }

	    const all = tree;
	    [tree] = tree.splice(index, 1);
	    unmount(renderer, all);
	  }

	  if (source.proxy) {
	    const {
	      proxy
	    } = source;

	    if (proxy !== tree.proxy) {
	      return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
	    }

	    return createMountedNode({ ...source,
	      node: undefined,
	      proxy
	    }, tree.id);
	  }

	  if (tree.proxy || source.tag !== tree.tag) {
	    return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
	  }

	  if (source.tag === undefined) {
	    return tree;
	  }

	  return drawReplace(renderer, createItem(renderer, mountOptions, source), tree);
	}

	function updateList(renderer, mountOptions, source, tree) {
	  if (!source.length) {
	    const node = drawPlaceholder(renderer);
	    return [drawReplace(renderer, node, tree)];
	  }

	  if (!Array.isArray(tree)) {
	    tree = [tree];
	  }

	  const newList = [];
	  const list = [...tree];
	  const mountedMap = new Map();

	  for (const src of source) {
	    const index = list.findIndex(it => it.tag === src.tag && it.key === src.key && it.proxy === src.proxy);

	    if (index >= 0) {
	      const old = list[index];
	      const item = updateItem(renderer, mountOptions, src, old);
	      mountedMap.set(old, item);
	      newList.push(item);
	      list.splice(index, 1);
	    } else {
	      const item = createItem(renderer, mountOptions, src);
	      newList.push(item);
	    }
	  }

	  if (!mountedMap.size) {
	    return drawReplace(renderer, newList, list);
	  }

	  unmount(renderer, list);
	  tree = tree.filter(t => mountedMap.has(t));
	  const last = getLastNode(tree.map(t => mountedMap.get(t)).filter(Boolean));
	  const parentNode = renderer.getParent(last);

	  if (!parentNode) {
	    return newList;
	  }

	  let next = renderer.nextNode(last);

	  for (let i = newList.length - 1; i >= 0; i--) {
	    const item = newList[i];
	    const index = tree.findIndex(o => mountedMap.get(o) === item);

	    if (index >= 0) {
	      for (const it of tree.splice(index)) {
	        mountedMap.delete(it);
	      }
	    } else {
	      for (const it of getNodes(item)) {
	        renderer.insertNode(parentNode, it, next);
	      }
	    }

	    next = getFirstNode(item) || next;
	  }

	  return newList;
	}

	function updateAll(renderer, mountOptions, source, tree) {
	  if (source.length === 0) {
	    return drawReplace(renderer, createAll(renderer, mountOptions, []), tree);
	  }

	  let index = 0;
	  let length = Math.min(source.length, tree.length);
	  const list = [];

	  for (; index < length; index++) {
	    const src = source[index];

	    if (Array.isArray(src)) {
	      list.push(updateList(renderer, mountOptions, src, tree[index]));
	    } else {
	      list.push(updateItem(renderer, mountOptions, src, tree[index]));
	    }
	  }

	  length = Math.max(source.length, tree.length);

	  if (tree.length > index) {
	    for (; index < length; index++) {
	      unmount(renderer, tree[index]);
	    }
	  }

	  if (source.length > index) {
	    const last = getLastNode(list[list.length - 1]);
	    const parentNode = renderer.getParent(last);
	    const next = renderer.nextNode(last);

	    for (; index < length; index++) {
	      const src = source[index];
	      const item = Array.isArray(src) ? createList(renderer, mountOptions, src) : createItem(renderer, mountOptions, src);
	      list.push(item);

	      if (!parentNode) {
	        continue;
	      }

	      for (const it of getNodes(item)) {
	        renderer.insertNode(parentNode, it, next);
	      }
	    }
	  }

	  return list;
	}

	function draw(renderer, mountOptions, source, tree) {
	  if (!tree) {
	    return createAll(renderer, mountOptions, source);
	  }

	  return updateAll(renderer, mountOptions, source, tree);
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
	class BaseProxy {
	  constructor(renderer, originalTag, tag, attrs, parent, delivered) {
	    _defineProperty(this, "tag", void 0);

	    _defineProperty(this, "attrs", void 0);

	    _defineProperty(this, "renderer", void 0);

	    _defineProperty(this, "labels", void 0);

	    _defineProperty(this, "parentProxy", void 0);

	    _defineProperty(this, "delivered", void 0);

	    _defineProperty(this, "created", false);

	    _defineProperty(this, "destroyed", false);

	    _defineProperty(this, "mounted", false);

	    _defineProperty(this, "unmounted", false);

	    _defineProperty(this, "tree", []);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    _defineProperty(this, "originalTag", void 0);

	    _defineProperty(this, "__executed_destroy", false);

	    _defineProperty(this, "__mountOptions", null);

	    _defineProperty(this, "__cancelDrawMonitor", void 0);

	    _defineProperty(this, "__executed_unmounted", false);

	    this.originalTag = originalTag;
	    this.tag = tag;
	    this.renderer = renderer;
	    this.attrs = attrs;
	    this.parentProxy = parent;
	    this.delivered = delivered || (parent === null || parent === void 0 ? void 0 : parent.delivered) || Object.create(null);

	    {
	      defineProperty(this, 'tree', []);
	    }
	  }

	  update(attrs, children) {
	    this.attrs = attrs;

	    this._update(attrs, children);
	  }

	  destroy() {
	    if (this.__executed_destroy) {
	      return false;
	    }

	    this.__executed_destroy = true;
	    this.callHook('beforeDestroy');

	    this._destroy();

	    this.callHook('destroyed');
	    this.destroyed = true;
	    return true;
	  }

	  mount(mountOptions) {
	    if (this.__executed_destroy) {
	      return false;
	    }

	    if (!mountOptions) {
	      return false;
	    }

	    if (this.__mountOptions) {
	      return false;
	    }

	    this.__mountOptions = mountOptions;
	    this.callHook('beforeMount');
	    const result = exec(c => c && this.requestDraw(), () => {
	      const newMountOptions = this._mount(mountOptions);

	      this.__mountOptions = newMountOptions || mountOptions;
	      this.mounted = true;
	    });
	    this.__cancelDrawMonitor = result.stop;
	    complete(() => this.callHook('mounted'));
	    return true;
	  }

	  unmount() {
	    if (!this.mounted) {
	      return false;
	    }

	    if (this.__executed_unmounted) {
	      return false;
	    }

	    this.__executed_unmounted = true;
	    this.callHook('beforeUnmount');

	    this._unmount();

	    this.callHook('unmounted');
	    this.unmounted = true;
	    return true;
	  }

	  redraw() {
	    if (this.__executed_destroy) {
	      return;
	    }

	    if (!this.mounted) {
	      return;
	    }

	    const mountOptions = this.__mountOptions;

	    if (!mountOptions) {
	      return;
	    }

	    if (this.__cancelDrawMonitor) {
	      this.__cancelDrawMonitor();
	    }

	    this.callHook('beforeDraw');
	    const result = exec(c => c && this.requestDraw(), () => this._redraw(mountOptions));
	    this.__cancelDrawMonitor = result.stop;
	    complete(() => this.callHook('drawn'));
	  }

	}

	class NodeProxy extends BaseProxy {
	  constructor(originalTag, tag, attrs, children, parent, delivered) {
	    super(parent.renderer, originalTag, tag, attrs, parent, delivered);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    this.container = parent.container;
	    this.componentRoot = parent.componentRoot;
	  }

	  requestDraw() {
	    if (!this.mounted) {
	      return;
	    }

	    if (this.destroyed) {
	      return;
	    }

	    this.container.markDraw(this);
	  }

	  callHook(id) {}

	}

	let delayedRefresh = 0;
	const objectSet = new Set();
	function wait$1(obj) {
	  if (delayedRefresh <= 0) {
	    return false;
	  }

	  objectSet.add(obj);
	  return true;
	}

	function run$1() {
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
	    run$1();
	  }
	}

	function delayRefresh(f, async) {
	  if (async) {
	    return asyncRefresh(f);
	  }

	  try {
	    delayedRefresh++;
	    return f();
	  } finally {
	    delayedRefresh--;
	    run$1();
	  }
	}

	const destroyFns$1 = Object.create(null);
	let nextId$1 = 0;
	function createWith({
	  name,
	  create = () => ({}),
	  destroy,
	  exec
	}) {
	  const id = nextId$1++;

	  if (typeof destroy === 'function') {
	    destroyFns$1[id] = destroy;
	  }

	  if (typeof exec === 'function') {
	    return (...p) => {
	      const current = checkCurrent(name);
	      const {
	        withData,
	        destroyed,
	        isSimple,
	        isShell
	      } = current;

	      if (!(id in withData)) {
	        withData[id] = create({
	          destroyed,
	          isSimple,
	          isShell
	        });
	      }

	      return exec(withData[id], {
	        destroyed,
	        isSimple,
	        isShell
	      }, ...p);
	    };
	  }

	  return () => {
	    const current = checkCurrent(name);
	    const {
	      withData
	    } = current;

	    if (!(id in withData)) {
	      const {
	        destroyed,
	        isSimple,
	        isShell
	      } = current;
	      withData[id] = create({
	        destroyed,
	        isSimple,
	        isShell
	      });
	    }

	    return withData[id];
	  };
	}
	function destroyContextData(contextData) {
	  const keys = Object.keys(contextData);

	  for (const id of keys) {
	    if (!(id in destroyFns$1)) {
	      continue;
	    }

	    const destroy = destroyFns$1[id];
	    destroy(contextData[id]);
	  }
	}
	function createBy(contextData) {
	  return function by(fn, ...p) {
	    return runCurrent(contextData, undefined, fn, ...p);
	  };
	}

	function getSlots(renderer, children, slots, native = false) {
	  const nativeList = [];

	  for (const it of children) {
	    if (Array.isArray(it)) {
	      const list = Object.create(null);
	      nativeList.push(getSlots(renderer, it, list, native));

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
	      if (isSimpleComponent(it.tag) && it.execed || it.tag === Template) {
	        const list = Object.create(null);
	        nativeList.push(getSlots(renderer, it.children, list, native));

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
	      if (renderer.isNode(it)) {
	        nativeList.push(it);
	        continue;
	      }

	      if (!isElement(it)) {
	        nativeList.push(it);
	        continue;
	      }

	      if (it.tag !== Render && it.tag !== Template) {
	        nativeList.push(it);
	        continue;
	      }
	    }

	    const slot = isElement(it) && it.slot || 'default';
	    const el = isElement(it) ? { ...it,
	      slot: undefined,
	      props: { ...it.props,
	        'n:slot': undefined
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
	function setSlot(slots, name, list) {
	  Reflect.defineProperty(slots, name, {
	    get() {
	      markRead(slots, name);
	      return list;
	    },

	    enumerable: true,
	    configurable: true
	  });
	  markChange(slots, name);
	  return list;
	}
	function setSlots(children, slots, oldChildren) {
	  if (!slots) {
	    const slots = Object.create(null);

	    for (const k of Reflect.ownKeys(children)) {
	      slots[k] = children[k];
	    }

	    return slots;
	  }

	  for (const name of Reflect.ownKeys(slots)) {
	    if (name in children) {
	      continue;
	    }

	    setSlot(slots, name);
	  }

	  if (!oldChildren) {
	    for (const name of Reflect.ownKeys(children)) {
	      const list = children[name];
	      setSlot(slots, name, list);
	    }

	    return slots;
	  }

	  for (const name of Reflect.ownKeys(children)) {
	    const list = children[name];

	    if (equal$1(list, oldChildren[name])) {
	      continue;
	    }

	    setSlot(slots, name, list);
	  }

	  return slots;
	}
	function renderSlot(list, argv) {
	  return list.map(it => {
	    if (Array.isArray(it)) {
	      return renderSlot(it, argv);
	    }

	    if (!isElement(it)) {
	      return it;
	    }

	    if (it.tag !== Render) {
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

	    return render(argv);
	  });
	}

	function getSlot(slots, name, isSimple) {
	  return isSimple || name in slots ? slots[name] : setSlot(slots, name);
	}

	function createSlotApi(slots, isSimple = false) {
	  function slotApi(name = 'default', argv = {}) {
	    const list = getSlot(slots, name, isSimple);
	    return {
	      [objectTypeSymbol]: objectTypeSymbolElement,
	      tag: ScopeSlot,
	      children: list ? renderSlot(list, argv) : [],
	      inserted: true,
	      slot: name,
	      isDefault: !list
	    };
	  }

	  slotApi.has = (name = 'default') => Boolean(getSlot(slots, name, isSimple));

	  return slotApi;
	}

	function createEmit(emitter, omitNames = []) {
	  const emit = (name, p, options) => delayRefresh(() => {
	    const cancelable = Boolean(options === null || options === void 0 ? void 0 : options.cancelable);
	    const {
	      target
	    } = emitter;
	    let defaultPrevented = true;
	    const eventInfo = {
	      get target() {
	        return target;
	      },

	      get cancelable() {
	        return cancelable;
	      },

	      get defaultPrevented() {
	        return defaultPrevented;
	      },

	      get prevented() {
	        return defaultPrevented;
	      },

	      preventDefault() {
	        defaultPrevented = false;
	      },

	      prevent() {
	        defaultPrevented = false;
	      }

	    };
	    const events = emitter.events[name];

	    if (!events) {
	      return defaultPrevented;
	    }

	    for (const event of events) {
	      event(p, eventInfo);
	    }

	    return defaultPrevented;
	  });

	  emit.omit = (...names) => createEmit(emitter, [...omitNames, ...names]);

	  Reflect.defineProperty(emit, 'names', {
	    get: () => {
	      markRead(createEmit, 'names');
	      return [...emitter.names].filter(t => !omitNames.includes(t));
	    },
	    configurable: true
	  });
	  return emit;
	}

	class EventEmitter {
	  get names() {
	    markRead(this, 'names');
	    return [...this._names];
	  }

	  constructor() {
	    _defineProperty(this, "_names", new Set());

	    _defineProperty(this, "events", Object.create(null));

	    _defineProperty(this, "emit", createEmit(this));

	    _defineProperty(this, "on", void 0);

	    _defineProperty(this, "target", void 0);

	    _defineProperty(this, "__propsEvents", Object.create(null));

	    _defineProperty(this, "__eventMap", Object.create(null));

	    _defineProperty(this, "__propsEmitEvents", Object.create(null));

	    _defineProperty(this, "__propsEmitEvent", void 0);

	    const names = this._names;
	    const eventSet = this.events;

	    const on = (name, listener) => {
	      var _event;

	      function fn(p, event) {
	        try {
	          listener(p, event);
	        } catch (e) {
	          printError(e);
	        }
	      }

	      let event = eventSet[name];

	      if (!((_event = event) === null || _event === void 0 ? void 0 : _event.size)) {
	        event = new Set();
	        event.add(fn);
	        eventSet[name] = event;
	        names.add(name);
	        markChange(this, 'names');
	      } else {
	        event.add(fn);
	      }

	      let removed = false;
	      return () => {
	        if (removed) {
	          return;
	        }

	        removed = true;

	        if (!event) {
	          return;
	        }

	        event.delete(fn);

	        if (event.size) {
	          return;
	        }

	        names.delete(name);
	        markChange(this, 'names');
	      };
	    };

	    this.on = on;
	  }

	  updateInProps(props) {
	    const oldPropsEvents = this.__propsEvents;
	    const oldEventNames = new Set(Object.keys(oldPropsEvents));

	    for (const [entName, fn] of getEvents(props)) {
	      if (oldEventNames.has(entName)) {
	        oldEventNames.delete(entName);
	        const [olfFn, cl] = oldPropsEvents[entName] || [];

	        if (olfFn === fn) {
	          continue;
	        }

	        if (cl) {
	          cl();
	        }
	      }

	      oldPropsEvents[entName] = [fn, this.on(entName, fn)];
	    }

	    for (const entName of oldEventNames) {
	      const e = oldPropsEvents[entName];

	      if (!e) {
	        continue;
	      }

	      e[1]();
	      delete oldPropsEvents[entName];
	    }

	    const eventMap = this.__eventMap;
	    const oldEventMapNames = new Set(Object.keys(eventMap));

	    for (const [entName, fn] of getEventsMap(props)) {
	      if (oldEventMapNames.has(entName)) {
	        oldEventMapNames.delete(entName);
	        const [olfFn, cl] = eventMap[entName] || [];

	        if (olfFn === fn) {
	          continue;
	        }

	        if (cl) {
	          cl();
	        }
	      }

	      eventMap[entName] = [fn, this.on(entName, fn)];
	    }

	    for (const entName of oldEventMapNames) {
	      const e = eventMap[entName];

	      if (!e) {
	        continue;
	      }

	      e[1]();
	      delete eventMap[entName];
	    }

	    const oldEmitEvents = this.__propsEmitEvents;
	    const eventsFn = getEmitFn(props);

	    if (eventsFn !== this.__propsEmitEvent) {
	      this.__propsEmitEvent = eventsFn;

	      for (const entName of [...Object.keys(oldEmitEvents)]) {
	        const e = oldEmitEvents[entName];

	        if (!e) {
	          continue;
	        }

	        e();
	        delete oldEmitEvents[entName];
	      }

	      if (!eventsFn) {
	        return;
	      }

	      const {
	        names
	      } = eventsFn;

	      if (!Array.isArray(names)) {
	        return;
	      }

	      for (const n of names) {
	        oldEmitEvents[n] = this.on(n, p => eventsFn(n, p));
	      }

	      return;
	    }

	    if (!eventsFn) {
	      return;
	    }

	    const oldNames = new Set(Object.keys(oldEmitEvents));
	    const names = eventsFn.names || [];

	    for (const n of names) {
	      if (!n) {
	        continue;
	      }

	      oldNames.delete(n);

	      if (oldNames.has(n)) {
	        continue;
	      }

	      oldEmitEvents[n] = this.on(n, p => eventsFn(n, p));
	    }

	    for (const entName of oldNames) {
	      const e = oldEmitEvents[entName];

	      if (!e) {
	        continue;
	      }

	      e();
	      delete oldEmitEvents[entName];
	    }
	  }

	}

	function* getEvents(p) {
	  if (!p) {
	    return;
	  }

	  for (const k of Object.keys(p)) {
	    const fn = p[k];

	    if (typeof fn !== 'function') {
	      continue;
	    }

	    if (k.substr(0, 3) !== 'on:') {
	      continue;
	    }

	    const entName = k.substr(3);

	    if (!entName) {
	      continue;
	    }

	    yield [entName, fn];
	  }
	}

	function* getEventsMap(p) {
	  if (!p) {
	    return;
	  }

	  const events = p['n:on'];

	  if (!events) {
	    return;
	  }

	  if (typeof events === 'object') {
	    return;
	  }

	  for (const k of Object.keys(p)) {
	    const fn = p[k];

	    if (typeof fn !== 'function') {
	      continue;
	    }

	    yield [k, fn];
	  }
	}

	function getEmitFn(p) {
	  if (!p) {
	    return;
	  }

	  let eventsFn = p === null || p === void 0 ? void 0 : p['n:on'];

	  if (typeof eventsFn !== 'function') {
	    return;
	  }

	  return eventsFn;
	}

	function createSimpleEmit(props) {
	  const event = new EventEmitter();
	  event.updateInProps(props);
	  return event.emit;
	}

	function getComponents(...components) {
	  return components.filter(Boolean);
	}

	function getNodeArray(result) {
	  if (Array.isArray(result)) {
	    return result;
	  }

	  if (!isElement(result)) {
	    return [result];
	  }

	  if (result.tag !== Fragment) {
	    return [result];
	  }

	  return result.children;
	}

	const components = Object.create(null);
	function register(name, component) {
	  components[name] = component;
	}

	function findComponent(tag, components$1, native) {
	  if (!tag) {
	    return null;
	  }

	  if (typeof tag !== 'string') {
	    return tag;
	  }

	  if (/^core:/i.test(tag)) {
	    let ltag = tag.toLowerCase();

	    if (ltag === Container) {
	      return ltag;
	    }

	    if (ltag === ScopeSlot) {
	      return ltag;
	    }

	    if (ltag === Render) {
	      return ltag;
	    }

	    if (ltag === Slot) {
	      return native ? 'slot' : ScopeSlot;
	    }

	    return Fragment;
	  }

	  if (tag === Fragment) {
	    return tag;
	  }

	  if (tag === 'slot') {
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

	  return getNodeArray(fn(args));
	}

	function createSimpleSlots(normalizeAuxiliaryObject, children) {
	  const slotMap = Object.create(null);
	  getSlots(normalizeAuxiliaryObject.renderer, children, slotMap);
	  return setSlots(slotMap);
	}

	function createSimpleContextData(normalizeAuxiliaryObject) {
	  return {
	    isShell: false,
	    isSimple: true,
	    created: false,
	    destroyed: true,
	    delivered: normalizeAuxiliaryObject.delivered,
	    withData: {},
	    refresh: normalizeAuxiliaryObject.refresh,
	    parent: normalizeAuxiliaryObject.simpleParent,
	    getChildren: () => []
	  };
	}

	function execSimple(normalizeAuxiliaryObject, node, tag, components, children) {
	  const slots = createSimpleSlots(normalizeAuxiliaryObject, children);
	  const contextData = createSimpleContextData(normalizeAuxiliaryObject);
	  const result = runCurrent(contextData, undefined, tag, { ...node.props
	  }, {
	    by: createBy(contextData),
	    slot: createSlotApi(slots, true),
	    childNodes: () => children,
	    emit: createSimpleEmit(node.props)
	  });
	  const nodes = init(normalizeAuxiliaryObject, getNodeArray(result), slots, getComponents(...components, tag[componentsSymbol]), false, true);
	  return { ...node,
	    tag,
	    execed: true,
	    children: Array.isArray(nodes) ? nodes : [nodes]
	  };
	}

	function getSlotRenderFn(normalizeAuxiliaryObject, children, slots, components, native) {
	  if (children.length !== 1) {
	    return null;
	  }

	  const [renderFn] = children;

	  if (isValue(renderFn) || typeof renderFn !== 'function') {
	    return null;
	  }

	  const {
	    slotRenderFnList
	  } = normalizeAuxiliaryObject;
	  const fn = slotRenderFnList.get(renderFn);

	  if (fn) {
	    return fn;
	  }

	  const newFn = function (...p) {
	    return init(normalizeAuxiliaryObject, renderFn.call(this, ...p), slots, components, native, false);
	  };

	  slotRenderFnList.set(renderFn, newFn);
	  return newFn;
	}

	function exec$1(node, normalizeAuxiliaryObject, slots, components, native, simpleSlot) {
	  var _node$props;

	  if (Array.isArray(node)) {
	    return node.map(n => exec$1(n, normalizeAuxiliaryObject, slots, components, native, simpleSlot));
	  }

	  if (!isElement(node)) {
	    return node;
	  }

	  if (node.tag === ScopeSlot && node.inserted) {
	    return node;
	  }

	  const {
	    children
	  } = node;
	  const tag = findComponent(node.tag, components, native);

	  if (isSimpleComponent(tag)) {
	    if (node.execed) {
	      return node;
	    }

	    return execSimple(normalizeAuxiliaryObject, node, tag, components, children.map(n => exec$1(n, normalizeAuxiliaryObject, slots, components, native, simpleSlot)));
	  }

	  if (tag === Render) {
	    const slotRenderFn = getSlotRenderFn(normalizeAuxiliaryObject, children, slots, components, native);

	    if (slotRenderFn) {
	      return { ...node,
	        children: [slotRenderFn]
	      };
	    }
	  }

	  if (tag !== ScopeSlot) {
	    return { ...node,
	      tag,
	      children: children.map(n => exec$1(n, normalizeAuxiliaryObject, slots, components, native, simpleSlot))
	    };
	  }

	  const {
	    props
	  } = node;
	  const args = (props === null || props === void 0 ? void 0 : props.argv) || {};
	  const slotName = ((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.name) || 'default';
	  const slot = simpleSlot || slotName in slots ? slots[slotName] : setSlot(slots, slotName);
	  const el = {
	    [objectTypeSymbol]: objectTypeSymbolElement,
	    props,
	    key: node.key,
	    tag: ScopeSlot,
	    inserted: true,
	    slot: slotName,
	    isDefault: !slot,
	    children: slot ? renderSlot(slot, args) : getChildren(children, args).map(n => exec$1(n, normalizeAuxiliaryObject, slots, components, native, simpleSlot))
	  };
	  return el;
	}

	function init(normalizeAuxiliaryObject, node, slots, components, native, simpleSlot) {
	  return delayRefresh(() => postpone(() => exec$1(node, normalizeAuxiliaryObject, slots, components, native, simpleSlot)));
	}
	function normalize(proxy, slotRenderFnList, refresh, result, components = proxy.tag[componentsSymbol] || null) {
	  return init({
	    renderer: proxy.renderer,
	    refresh,
	    slotRenderFnList,
	    delivered: proxy.delivered,
	    simpleParent: proxy.entity
	  }, getNodeArray(result), proxy.slots, getComponents(components), Boolean(proxy.isNative), false);
	}

	function getText(value) {
	  if (value === undefined || value === null) {
	    return null;
	  }

	  if (value instanceof Date) {
	    return value.toISOString();
	  }

	  if (value instanceof RegExp) {
	    return String(value);
	  }

	  return String(value);
	}

	function getNodeArray$1(result) {
	  if (!isElement(result)) {
	    return [result];
	  }

	  if (result.tag !== Fragment) {
	    return [result];
	  }

	  return result.children;
	}

	class ValueProxy extends NodeProxy {
	  get content() {
	    return this.tree;
	  }

	  set value(v) {
	    const k = v !== this.__value;
	    this.__value = v;

	    if (k) {
	      markChange(this, 'value');
	    }
	  }

	  get value() {
	    markRead(this, 'value');
	    let v = this.__value;

	    while (isValue(v)) {
	      v = v();
	    }

	    return v;
	  }

	  constructor(attrs, parent) {
	    super(null, null, attrs, [], parent);

	    _defineProperty(this, "__value", void 0);

	    _defineProperty(this, "text", void 0);

	    _defineProperty(this, "isValue", void 0);

	    _defineProperty(this, "__nodes", void 0);

	    _defineProperty(this, "src", void 0);

	    _defineProperty(this, "__render", void 0);

	    _defineProperty(this, "__refreshing", false);

	    _defineProperty(this, "__needRefresh", false);

	    const {
	      value
	    } = attrs;
	    this.__value = value;

	    {
	      defineProperty(this, 'text', undefined);
	      defineProperty(this, 'isValue', isValue(value));
	    }

	    const slots = Object.create(null);
	    const normalizeAuxiliaryObject = {
	      renderer: this.renderer,
	      refresh: () => this.refresh(),
	      slotRenderFnList: new WeakMap(),
	      delivered: this.delivered,
	      simpleParent: undefined
	    };
	    this.__render = monitor(changed => changed && this.refresh(), () => {
	      let {
	        value
	      } = this;

	      if (isElement(value) || Array.isArray(value)) {
	        this.__nodes = convert(this, init(normalizeAuxiliaryObject, getNodeArray$1(value), slots, [], false, false), this.__nodes);
	        return true;
	      }

	      if (this.__nodes) {
	        destroy(this.__nodes);
	        this.__nodes = undefined;
	      } else if (this.src === value) {
	        return false;
	      }

	      this.src = value;
	      return true;
	    });
	    this.created = true;
	    this.refresh();
	  }

	  refresh() {
	    if (this.destroyed) {
	      return;
	    }

	    this.__needRefresh = true;

	    if (!this.created) {
	      return;
	    }

	    if (this.__refreshing) {
	      return;
	    }

	    this.__refreshing = true;
	    let needDraw = false;

	    while (this.__needRefresh && !wait$1(this)) {
	      this.__needRefresh = false;
	      needDraw = this.__render() || needDraw;

	      if (this.destroyed) {
	        return;
	      }
	    }

	    this.__refreshing = false;

	    if (!needDraw) {
	      return;
	    }

	    if (wait$1(this)) {
	      return;
	    }

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

	  _update({
	    value
	  }) {
	    this.value = value;

	    {
	      this.isValue = isValue(value);
	    }
	  }

	  _destroy() {
	    this.__render.stop();

	    const {
	      __nodes
	    } = this;

	    if (!__nodes) {
	      return;
	    }

	    destroy(__nodes);
	  }

	  _mount(mountOptions) {
	    const {
	      renderer,
	      __nodes,
	      src
	    } = this;

	    if (__nodes) {
	      this.tree = draw(renderer, mountOptions, __nodes);
	      return;
	    }

	    if (renderer.isNode(src)) {
	      this.tree = [createMountedNode({
	        node: src
	      })];
	      return;
	    }

	    const text = getText(src);

	    {
	      this.text = text;
	    }

	    const node = typeof text === 'string' ? createMountedNode({
	      node: renderer.createText(text)
	    }) : drawPlaceholder(renderer);
	    this.tree = [node];
	  }

	  _redraw(mountOptions) {
	    const {
	      renderer,
	      __nodes,
	      src
	    } = this;

	    if (__nodes) {
	      this.tree = draw(renderer, mountOptions, __nodes, this.tree);
	      return;
	    }

	    if (renderer.isNode(src)) {
	      this.tree = [createMountedNode({
	        node: src
	      })];

	      {
	        this.text = undefined;
	      }

	      return;
	    }

	    const text = getText(src);

	    {
	      this.text = text;
	    }

	    const node = typeof text === 'string' ? createMountedNode({
	      node: renderer.createText(text)
	    }) : drawPlaceholder(renderer);
	    this.tree = drawReplace(renderer, [node], this.tree);
	  }

	  _unmount() {
	    const {
	      renderer,
	      tree
	    } = this;
	    unmount(renderer, tree);
	  }

	}

	class DeliverProxy extends NodeProxy {
	  get content() {
	    return this.tree;
	  }

	  constructor(originalTag, tag, props, children, parent) {
	    super(originalTag, tag, props, children, parent, Object.create(parent.delivered));

	    _defineProperty(this, "__valueObject", void 0);

	    _defineProperty(this, "__nodes", void 0);

	    const {
	      value
	    } = props;
	    this.__valueObject = value;
	    Reflect.defineProperty(this.delivered, tag[deliverKeySymbol], {
	      configurable: true,
	      enumerable: true,
	      get: () => {
	        markRead(this, 'value');
	        return this.__valueObject;
	      }
	    });
	    this.__nodes = convert(this, children);
	    this.created = true;
	  }

	  _update({
	    value
	  }, children) {
	    if (this.__valueObject !== value) {
	      this.__valueObject = value;
	      markChange(this, 'value');
	    }

	    this.__nodes = convert(this, children, this.__nodes);
	    this.requestDraw();
	  }

	  _destroy() {
	    destroy(this.__nodes);
	  }

	  _mount(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this.__nodes);
	  }

	  _redraw(mountOptions) {
	    const {
	      renderer,
	      __nodes,
	      tree
	    } = this;
	    this.tree = draw(renderer, mountOptions, __nodes, tree);
	  }

	  _unmount() {
	    unmount(this.renderer, this.tree);
	  }

	}

	class GroupProxy extends NodeProxy {
	  get content() {
	    return this.tree;
	  }

	  constructor(tag, children, parent) {
	    super(tag, tag, {}, children, parent);

	    _defineProperty(this, "__nodes", void 0);

	    this.__nodes = convert(this, children);
	  }

	  _update(props, children) {
	    this.__nodes = convert(this, children, this.__nodes);
	    this.requestDraw();
	  }

	  _destroy() {
	    destroy(this.__nodes);
	  }

	  _mount(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this.__nodes);
	  }

	  _redraw(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this.__nodes, this.tree);
	  }

	  _unmount() {
	    unmount(this.renderer, this.tree);
	  }

	}

	function updateData(props, data) {
	  const oldKeys = new Set(Object.keys(data));

	  for (const k in props) {
	    if (k.substr(0, 5) !== 'data:') {
	      continue;
	    }

	    const key = k.substr(5);

	    if (!key) {
	      continue;
	    }

	    oldKeys.delete(key);
	    data[key] = props[key];
	  }

	  const dataset = props['n:data'];

	  if (dataset && typeof dataset === 'object') {
	    for (const key in dataset) {
	      if (!key) {
	        continue;
	      }

	      oldKeys.delete(key);
	      data[key] = dataset[key];
	    }
	  }

	  for (const key of oldKeys) {
	    delete data[key];
	  }
	}

	class RefProxy extends BaseProxy {
	  get exposed() {
	    return this.__exposed;
	  }

	  setExposed(t) {
	    if (this.destroyed) {
	      return;
	    }

	    const ref = this.__ref;

	    if (typeof ref !== 'function') {
	      this.__exposed = t;
	      return;
	    }

	    const old = this.__exposed;
	    this.__exposed = t;
	    ref(t, old, this.entity);
	  }

	  constructor(renderer, originalTag, tag, attrs, parent, delivered) {
	    super(renderer, originalTag, tag, attrs, parent, delivered);

	    _defineProperty(this, "__exposed", void 0);

	    _defineProperty(this, "__ref", void 0);

	    _defineProperty(this, "events", void 0);

	    _defineProperty(this, "entity", void 0);

	    _defineProperty(this, "data", Object.create(null));

	    updateData(attrs, this.data);
	    const events = new EventEmitter();
	    const entity = this.createEntity(events);
	    events.target = entity;
	    this.entity = entity;
	    this.events = events;
	    const ref = attrs['n:ref'];

	    if (typeof ref === 'function') {
	      this.__ref = ref;
	      ref(undefined, undefined, entity, true);
	    }
	  }

	  update(attrs, children) {
	    updateData(attrs, this.data);
	    const ref = attrs['n:ref'];
	    const oldRef = this.__ref;

	    if (ref !== oldRef) {
	      if (typeof ref === 'function') {
	        ref(this.__exposed);
	      } else if (oldRef) {
	        this.__ref = undefined;
	      }
	    }

	    super.update(attrs, children);
	  }

	  destroy() {
	    if (!super.destroy()) {
	      return false;
	    }

	    const ref = this.__ref;

	    if (typeof ref !== 'function') {
	      return true;
	    }

	    ref(undefined, this.__exposed, this.entity, false);
	    return true;
	  }

	}

	class ElementProxy extends RefProxy {
	  constructor(originalTag, tag, props, children, parent) {
	    super(parent.renderer, originalTag, tag, props, parent);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    _defineProperty(this, "props", void 0);

	    _defineProperty(this, "__nodes", void 0);

	    _defineProperty(this, "node", void 0);

	    _defineProperty(this, "content", []);

	    _defineProperty(this, "__elementTagData", void 0);

	    this.container = parent.container;
	    this.componentRoot = parent.componentRoot;

	    {
	      defineProperty(this, 'content', []);
	    }

	    this.props = props;
	    this.events.updateInProps(props);
	    this.__nodes = convert(this, children);

	    if (typeof tag === 'string') {
	      this.__elementTagData = tag;
	    } else {
	      this.__elementTagData = tag[componentValueSymbol];
	    }
	  }

	  requestDraw() {
	    if (!this.mounted) {
	      return;
	    }

	    if (this.destroyed) {
	      return;
	    }

	    this.container.markDraw(this);
	  }

	  callHook(id) {}

	  createEntity(events) {
	    const cfg = {
	      data: {
	        configurable: true,
	        value: this.data
	      },
	      exposed: {
	        configurable: true,
	        get: () => this.exposed
	      },
	      on: {
	        configurable: true,
	        value: events.on
	      },
	      emit: {
	        configurable: true,
	        value: events.emit
	      }
	    };
	    const entity = Object.create(null, cfg);
	    return entity;
	  }

	  _update(props, children) {
	    this.props = props;
	    this.events.updateInProps(props);
	    this.__nodes = convert(this, children, this.__nodes);
	    this.requestDraw();
	  }

	  _destroy() {
	    if (this.destroyed) {
	      return;
	    }

	    this.destroyed = true;
	    destroy(this.__nodes);
	  }

	  _mount(mountOptions) {
	    if (this.node) {
	      return;
	    }

	    const {
	      renderer,
	      __elementTagData: tag,
	      props,
	      __nodes
	    } = this;
	    const node = renderer.createElement(tag, props, mountOptions);

	    if (!node) {
	      return;
	    }

	    this.node = node;
	    this.setExposed(node);
	    const subMountOptions = renderer.getMountOptions(node, mountOptions) || mountOptions;

	    if (__nodes) {
	      const content = draw(renderer, subMountOptions, __nodes);
	      this.content = content;

	      for (const it of getNodes(content)) {
	        renderer.insertNode(node, it);
	      }
	    }

	    this.tree = [createMountedNode({
	      node
	    })];
	    renderer.updateProps(node, tag, props, this.events.emit, subMountOptions);
	    return subMountOptions;
	  }

	  _redrawChildren(mountOptions) {
	    const {
	      renderer,
	      __nodes,
	      content,
	      node
	    } = this;

	    if (!node) {
	      return;
	    }

	    if (!__nodes.length && content.length) {
	      unmount(renderer, content);
	      this.content = [];
	    } else if (__nodes.length && content.length) {
	      this.content = draw(renderer, mountOptions, __nodes, content);
	    } else if (__nodes.length && !content.length) {
	      const newTree = draw(renderer, mountOptions, __nodes);
	      this.content = newTree;

	      for (const it of getNodes(newTree)) {
	        renderer.insertNode(node, it);
	      }
	    }
	  }

	  _redraw(mountOptions) {
	    this._redrawChildren(mountOptions);

	    const {
	      renderer,
	      __elementTagData: tag,
	      node,
	      props
	    } = this;

	    if (!node) {
	      return;
	    }

	    renderer.updateProps(node, tag, props || {}, this.events.emit, mountOptions);
	  }

	  _unmount() {
	    const {
	      renderer,
	      tree,
	      node
	    } = this;

	    if (!node) {
	      return;
	    }

	    renderer.removeNode(node);
	    unmount(renderer, tree);
	  }

	}

	function createInfo(obj) {
	  const cfg = {
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
	    }
	  };
	  return Object.create(null, cfg);
	}

	class CustomComponentProxy extends RefProxy {
	  constructor(originalTag, tag, attrs, parent, isShell) {
	    var _parent$componentRoot;

	    super(parent.renderer, originalTag, tag, attrs, parent);

	    _defineProperty(this, "contextData", void 0);

	    _defineProperty(this, "parentComponentProxy", void 0);

	    _defineProperty(this, "children", new Set());

	    _defineProperty(this, "__refreshing", false);

	    _defineProperty(this, "__needRefresh", false);

	    _defineProperty(this, "__delayedRefresh", 0);

	    _defineProperty(this, "_nodes", []);

	    const _this = this;

	    this.parentComponentProxy = parent.componentRoot;
	    const parentEntity = (_parent$componentRoot = parent.componentRoot) === null || _parent$componentRoot === void 0 ? void 0 : _parent$componentRoot.entity;
	    this.contextData = {
	      isShell,
	      isSimple: false,

	      get created() {
	        return _this.created;
	      },

	      get destroyed() {
	        return _this.destroyed;
	      },

	      delivered: this.delivered,
	      withData: {},
	      info: isShell ? undefined : createInfo(this),
	      hooks: isShell ? undefined : {},
	      useData: isShell ? undefined : [],
	      refresh: this.refresh.bind(this),
	      parent: parentEntity,
	      getChildren: () => [...this.children].map(t => t.exposed)
	    };
	  }

	  get needRefresh() {
	    return this.__needRefresh;
	  }

	  refresh(f) {
	    if (typeof f === 'function') {
	      try {
	        this.__delayedRefresh++;
	        return f();
	      } finally {
	        this.__delayedRefresh--;

	        if (this.__delayedRefresh <= 0) {
	          this.refresh();
	        }
	      }
	    }

	    if (this.destroyed) {
	      return;
	    }

	    this.__needRefresh = true;

	    if (!this.created) {
	      return;
	    }

	    if (this.__refreshing) {
	      return;
	    }

	    this.__refreshing = true;
	    let nodes;

	    for (;;) {
	      if (wait$1(this)) {
	        break;
	      }

	      if (this.__delayedRefresh) {
	        break;
	      }

	      if (!this.__needRefresh) {
	        break;
	      }

	      this.__needRefresh = false;
	      nodes = this._render();

	      if (this.destroyed) {
	        return;
	      }
	    }

	    this.__refreshing = false;

	    if (this.destroyed) {
	      return;
	    }

	    if (this.__delayedRefresh) {
	      return;
	    }

	    if (!nodes) {
	      return;
	    }

	    if (wait$1(this)) {
	      return;
	    }

	    this._nodes = convert(this, nodes, this._nodes);

	    if (!this.mounted) {
	      return;
	    }

	    if (this.unmounted) {
	      return;
	    }

	    this.requestDraw();
	  }

	  _destroy() {
	    this._stopRender();

	    const {
	      contextData
	    } = this;
	    destroyContextData(contextData.withData);
	    destroyUseData(contextData.useData);
	    destroy(this._nodes);
	  }

	}

	function getNodeArray$2(result) {
	  if (Array.isArray(result)) {
	    return result;
	  }

	  if (!isElement(result)) {
	    return [result];
	  }

	  if (result.tag !== Fragment) {
	    return [result];
	  }

	  return result.children;
	}

	class ShellProxy extends CustomComponentProxy {
	  get content() {
	    return this.tree;
	  }

	  requestDraw() {
	    if (!this.mounted) {
	      return;
	    }

	    if (this.destroyed) {
	      return;
	    }

	    this.container.markDraw(this);
	  }

	  callHook(id) {}

	  createEntity(events) {
	    const cfg = {
	      data: {
	        configurable: true,
	        value: this.data
	      },
	      exposed: {
	        configurable: true,
	        value: undefined
	      },
	      on: {
	        configurable: true,
	        value: events.on
	      },
	      emit: {
	        configurable: true,
	        value: events.emit
	      }
	    };
	    const entity = Object.create(null, cfg);
	    return entity;
	  }

	  constructor(originalTag, tag, props, children, parent) {
	    super(originalTag, tag, props, parent, true);

	    _defineProperty(this, "props", void 0);

	    _defineProperty(this, "childNodes", void 0);

	    _defineProperty(this, "src", void 0);

	    _defineProperty(this, "slots", Object.create(null));

	    _defineProperty(this, "lastSlots", void 0);

	    _defineProperty(this, "_render", void 0);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    _defineProperty(this, "_stopRender", void 0);

	    this.container = parent.container;
	    this.componentRoot = parent.componentRoot;
	    this.props = props;
	    this.childNodes = children;
	    const {
	      slots
	    } = this;
	    const {
	      delivered
	    } = this;

	    const refresh = f => {
	      this.refresh(f);
	    };

	    const event = this.events;
	    const {
	      contextData
	    } = this;
	    const context = {
	      by: createBy(this.contextData),
	      slot: createSlotApi(slots),
	      childNodes: () => this.childNodes,
	      emit: event.emit
	    };
	    const normalizeAuxiliaryObject = {
	      renderer: this.renderer,
	      refresh,
	      slotRenderFnList: new WeakMap(),
	      delivered,
	      simpleParent: undefined
	    };
	    const render = monitor(changed => changed && this.refresh(), () => {
	      const props = { ...this.props
	      };
	      event.updateInProps(props);
	      const result =   runCurrentWithLabel(contextData, undefined, l => this.labels = l, tag, props, context);
	      return init(normalizeAuxiliaryObject, getNodeArray$2(result), slots, [], false, false);
	    });
	    this._stopRender = render.stop;
	    this._render = render;
	    this.created = true;
	    this.refresh();
	    this._nodes = convert(this, this._render());
	  }

	  _update(props, children) {
	    this.props = props;
	    const slots = Object.create(null);
	    getSlots(this.renderer, children, slots);
	    setSlots(slots, this.slots, this.lastSlots);
	    this.lastSlots = slots;
	    this.childNodes = children;
	    this.refresh();
	  }

	  _mount(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this._nodes);
	  }

	  _redraw(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this._nodes, this.tree);
	  }

	  _unmount() {
	    unmount(this.renderer, this.tree);
	  }

	}

	class SlotProxy extends NodeProxy {
	  get content() {
	    return this.tree;
	  }

	  constructor(children, parent, isDefault) {
	    super(ScopeSlot, ScopeSlot, {}, [], parent);

	    _defineProperty(this, "__nodes", void 0);

	    this.__nodes = convert(this, children);
	  }

	  _update(props, children) {
	    if (!this.mounted) {
	      return;
	    }

	    if (this.destroyed) {
	      return;
	    }

	    this.__nodes = convert(this, children, this.__nodes);
	    this.requestDraw();
	  }

	  _destroy() {
	    destroy(this.__nodes);
	  }

	  _mount(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this.__nodes);
	  }

	  _redraw(mountOptions) {
	    this.tree = draw(this.renderer, mountOptions, this.__nodes, this.tree);
	  }

	  _unmount() {
	    unmount(this.renderer, this.tree);
	  }

	}

	function createEntity(obj, events) {
	  var _obj$parentComponentP;

	  const cfg = {
	    data: {
	      configurable: true,
	      value: obj.data
	    },
	    exposed: {
	      configurable: true,
	      get: () => obj.exposed
	    },
	    parent: {
	      configurable: true,
	      value: (_obj$parentComponentP = obj.parentComponentProxy) === null || _obj$parentComponentP === void 0 ? void 0 : _obj$parentComponentP.entity
	    },
	    component: {
	      configurable: true,
	      value: obj.tag
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
	    callHook: {
	      configurable: true,

	      value(h) {
	        callHook(h, obj.contextData);
	      }

	    },
	    setHook: {
	      configurable: true,

	      value(id, hook) {
	        return setHook(id, hook, obj.contextData);
	      }

	    },
	    on: {
	      configurable: true,
	      value: events.on
	    },
	    emit: {
	      configurable: true,
	      value: events.emit
	    }
	  };
	  const entity = Object.create(null, cfg);
	  return entity;
	}

	const disabledKey = new Set([':', '@', '#', '*', '!', '%', '^', '~', '&', '?', '+', '.', '(', ')', '[', ']', '{', '}', '<', '>']);

	function filter(k) {
	  if (typeof k !== 'string') {
	    return true;
	  }

	  if (disabledKey.has(k[0])) {
	    return false;
	  }

	  if (k.substr(0, 2) === 'n:') {
	    return false;
	  }

	  if (k.substr(0, 3) === 'on:') {
	    return false;
	  }

	  return true;
	}

	function update(proxy, props, children) {
	  const {
	    props: propsObj,
	    isNative
	  } = proxy;
	  const newKeys = new Set(Object.keys(props).filter(filter));

	  if (proxy.propsDefined) {
	    proxy.propsDefined.forEach(k => newKeys.add(k));

	    for (const k of Object.keys(propsObj)) {
	      if (filter(k) && !newKeys.has(k)) {
	        delete propsObj[k];
	      }
	    }

	    for (const k of newKeys) {
	      propsObj[k] = props[k];
	    }
	  } else {
	    let needRefresh = false;

	    for (const k of Object.keys(propsObj)) {
	      if (filter(k) && !newKeys.has(k)) {
	        needRefresh = true;
	        delete propsObj[k];
	      }
	    }

	    for (const k of newKeys) {
	      if (k in propsObj && [k] === props[k]) {
	        continue;
	      }

	      propsObj[k] = props[k];
	      needRefresh = true;
	    }

	    if (needRefresh) {
	      proxy.refresh();
	    }
	  }

	  proxy.events.updateInProps(props);
	  const slots = Object.create(null);
	  const childNodes = getSlots(proxy.renderer, children, slots, isNative);
	  setSlots(slots, proxy.slots, proxy.lastSlots);
	  proxy.lastSlots = slots;

	  if (!isNative) {
	    return;
	  }

	  proxy.nativeNodes = convert(proxy, childNodes, proxy.nativeNodes);

	  if (!proxy.mounted) {
	    return;
	  }

	  proxy.requestDraw();
	}

	class ComponentProxy extends CustomComponentProxy {
	  callHook(id) {
	    callHook(id, this.contextData);
	  }

	  constructor(originalTag, component, props, children, parent) {
	    super(originalTag, component, props, parent, false);

	    _defineProperty(this, "isNative", false);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    _defineProperty(this, "emit", void 0);

	    _defineProperty(this, "on", void 0);

	    _defineProperty(this, "components", Object.create(null));

	    _defineProperty(this, "props", void 0);

	    _defineProperty(this, "propsDefined", void 0);

	    _defineProperty(this, "slots", Object.create(null));

	    _defineProperty(this, "lastSlots", void 0);

	    _defineProperty(this, "nativeNodes", void 0);

	    _defineProperty(this, "_render", void 0);

	    _defineProperty(this, "_stopRender", void 0);

	    _defineProperty(this, "childNodes", []);

	    this.container = parent.container;
	    this.componentRoot = this;
	    const {
	      events
	    } = this;
	    this.emit = events.emit;
	    this.on = events.on;
	    Object.assign(this.components, component[componentsSymbol]);
	    const propsDefined = component[propsSymbol];

	    if (Array.isArray(propsDefined)) {
	      this.propsDefined = propsDefined;
	      this.props = createObject(propsDefined, null);
	    } else {
	      this.props = Object.create(null);
	    }

	    this._init();

	    this.callHook('beforeCreate');

	    this._update(props, children);

	    const context = {
	      by: createBy(this.contextData),
	      slot: createSlotApi(this.slots),
	      expose: t => this.setExposed(t),
	      childNodes: () => this.childNodes,
	      emit: this.emit
	    };

	    const {
	      render,
	      nodes,
	      stopRender
	    } = this._initRender(context);

	    this._render = render;
	    this._stopRender = stopRender;
	    this._nodes = convert(this, nodes);
	    this.callHook('created');
	    this.created = true;

	    if (this.needRefresh) {
	      this.refresh();
	    }
	  }

	  createEntity(events) {
	    return createEntity(this, events);
	  }

	  _update(props, children) {
	    if (this.destroyed) {
	      return;
	    }

	    this.childNodes = children;
	    delayRefresh(() => postpone(() => update(this, props, children)));
	  }

	  requestDraw() {
	    this.container.markDraw(this);
	  }

	}

	function getNodeArray$3(result) {
	  if (Array.isArray(result)) {
	    return result;
	  }

	  if (!isElement(result)) {
	    return [result];
	  }

	  if (result.tag !== Fragment) {
	    return [result];
	  }

	  return result.children;
	}

	function initRender(proxy, context) {
	  const {
	    tag,
	    props,
	    entity,
	    contextData
	  } = proxy;
	  const renderFn = tag[componentValueSymbol];
	  const renderNode = typeof renderFn !== 'function' ? () => createTemplateElement(...proxy.childNodes) :  () => runCurrentWithLabel(contextData, entity, l => proxy.labels = l, renderFn, props || {}, context);
	  const normalizeAuxiliaryObject = {
	    renderer: proxy.renderer,
	    refresh: f => proxy.refresh(f),
	    slotRenderFnList: new WeakMap(),
	    delivered: proxy.delivered,
	    simpleParent: proxy.entity
	  };
	  const components = proxy.tag[componentsSymbol];
	  const componentsList = components ? [components] : [];
	  const render = monitor(c => c && proxy.refresh(), () => init(normalizeAuxiliaryObject, getNodeArray$3(renderNode()), proxy.slots, componentsList, false, false));
	  return {
	    nodes: render(),
	    render,
	    stopRender: () => render.stop()
	  };
	}

	class RenderComponentProxy extends ComponentProxy {
	  constructor(...args) {
	    super(...args);

	    _defineProperty(this, "nativeNodes", void 0);

	    _defineProperty(this, "childNodes", []);
	  }

	  get content() {
	    return this.tree;
	  }

	  _init() {}

	  _initRender(context) {
	    return initRender(this, context);
	  }

	  requestDraw() {
	    this.container.markDraw(this);
	  }

	  _redraw(mountOptions) {
	    const {
	      renderer,
	      _nodes
	    } = this;
	    this.tree = draw(renderer, mountOptions, _nodes, this.tree);
	  }

	  _mount(mountOptions) {
	    const {
	      renderer,
	      _nodes
	    } = this;
	    this.tree = draw(renderer, mountOptions, _nodes);
	  }

	  _unmount() {
	    const {
	      renderer
	    } = this;
	    unmount(renderer, this.tree);
	  }

	}

	function createResponsiveRender(proxy, func, components) {
	  const slotRenderFns = new WeakMap();
	  const render = monitor(c => c && proxy.refresh(), () => normalize(proxy, slotRenderFns, f => proxy.refresh(f), func(), components));
	  return {
	    nodes: render(),
	    render,
	    stopRender: () => render.stop()
	  };
	}

	function initRender$1(proxy, context) {
	  const {
	    tag,
	    props,
	    entity,
	    contextData
	  } = proxy;
	  const run =  () => runCurrentWithLabel(contextData, entity, l => proxy.labels = l, tag, props, context);

	  const refresh = changed => {
	    if (!changed) {
	      return;
	    }

	    proxy.refresh();
	  };

	  const result = exec(refresh, {
	    resultOnly: true
	  }, run);

	  if (typeof result === 'function') {
	    return createResponsiveRender(proxy, result);
	  }

	  if (isRenderElement(result)) {
	    const {
	      children
	    } = result;

	    if ((children === null || children === void 0 ? void 0 : children.length) === 1 && typeof children[0] === 'function') {
	      return createResponsiveRender(proxy, children[0]);
	    }
	  }

	  if (isElement(result) && isRenderComponent(result.tag)) {
	    const {
	      tag
	    } = result;
	    const render = tag[componentValueSymbol];

	    if (typeof render === 'function') {
	      return createResponsiveRender(proxy, () => render(result.props || {}, context), result.tag[componentsSymbol] || null);
	    }
	  }

	  const normalizeRefresh = f => {
	    proxy.refresh(f);
	  };

	  const slotRenderFns = new WeakMap();
	  const render = monitor(refresh, () => normalize(proxy, slotRenderFns, normalizeRefresh, run()));
	  return {
	    nodes: exec(refresh, () => normalize(proxy, slotRenderFns, normalizeRefresh, result), {
	      resultOnly: true
	    }),
	    render,
	    stopRender: () => render.stop()
	  };
	}

	class StandardComponentProxy extends ComponentProxy {
	  constructor(...args) {
	    super(...args);

	    _defineProperty(this, "content", []);

	    _defineProperty(this, "native", void 0);

	    _defineProperty(this, "shadowTree", []);

	    _defineProperty(this, "nativeTree", []);

	    _defineProperty(this, "_shadow", void 0);

	    _defineProperty(this, "childNodes", []);

	    _defineProperty(this, "__nativeTreeNountOptions", void 0);
	  }

	  _init() {
	    var _this$renderer$create, _this$renderer;

	    {
	      defineProperty(this, 'content', []);
	    }

	    if (!isNativeComponent(this.tag)) {
	      return;
	    }

	    const value = (_this$renderer$create = (_this$renderer = this.renderer).createComponent) === null || _this$renderer$create === void 0 ? void 0 : _this$renderer$create.call(_this$renderer);

	    if (!value) {
	      return;
	    }

	    [this.native, this._shadow] = value;
	  }

	  _initRender(context) {
	    return initRender$1(this, context);
	  }

	  requestDraw() {
	    this.container.markDraw(this);
	  }

	  _mount(mountOptions) {
	    const {
	      nativeNodes,
	      renderer,
	      _shadow,
	      native,
	      _nodes
	    } = this;

	    if (!native || !nativeNodes || !_shadow) {
	      this.tree = this.content = draw(renderer, mountOptions, _nodes);
	      return;
	    }

	    this.tree = [createMountedNode({
	      node: native
	    })];
	    const subMountOptions = renderer.getMountOptions(_shadow, mountOptions) || mountOptions;
	    this.content = draw(renderer, subMountOptions, _nodes);

	    for (const it of getNodes(this.content)) {
	      renderer.insertNode(_shadow, it);
	    }

	    const nativeTreeNountOptions = renderer.getMountOptions(native, mountOptions) || mountOptions;
	    this.nativeTree = draw(renderer, nativeTreeNountOptions, nativeNodes);

	    for (const it of getNodes(this.nativeTree)) {
	      renderer.insertNode(native, it);
	    }

	    this.__nativeTreeNountOptions = nativeTreeNountOptions;
	    return subMountOptions;
	  }

	  _redraw(mountOptions) {
	    const {
	      nativeNodes,
	      renderer,
	      __nativeTreeNountOptions,
	      _nodes
	    } = this;
	    this.content = draw(renderer, mountOptions, _nodes, this.content);

	    if (!nativeNodes || !__nativeTreeNountOptions) {
	      this.tree = this.content;
	      return;
	    }

	    this.nativeTree = draw(renderer, __nativeTreeNountOptions, nativeNodes, this.nativeTree);
	  }

	  _unmount() {
	    const {
	      renderer,
	      nativeTree
	    } = this;
	    unmount(renderer, this.tree);

	    if (!nativeTree) {
	      return;
	    }

	    unmount(renderer, nativeTree);
	  }

	}

	const recognizers = [];
	function recognize(any) {
	  for (const recognizer of recognizers) {
	    const res = recognizer(any);

	    if (typeof res === 'function') {
	      return res;
	    }
	  }

	  return typeof any === 'function' ? any : null;
	}
	function addRecognizer(recognizer) {
	  recognizers.push(recognizer);
	}

	function createProxy(proxy, {
	  tag,
	  props,
	  children,
	  isDefault
	}) {
	  if (tag === Container) {
	    return new ContainerProxy(tag, null, props, children, proxy);
	  }

	  if (tag === ScopeSlot) {
	    return new SlotProxy(children, proxy, isDefault);
	  }

	  if (tag === Fragment) {
	    return new GroupProxy(tag, children, proxy);
	  }

	  if (typeof tag === 'string') {
	    if (tag.substr(0, 5) === 'core:') {
	      return new GroupProxy(tag, children, proxy);
	    }

	    return new ElementProxy(tag, tag, props || {}, children, proxy);
	  }

	  const componentTag = recognize(tag);

	  if (typeof componentTag !== 'function') {
	    return new GroupProxy(tag, children, proxy);
	  }

	  if (isShellComponent(componentTag)) {
	    return new ShellProxy(tag, componentTag, props || {}, children, proxy);
	  }

	  if (isDeliverComponent(componentTag)) {
	    return new DeliverProxy(tag, componentTag, props || {}, children, proxy);
	  }

	  if (isContainerComponent(componentTag)) {
	    return new ContainerProxy(tag, componentTag, props, children, proxy);
	  }

	  if (isElementComponent(componentTag)) {
	    return new ElementProxy(tag, componentTag, props || {}, children, proxy);
	  }

	  if (isSimpleComponent(componentTag)) {
	    return new GroupProxy(tag, children, proxy);
	  }

	  if (isRenderComponent(componentTag)) {
	    return new RenderComponentProxy(tag, componentTag, props || {}, children, proxy);
	  }

	  return new StandardComponentProxy(tag, componentTag, props || {}, children, proxy);
	}

	function createItem$1(proxy, source) {
	  if (!source) {
	    return null;
	  }

	  if (!source.tag) {
	    const {
	      key,
	      props
	    } = source;
	    return {
	      key,
	      props,
	      proxy: new ValueProxy(source.props || {}, proxy)
	    };
	  }

	  const {
	    tag,
	    key,
	    props
	  } = source;
	  return {
	    tag,
	    key,
	    props,
	    proxy: createProxy(proxy, source)
	  };
	}

	function createAll$1(proxy, source) {
	  if (!Array.isArray(source)) {
	    source = [source];
	  }

	  if (!source.length) {
	    return [];
	  }

	  return source.map(item => {
	    if (!Array.isArray(item)) {
	      return createItem$1(proxy, toElement(item));
	    }

	    return item.flat(Infinity).map(it => createItem$1(proxy, toElement(it))).filter(Boolean);
	  });
	}

	function destroy(tree) {
	  if (!tree) {
	    return;
	  }

	  if (Array.isArray(tree)) {
	    tree.forEach(t => destroy(t));
	    return;
	  }

	  const {
	    proxy
	  } = tree;

	  if (proxy) {
	    proxy.destroy();
	  }
	}

	function updateItem$1(proxy, source, tree) {
	  if (!tree) {
	    return createItem$1(proxy, source);
	  }

	  if (!source) {
	    destroy(tree);
	    return null;
	  }

	  if (Array.isArray(tree)) {
	    if (!tree.length) {
	      return createItem$1(proxy, source);
	    }

	    const index = tree.findIndex(it => it.tag === source.tag);

	    if (index < 0) {
	      destroy(tree);
	      return createItem$1(proxy, source);
	    }

	    const all = tree;
	    [tree] = tree.splice(index, 1);
	    destroy(all);
	  }

	  if (source.tag !== tree.tag) {
	    destroy(tree);
	    return createItem$1(proxy, source);
	  }

	  if (tree.proxy) {
	    const {
	      proxy
	    } = tree;
	    const {
	      props = {},
	      key
	    } = source;
	    proxy.update(source.props || {}, source.children || []);
	    return {
	      tag: tree.tag,
	      props,
	      key,
	      proxy
	    };
	  }

	  destroy(tree);
	  return createItem$1(proxy, source);
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

	function updateList$1(proxy, source, tree) {
	  if (!tree) {
	    tree = [];
	  }

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
	      const newNode = updateItem$1(proxy, node, tree[index]);

	      if (newNode) {
	        newList.push(newNode);
	      }

	      tree.splice(index, 1);
	    } else {
	      const newNode = createItem$1(proxy, node);

	      if (newNode) {
	        newList.push(newNode);
	      }
	    }
	  }

	  destroy(tree);
	  return newList;
	}

	function* updateAll$1(proxy, source, tree) {
	  if (!Array.isArray(source)) {
	    source = [source];
	  }

	  let index = 0;
	  let length = Math.min(source.length || 1, tree.length);

	  for (; index < length; index++) {
	    const src = source[index];

	    if (Array.isArray(src)) {
	      yield updateList$1(proxy, src, tree[index]);
	    } else {
	      yield updateItem$1(proxy, toElement(src), tree[index]);
	    }
	  }

	  length = Math.max(source.length, source.length);

	  if (tree.length > index) {
	    for (; index < length; index++) {
	      destroy(tree[index]);
	    }
	  }

	  if (source.length > index) {
	    for (; index < length; index++) {
	      const src = toElement(source[index]);

	      if (Array.isArray(src)) {
	        yield src.flat(Infinity).map(it => createItem$1(proxy, it)).filter(Boolean);
	      } else {
	        yield createItem$1(proxy, src);
	      }
	    }
	  }
	}

	function convert(proxy, source, tree) {
	  if (!tree) {
	    return delayRefresh(() => postpone(() => createAll$1(proxy, source)));
	  }

	  return delayRefresh(() => postpone(() => [...updateAll$1(proxy, source, tree)]));
	}

	let awaitDraw = new Set();
	const rendererDraw = new Set();
	const baseTick = [];
	const middleTick = [];
	const endTick = [];

	function execTickList(list) {
	  const execList = [...list].sort(([a], [b]) => b - a);
	  list.length = 0;

	  try {
	    execList.forEach(([, f]) => f());
	  } catch (e) {
	    printError(e);
	  }
	}

	function execContainerList() {
	  const list = [...awaitDraw];
	  awaitDraw.clear();
	  list.map(c => c.drawAll());
	}

	function execRendererDrawList() {
	  const rendererDrawList = [...rendererDraw];
	  rendererDraw.clear();

	  for (const f of rendererDrawList) {
	    try {
	      f();
	    } catch (e) {
	      printError(e);
	    }
	  }
	}

	let requested = false;

	function request() {
	  if (requested) {
	    return;
	  }

	  requested = true;
	  nextFrame(() => {
	    requested = false;
	    execTickList(baseTick);
	    execContainerList();
	    execTickList(middleTick);
	    execRendererDrawList();
	    execTickList(endTick);
	  });
	}

	function nextTick(fn, level = 0, type) {
	  const list = type === 'middle' ? middleTick : type === 'end' ? endTick : baseTick;
	  list.push([level, fn]);
	  request();
	}
	function markDraw(c) {
	  awaitDraw.add(c);
	  request();
	}
	function addRendererDraw(fn) {
	  rendererDraw.add(fn);
	  request();
	}

	function createEntity$1(obj, events) {
	  const cfg = {
	    data: {
	      configurable: true,
	      value: obj.data
	    },
	    exposed: {
	      configurable: true,
	      get: () => obj.exposed
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
	    callHook: {
	      configurable: true,

	      value(h) {
	        callHook(h, obj.contextData);
	      }

	    },
	    setHook: {
	      configurable: true,

	      value(id, hook) {
	        return setHook(id, hook, obj.contextData);
	      }

	    },
	    on: {
	      configurable: true,
	      value: events.on
	    },
	    emit: {
	      configurable: true,
	      value: events.emit
	    }
	  };
	  const entity = Object.create(null, cfg);
	  return entity;
	}

	class ContainerProxy extends RefProxy {
	  setmountedRoot(target, next) {
	    if (this.parentProxy) {
	      return;
	    }

	    const container = this.__container;

	    if (!container) {
	      return;
	    }

	    const {
	      renderer
	    } = this;
	    const [r, n] = renderer.getContainer(container, target, next);

	    if (!r) {
	      return;
	    }

	    for (const it of getNodes(this.tree)) {
	      renderer.insertNode(r, it, n);
	    }
	  }

	  constructor(originalTag, component = null, props = {}, children, parent) {
	    super(component ? getRender(component[rendererSymbol], parent === null || parent === void 0 ? void 0 : parent.renderer) : getRender(parent === null || parent === void 0 ? void 0 : parent.renderer), originalTag, component, props, parent);

	    _defineProperty(this, "container", void 0);

	    _defineProperty(this, "componentRoot", void 0);

	    _defineProperty(this, "__containerData", void 0);

	    _defineProperty(this, "content", []);

	    _defineProperty(this, "rootContainer", this);

	    _defineProperty(this, "contextData", void 0);

	    _defineProperty(this, "__nodes", []);

	    _defineProperty(this, "__container", null);

	    _defineProperty(this, "__placeholder", void 0);

	    _defineProperty(this, "__placeholderNode", void 0);

	    _defineProperty(this, "__targetNode", null);

	    _defineProperty(this, "__insertNode", null);

	    _defineProperty(this, "__nextNode", null);

	    _defineProperty(this, "__awaitDraw", new Set());

	    _defineProperty(this, "__containers", new Set());

	    this.container = this;
	    this.componentRoot = parent === null || parent === void 0 ? void 0 : parent.componentRoot;
	    this.contextData = {
	      hooks: {}
	    };

	    if (component) {
	      this.__containerData = component[componentValueSymbol];
	    }

	    {
	      defineProperty(this, 'content', []);
	    }

	    this.events.updateInProps(props);

	    if (parent) {
	      this.rootContainer = parent.container.rootContainer;
	    }

	    this.__nodes = convert(this, children);
	    this.created = true;
	  }

	  createEntity(events) {
	    return createEntity$1(this, events);
	  }

	  setChildren(children) {
	    if (this.destroyed) {
	      return;
	    }

	    this.__nodes = convert(this, children, this.__nodes);
	    this.requestDraw();
	  }

	  _update(props, children) {
	    if (this.destroyed) {
	      return;
	    }

	    this.__nodes = convert(this, children, this.__nodes);
	    this.events.updateInProps(props);
	    this.requestDraw();
	  }

	  _destroy() {
	    destroy(this.__nodes);
	  }

	  callHook(id) {
	    callHook(id, this.contextData);
	  }

	  requestDraw() {
	    this.markDraw(this);
	  }

	  _mount(opt) {
	    const {
	      parentProxy,
	      renderer
	    } = this;
	    const parentRenderer = (parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer) || renderer;
	    const {
	      container,
	      target: targetNode,
	      insert,
	      next,
	      exposed
	    } = renderer.mountContainer(this.__containerData, this.attrs, this.events.emit, parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer);
	    this.setExposed(exposed);
	    const subOpt = renderer.getMountOptions(container, opt) || opt;
	    const placeholder = drawPlaceholder(parentRenderer);
	    this.__placeholder = placeholder;
	    const placeholderNode = placeholder.node;
	    this.__placeholderNode = placeholderNode;
	    this.__container = container;
	    const content = draw(renderer, subOpt, this.__nodes);
	    this.content = content;
	    this.__insertNode = insert;
	    this.__nextNode = next;

	    if (!targetNode && parentRenderer === renderer) {
	      this.tree = insert ? [...content, createMountedNode({
	        node: insert
	      }), placeholder] : [...content, placeholder];
	      return subOpt;
	    }

	    const target = targetNode || container;
	    this.__targetNode = target;

	    for (const it of getNodes(content)) {
	      renderer.insertNode(target, it, next);
	    }

	    this.tree = insert ? [createMountedNode({
	      node: insert
	    }), placeholder] : [placeholder];
	    return subOpt;
	  }

	  _redrawSelf() {
	    const {
	      __targetNode,
	      __insertNode,
	      __nextNode
	    } = this;
	    const {
	      attrs,
	      parentProxy,
	      renderer
	    } = this;
	    const placeholder = this.__placeholder;
	    const placeholderNode = this.__placeholderNode;
	    const container = this.__container;
	    const parentRenderer = (parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer) || renderer;
	    const {
	      target: targetNode,
	      insert,
	      next
	    } = renderer.updateContainer(container, __targetNode, __insertNode, __nextNode, this.__containerData, attrs, this.events.emit, parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer);
	    this.__insertNode = insert;
	    this.__nextNode = next;
	    const parentNode = parentRenderer.getParent(placeholderNode);

	    if (insert !== __insertNode) {
	      if (__insertNode) {
	        renderer.removeNode(__insertNode);
	      }

	      if (insert && parentNode) {
	        renderer.insertNode(parentNode, insert, placeholderNode);
	      }
	    }

	    if (!targetNode && parentRenderer === renderer) {
	      const {
	        content
	      } = this;

	      if (__targetNode && parentNode) {
	        const nextNode = insert || placeholderNode;

	        for (const it of getNodes(content)) {
	          parentRenderer.insertNode(parentNode, it, nextNode);
	        }

	        this.__targetNode = null;
	      }

	      this.tree = insert ? [...content, createMountedNode({
	        node: insert
	      }), placeholder] : [...content, placeholder];
	    } else {
	      const target = targetNode || container;
	      this.__targetNode = target;

	      if (target !== __targetNode || next !== __nextNode) {
	        for (const it of getNodes(this.content)) {
	          renderer.insertNode(target, it, next);
	        }
	      }

	      this.tree = insert ? [createMountedNode({
	        node: insert
	      }), placeholder] : [placeholder];
	    }

	    renderer.recoveryContainer(container, __targetNode, __insertNode, __nextNode, targetNode, insert, next, this.__containerData, attrs, parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer);
	  }

	  _redrawChildren(opts) {
	    const content = draw(this.renderer, opts, this.__nodes, this.content);
	    this.content = content;

	    if (!this.__targetNode) {
	      return;
	    }

	    const placeholder = this.__placeholder;
	    const insertNode = this.__insertNode;
	    this.tree = insertNode ? [...content, createMountedNode({
	      node: insertNode
	    }), placeholder] : [...content, placeholder];
	  }

	  _redraw(opt) {
	    this._redrawChildren(opt);

	    this._redrawSelf();
	  }

	  _unmount() {
	    const {
	      parentProxy,
	      renderer,
	      __insertNode
	    } = this;
	    const parentRenderer = (parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer) || renderer;
	    unmount(this.renderer, this.content);

	    if (__insertNode) {
	      parentRenderer.removeNode(__insertNode);
	    }

	    parentRenderer.removeNode(this.__placeholderNode);
	    renderer.unmountContainer(this.__container, this.__targetNode, __insertNode, this.__nextNode, this.__containerData, this.attrs, parentProxy === null || parentProxy === void 0 ? void 0 : parentProxy.renderer);
	  }

	  markDraw(proxy) {
	    var _this$parentProxy;

	    if (((_this$parentProxy = this.parentProxy) === null || _this$parentProxy === void 0 ? void 0 : _this$parentProxy.renderer) === this.renderer) {
	      this.parentProxy.container.markDraw(proxy);
	      return;
	    }

	    if (proxy === this && this.parentProxy) {
	      this.parentProxy.container.markDraw(this);
	    } else {
	      this.__awaitDraw.add(proxy);
	    }

	    this.rootContainer.markDrawContainer(this);
	  }

	  drawContainer() {
	    if (this.destroyed || !this.__container) {
	      return;
	    }

	    const {
	      __awaitDraw
	    } = this;
	    const list = [...__awaitDraw];

	    __awaitDraw.clear();

	    list.map(c => c.redraw());
	  }

	  markDrawContainer(container) {
	    this.__containers.add(container);

	    markDraw(this);
	  }

	  drawAll() {
	    const containers = this.__containers;

	    if (!containers.size) {
	      return;
	    }

	    const list = [...containers];
	    containers.clear();
	    const completeList = [];
	    setCompleteList(completeList);
	    list.forEach(c => c.drawContainer());
	    completeList.forEach(r => r());
	  }

	}

	function createContainerEntity(e, p) {
	  if (e === undefined) {
	    return createRender(null, p);
	  }

	  if (isContainerComponent(e)) {
	    return createRender(e, p);
	  }

	  if (!isElement(e)) {
	    return createRender(null, p, [createElementBase(e)]);
	  }

	  if (isContainerComponent(e.tag)) {
	    const params = { ...e.props,
	      ...p
	    };
	    return createRender(e.tag, params);
	  }

	  return createRender(null, p, [e]);
	}

	function createRender(tag, props, childNodes = []) {
	  const children = value(childNodes);
	  const normalizeAuxiliaryObject = {
	    renderer: tag ? getRender(tag[rendererSymbol]) : getRender(),
	    refresh,
	    slotRenderFnList: new WeakMap(),
	    delivered: Object.create(null),
	    simpleParent: undefined
	  };
	  let __needRefresh = false;
	  let __refreshing = false;
	  let container;

	  function refresh() {
	    if (!container) {
	      __needRefresh = true;
	      return;
	    }

	    if (container.destroyed) {
	      return;
	    }

	    __needRefresh = true;

	    if (!container.created) {
	      return;
	    }

	    if (__refreshing) {
	      return;
	    }

	    __refreshing = true;
	    let nodes;

	    for (;;) {
	      if (wait$1(refreshObj)) {
	        break;
	      }

	      if (!__needRefresh) {
	        break;
	      }

	      __needRefresh = false;
	      nodes = _render();

	      if (container.destroyed) {
	        return;
	      }
	    }

	    __refreshing = false;

	    if (wait$1(refreshObj)) {
	      return;
	    }

	    if (!nodes) {
	      return;
	    }

	    if (!container.mounted) {
	      return;
	    }

	    if (container.destroyed) {
	      return;
	    }

	    if (container.unmounted) {
	      return;
	    }

	    container.setChildren(nodes);
	  }

	  const refreshObj = {
	    refresh
	  };
	  const slots = Object.create(null);

	  const _render = monitor(c => c && refresh(), () => init(normalizeAuxiliaryObject, children.value, slots, [], false, false));

	  container = new ContainerProxy(tag, tag, props, _render());

	  if (__needRefresh) {
	    refresh();
	  }

	  return [container, children];
	}

	function render(e, p = {}) {
	  const [container, children] = createContainerEntity(e, p);
	  const entity = Object.create(container.entity, {
	    update: {
	      configurable: true,

	      value(c) {
	        if (container.destroyed) {
	          return entity;
	        }

	        children(c === undefined ? [] : isElement(c) ? [c] : [createElementBase(c)]);
	        return entity;
	      }

	    },
	    mount: {
	      configurable: true,

	      value(target, next) {
	        if (container.destroyed) {
	          return entity;
	        }

	        if (container.mounted) {
	          return entity;
	        }

	        container.mount({});
	        container.setmountedRoot(target, next);
	        return entity;
	      }

	    },
	    unmount: {
	      configurable: true,

	      value() {
	        if (!container.mounted) {
	          return;
	        }

	        if (container.unmounted) {
	          return;
	        }

	        if (!container.destroyed) {
	          container.destroy();
	        }

	        container.unmount();
	        return entity;
	      }

	    }
	  });

	  {
	    devtools.renderHook(entity, container);
	  }

	  return entity;
	}

	function setObjectType(component, type) {
	  Reflect.defineProperty(component, objectTypeSymbol, {
	    value: type
	  });
	  return component;
	}

	function setName(component, name) {
	  if (!name || typeof name !== 'string') {
	    return component;
	  }

	  Reflect.defineProperty(component, nameSymbol, {
	    value: name
	  });
	  return component;
	}

	function setValue(component, value) {
	  Reflect.defineProperty(component, componentValueSymbol, {
	    value
	  });
	  return component;
	}

	function setComponents(component, components) {
	  if (!components || typeof components !== 'object') {
	    return component;
	  }

	  Reflect.defineProperty(component, componentsSymbol, {
	    value: components
	  });
	  return component;
	}

	function createSelfComponent() {
	  const component = function component(params) {
	    return createElementBase(component, params);
	  };

	  return component;
	}

	function createDeliverComponent(def) {
	  const component = createSelfComponent();
	  setObjectType(component, objectTypeSymbolDeliverComponent);
	  Reflect.defineProperty(component, deliverKeySymbol, {
	    value: Symbol()
	  });
	  Reflect.defineProperty(component, deliverDefaultSymbol, {
	    value: def
	  });
	  return component;
	}
	function createRenderComponent(f, {
	  name,
	  components
	} = {}) {
	  const component = createSelfComponent();
	  setObjectType(component, objectTypeSymbolRenderComponent);
	  setName(component, name);
	  setValue(component, f);
	  setComponents(component, components);
	  return component;
	}
	function createContainerComponent(value, {
	  name,
	  renderer
	} = {}) {
	  const component = createSelfComponent();
	  setObjectType(component, objectTypeSymbolContainerComponent);
	  setName(component, name);
	  setValue(component, value);

	  if (typeof renderer === 'string' || typeof renderer === 'object') {
	    Reflect.defineProperty(component, rendererSymbol, {
	      value: renderer
	    });
	  }

	  return component;
	}
	function createElementComponent(value, {
	  name
	} = {}) {
	  const component = createSelfComponent();
	  setObjectType(component, objectTypeSymbolElementComponent);
	  setName(component, name);
	  setValue(component, value);
	  return component;
	}
	function createStandardComponent(f, {
	  name,
	  components,
	  render,
	  props
	} = {}) {
	  const component = createComponentFunc(f, render);
	  setName(component, name);
	  setComponents(component, components);

	  if (Array.isArray(props)) {
	    Reflect.defineProperty(component, propsSymbol, {
	      value: [...props]
	    });
	  }

	  return component;
	}

	function createComponentFunc(f, render) {
	  if (typeof render !== 'function') {
	    return f;
	  }

	  const renderComponent = isRenderComponent(render) ? render : createRenderComponent(render);
	  return function StandardComponent(props, context) {
	    return createElementBase(renderComponent, f(props, context));
	  };
	}

	function createNativeComponent(f, {
	  name,
	  components,
	  render,
	  props
	} = {}) {
	  const component = createComponentFunc(f, render);
	  setObjectType(component, objectTypeSymbolNativeComponent);
	  setName(component, name);
	  setComponents(component, components);

	  if (Array.isArray(props)) {
	    Reflect.defineProperty(component, propsSymbol, {
	      value: [...props]
	    });
	  }

	  return component;
	}
	function createSimpleComponent(f, {
	  name,
	  components
	} = {}) {
	  const component = f;
	  setObjectType(component, objectTypeSymbolSimpleComponent);
	  setName(component, name);
	  setComponents(component, components);
	  return component;
	}
	function createShellComponent(f, {
	  name
	} = {}) {
	  const component = f;
	  setObjectType(component, objectTypeSymbolShellComponent);
	  setName(component, name);
	  return component;
	}

	function isProxy(v, type) {
	  switch (type) {
	    case 'standardComponent':
	      return v instanceof StandardComponentProxy;

	    case 'renderComponent':
	      return v instanceof RenderComponentProxy;

	    case 'component':
	      return v instanceof ComponentProxy;

	    case 'container':
	      return v instanceof ContainerProxy;

	    case 'deliver':
	      return v instanceof DeliverProxy;

	    case 'element':
	      return v instanceof ElementProxy;

	    case 'group':
	      return v instanceof GroupProxy;

	    case 'shell':
	      return v instanceof ShellProxy;

	    case 'value':
	      return v instanceof ValueProxy;

	    case 'slot':
	      return v instanceof SlotProxy;

	    case 'node':
	      return v instanceof NodeProxy;

	    case 'ref':
	      return v instanceof RefProxy;
	  }

	  return v instanceof BaseProxy;
	}

	function createElement$1(tag, attrs, ...children) {
	  const attrProps = attrs ? { ...attrs
	  } : {};
	  const props = {};

	  for (const n of Object.keys(attrProps)) {
	    if (n === '@') {
	      props['n:on'] = attrProps[n];
	      continue;
	    }

	    if (n[0] === '!') {
	      props[`n:${n.substr(1)}`] = attrProps[n];
	      continue;
	    }

	    if (n[0] === '@') {
	      props[`on:${n.substr(1)}`] = attrProps[n];
	      continue;
	    }

	    if (n.substr(0, 2) === 'n-') {
	      props[`n:${n.substr(2)}`] = attrProps[n];
	      continue;
	    }

	    if (n.substr(0, 3) === 'on-') {
	      const fn = attrProps[n];

	      if (typeof fn === 'function' || fn === null || fn === undefined) {
	        props[`on:${n.substr(3)}`] = fn;
	      }

	      continue;
	    }

	    if (n.substr(0, 5) === 'hook-') {
	      const fn = attrProps[n];

	      if (typeof fn === 'function' || fn === null || fn === undefined) {
	        props[`hook:${n.substr(5)}`] = fn;
	      }

	      continue;
	    }

	    if (n.substr(0, 5) === 'data-') {
	      props[`data:${n.substr(5)}`] = attrProps[n];
	    }

	    props[n] = attrProps[n];
	  }

	  return createElementBase(tag, props, ...children);
	}

	const useValue = createUse({
	  name: 'useValue',
	  create: fn => typeof fn === 'function' ? fn() : value(undefined)
	});

	function createEntitySetRef(set) {
	  return function refValue(_0, _1, entity, state) {
	    if (state === true) {
	      set.add(entity);
	      return;
	    }

	    if (state === false) {
	      set.delete(entity);
	    }
	  };
	}

	function createExposedSetRef(set) {
	  return function refValue(newNode, oldNode) {
	    if (newNode === undefined) {
	      if (oldNode !== undefined) {
	        set.delete(oldNode);
	      }

	      return;
	    }

	    if (oldNode === undefined) {
	      set.add(newNode);
	      return;
	    }

	    if (typeof set.replace === 'function') {
	      set.replace(newNode, oldNode);
	      return;
	    }

	    set.delete(oldNode);
	    set.add(newNode);
	  };
	}

	function createEntityRefValue(watch) {
	  const obj = watch ? value(undefined) : {
	    value: undefined
	  };

	  function refValue(_1, _2, entity, state) {
	    obj.value = state === false ? entity : undefined;
	  }

	  Reflect.defineProperty(refValue, 'value', {
	    get() {
	      return obj.value;
	    },

	    enumerable: true,
	    configurable: true
	  });
	  return refValue;
	}

	function createExposedRefValue(watch) {
	  const obj = watch ? value(undefined) : {
	    value: undefined
	  };

	  function refValue(newNode) {
	    obj.value = newNode;
	  }

	  Reflect.defineProperty(refValue, 'value', {
	    get() {
	      return obj.value;
	    },

	    enumerable: true,
	    configurable: true
	  });
	  return refValue;
	}

	function ref(set, isEntity) {
	  if (set && (typeof set === 'function' || typeof set === 'object')) {
	    return isEntity ? createEntitySetRef(set) : createExposedSetRef(set);
	  }

	  return isEntity ? createEntityRefValue(set) : createExposedRefValue(set);
	}

	const LOADING = 0;
	const FAILING = -1;
	const COMPLETE = 1;
	function lazy(component, Placeholder) {
	  const reslut = value(LOADING);
	  let isLoad = false;
	  const ComponentValue = value(undefined);

	  async function load() {
	    if (isLoad) {
	      return;
	    }

	    isLoad = true;

	    if (reslut()) {
	      return;
	    }

	    reslut(COMPLETE);

	    try {
	      const c = await component();

	      if (typeof c === 'function') {
	        ComponentValue(c);
	        return;
	      }

	      if (!c) {
	        reslut(FAILING);
	        return;
	      }

	      if (typeof c.default === 'function') {
	        ComponentValue(c.default);
	        return;
	      }

	      reslut(FAILING);
	    } catch (e) {
	      console.error(e);
	      reslut(FAILING);
	    }
	  }

	  return createSimpleComponent((props, {
	    childNodes
	  }) => {
	    const com = ComponentValue();

	    if (com) {
	      return createElement$1(com, props, ...childNodes());
	    }

	    load();

	    if (!Placeholder) {
	      return null;
	    }

	    return createElement$1(Placeholder, {
	      loading: reslut() === LOADING
	    });
	  }, {
	    name: 'Lazy'
	  });
	}

	function createRenderElement(render, {
	  slot,
	  key
	} = {}) {
	  const node = {
	    [objectTypeSymbol]: objectTypeSymbolElement,
	    tag: Render,
	    props: {
	      'n:key': key,
	      'n:slot': slot
	    },
	    children: [render],
	    key,
	    slot
	  };
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

	  if (tag === Template) {
	    return elements(node.children, opt);
	  }

	  if (!isSimpleComponent(tag)) {
	    return [node];
	  }

	  const {
	    simple
	  } = opt;

	  if (Array.isArray(simple)) {
	    if (simple.includes(tag)) {
	      return [node];
	    }
	  } else if (typeof simple === 'function') {
	    if (simple(tag)) {
	      return [node];
	    }
	  } else if (simple) {
	    return [node];
	  }

	  return elements(node.children, opt);
	}

	function isFragmentElement(v) {
	  if (!isElement(v)) {
	    return false;
	  }

	  const {
	    tag
	  } = v;

	  if (typeof tag !== 'string') {
	    return false;
	  }

	  return tag.toLowerCase() === 'template';
	}

	function isSimpleElement(v) {
	  return isElement(v) && isSimpleComponent(v.tag);
	}

	const withAncestor = createWith({
	  name: 'withAncestor',
	  create: () => withParent(),

	  exec(entity, _, component, depth = 0) {
	    for (let d = depth + 1; entity && d > 0; d--) {
	      if (entity.component === component) {
	        return entity;
	      }

	      entity = entity.parent;
	    }
	  }

	});



	var Neep = /*#__PURE__*/Object.freeze({
		__proto__: null,
		install: install,
		Error: NeepError,
		render: render,
		register: register,
		getNode: getNode,
		createDeliverComponent: createDeliverComponent,
		createRenderComponent: createRenderComponent,
		createContainerComponent: createContainerComponent,
		createElementComponent: createElementComponent,
		createStandardComponent: createStandardComponent,
		createNativeComponent: createNativeComponent,
		createSimpleComponent: createSimpleComponent,
		createShellComponent: createShellComponent,
		createComponent: createStandardComponent,
		isSimpleComponent: isSimpleComponent,
		isShellComponent: isShellComponent,
		isNativeComponent: isNativeComponent,
		isRenderComponent: isRenderComponent,
		isContainerComponent: isContainerComponent,
		isElementComponent: isElementComponent,
		isDeliverComponent: isDeliverComponent,
		isDeliver: isDeliverComponent,
		version: version,
		isProduction: isProduction,
		ScopeSlot: ScopeSlot,
		Render: Render,
		Slot: Slot,
		Container: Container,
		Template: Template,
		Fragment: Fragment,
		rendererSymbol: rendererSymbol,
		nameSymbol: nameSymbol,
		componentsSymbol: componentsSymbol,
		propsSymbol: propsSymbol,
		componentValueSymbol: componentValueSymbol,
		objectTypeSymbol: objectTypeSymbol,
		objectTypeSymbolElement: objectTypeSymbolElement,
		objectTypeSymbolDeliverComponent: objectTypeSymbolDeliverComponent,
		objectTypeSymbolNativeComponent: objectTypeSymbolNativeComponent,
		objectTypeSymbolSimpleComponent: objectTypeSymbolSimpleComponent,
		objectTypeSymbolShellComponent: objectTypeSymbolShellComponent,
		objectTypeSymbolRenderComponent: objectTypeSymbolRenderComponent,
		objectTypeSymbolContainerComponent: objectTypeSymbolContainerComponent,
		objectTypeSymbolElementComponent: objectTypeSymbolElementComponent,
		objectTypeSymbolRootEntity: objectTypeSymbolRootEntity,
		deliverKeySymbol: deliverKeySymbol,
		deliverDefaultSymbol: deliverDefaultSymbol,
		value: value,
		computed: computed,
		isValue: isValue,
		encase: encase,
		valueify: valueify,
		asValue: asValue,
		mixValue: mixValue,
		defineProperty: defineProperty,
		withWatch: withWatch,
		withHook: withHook,
		withDelivered: withDelivered,
		withRefresh: withRefresh,
		withParent: withParent,
		withChildren: withChildren,
		withCallback: withCallback,
		createElementBase: createElementBase,
		createTemplateElement: createTemplateElement,
		equal: equal$1,
		isElement: isElement,
		isRenderElement: isRenderElement,
		withLabel: withLabel,
		delayRefresh: delayRefresh,
		nextTick: nextTick,
		addRendererDraw: addRendererDraw,
		addRecognizer: addRecognizer,
		isProxy: isProxy,
		createUse: createUse,
		createWith: createWith,
		createElement: createElement$1,
		useValue: useValue,
		ref: ref,
		lazy: lazy,
		createRenderElement: createRenderElement,
		elements: elements,
		isFragmentElement: isFragmentElement,
		isSimpleElement: isSimpleElement,
		withAncestor: withAncestor
	});

	function installNeep(renderer) {
	  install({
	    renderer
	  });
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

	const PropsMap = new WeakMap();
	function updateId(props, el) {
	  const old = PropsMap.get(el);
	  const id = getId(isValue(props.id) ? props.id() : props.id);
	  PropsMap.set(el, id);

	  if (id !== old) {
	    if (typeof id === 'string') {
	      el.id = id;
	    } else {
	      el.removeAttribute('id');
	    }
	  }
	}

	function* recursive2iterable$1(list) {
	  if (isValue(list)) {
	    yield* recursive2iterable$1(list());
	    return;
	  }

	  if (!Array.isArray(list)) {
	    yield list;
	    return;
	  }

	  for (const it of list) {
	    yield* recursive2iterable$1(it);
	  }
	}

	function getClass(list) {
	  const set = new Set();

	  for (const v of recursive2iterable$1(list)) {
	    if (!v) {
	      continue;
	    }

	    if (typeof v === 'string') {
	      for (let k of v.split(' ').filter(Boolean)) {
	        set.add(k);
	      }
	    } else if (typeof v === 'object') {
	      for (const k in v) {
	        let add = v[k];

	        if (isValue(add)) {
	          add = add.value;
	        }

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

	function update$1(el, classes, oClasses) {
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

	const PropsMap$1 = new WeakMap();
	function updateClass(props, el) {
	  const old = PropsMap$1.get(el);
	  const classes = getClass(isValue(props.class) ? props.class() : props.class);
	  update$1(el, classes, old);
	  PropsMap$1.set(el, classes);
	}

	const unit = {
	  'width': 'px',
	  'height': 'px',
	  'top': 'px',
	  'right': 'px',
	  'bottom': 'px',
	  'left': 'px',
	  'border': 'px',
	  'border-top': 'px',
	  'border-right': 'px',
	  'border-left': 'px',
	  'border-bottom': 'px',
	  'border-width': 'px',
	  'border-top-width': 'px',
	  'border-right-width': 'px',
	  'border-left-width': 'px',
	  'border-bottom-width': 'px',
	  'border-radius': 'px',
	  'border-top-left-radius': 'px',
	  'border-top-right-radius': 'px',
	  'border-bottom-left-radius': 'px',
	  'border-bottom-right-radius': 'px',
	  'padding': 'px',
	  'padding-top': 'px',
	  'padding-right': 'px',
	  'padding-left': 'px',
	  'padding-bottom': 'px',
	  'margin': 'px',
	  'margin-top': 'px',
	  'margin-right': 'px',
	  'margin-left': 'px',
	  'margin-bottom': 'px'
	};

	function getStyle(style) {
	  if (isValue(style)) {
	    style = style();
	  }

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

	    if (isValue(value)) {
	      value = value();
	    }

	    const key = k.substr(0, 2) === '--' ? k : k.replace(/[A-Z]/g, '-$1').replace(/-+/g, '-').toLowerCase();

	    if (typeof value === 'number') {
	      const str = value && k in unit ? `${value}${unit[k]}` : `${value}`;
	      css[key] = [str, undefined];
	    } else if (value && typeof value === 'string') {
	      const v = value.replace(/!important\s*$/, '');
	      css[key] = [v, v === value ? undefined : 'important'];
	    }
	  }

	  return css;
	}

	function update$2(css, style, oStyle) {
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

	const PropsMap$2 = new WeakMap();
	function updateStyle(props, el, css, hasStyle) {
	  if (!hasStyle) {
	    return undefined;
	  }

	  const old = PropsMap$2.get(el);
	  const style = getStyle(isValue(props.style) ? props.style() : props.style);
	  update$2(css, style, old);
	  PropsMap$2.set(el, style);
	  return style;
	}

	function setAttrs(el, attrs) {
	  if (el instanceof HTMLInputElement && 'checked' in attrs) {
	    switch (el.type.toLowerCase()) {
	      case 'checkbox':
	      case 'radio':
	        if (attrs.checked !== null !== el.checked) {
	          el.checked = attrs.checked !== null;
	        }

	    }
	  }

	  if ((el instanceof HTMLSelectElement || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) && 'value' in attrs) {
	    const value = attrs.value || '';

	    if (el.value !== value) {
	      el.value = value;
	    }
	  }

	  if (el instanceof HTMLDetailsElement && 'open' in attrs) {
	    const value = attrs.open !== null;

	    if (el.open !== value) {
	      el.open = value;
	    }
	  }

	  if (el instanceof HTMLMediaElement) {
	    if ('muted' in attrs) {
	      const value = attrs.muted !== null;

	      if (el.muted !== value) {
	        el.muted = value;
	      }
	    }

	    if ('paused' in attrs) {
	      const value = attrs.paused !== null;

	      if (el.paused !== value) {
	        if (value) {
	          el.pause();
	        } else {
	          el.play();
	        }
	      }
	    }

	    if ('currentTime' in attrs) {
	      const value = attrs.currentTime;

	      if (value && /^\d+(\.\d+)?$/.test(value)) {
	        const num = Number(value);

	        if (el.currentTime !== num) {
	          el.currentTime = num;
	        }
	      }
	    }

	    if ('playbackRate' in attrs) {
	      const value = attrs.playbackRate;

	      if (value && /^\d+(\.\d+)?$/.test(value)) {
	        const num = Number(value);

	        if (el.playbackRate !== num) {
	          el.playbackRate = num;
	        }
	      }
	    }

	    if ('volume' in attrs) {
	      const value = attrs.volume;

	      if (value && /^\d+(\.\d+)?$/.test(value)) {
	        const num = Number(value);

	        if (el.volume !== num) {
	          el.volume = num;
	        }
	      }
	    }
	  }
	}

	function stringify(data, isOn = false) {
	  if (data === undefined || data === null) {
	    return data;
	  }

	  if (isOn && typeof data === 'function') {
	    return undefined;
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

	function getAttrs(props, hasStyle) {
	  const attrs = Object.create(null);

	  for (const k in props) {
	    if (/^(n|on|bind|slot)[:-]/.test(k)) {
	      continue;
	    }

	    if (!/^[a-zA-Z:_][a-zA-Z0-9:_-]*$/.test(k)) {
	      continue;
	    }

	    const name = k.toLowerCase();

	    switch (name) {
	      case 'style':
	        if (!hasStyle) {
	          break;
	        }

	      case 'ref':
	      case 'is':
	      case 'id':
	      case 'class':
	        continue;
	    }

	    let data = props[k];

	    if (isValue(data)) {
	      data = data();
	    }

	    const value = stringify(data, name.substr(0, 2) === 'on');

	    if (value !== undefined) {
	      attrs[name] = value;
	    }
	  }

	  return attrs;
	}

	function update$3(el, attrs, old) {
	  for (const k of Object.keys(attrs)) {
	    const v = attrs[k];

	    if (!(k in old) || old[k] !== v) {
	      if (v === null) {
	        el.removeAttribute(k);
	      } else {
	        el.setAttribute(k, v);
	      }
	    }
	  }

	  for (const k of Object.keys(old)) {
	    if (!(k in attrs)) {
	      el.removeAttribute(k);
	    }
	  }
	}

	const PropsMap$3 = new WeakMap();
	function updateAttrs(props, el, hasStyle) {
	  const old = PropsMap$3.get(el) || {};
	  const attrs = getAttrs(props, hasStyle);
	  update$3(el, attrs, old);
	  setAttrs(el, attrs);
	  PropsMap$3.set(el, attrs);
	}

	function* getElementModel(el) {
	  if (el instanceof HTMLInputElement) {
	    switch (el.type.toLowerCase()) {
	      case 'checkbox':
	        yield ['indeterminate', 'change', e => e.currentTarget.indeterminate];
	        return yield ['checked', 'change', e => e.currentTarget.checked];

	      case 'radio':
	        return yield ['checked', 'change', e => e.currentTarget.checked];
	    }

	    return yield ['value', 'input', e => e.currentTarget.value];
	  }

	  if (el instanceof HTMLTextAreaElement) {
	    return yield ['value', 'input', e => e.currentTarget.value];
	  }

	  if (el instanceof HTMLSelectElement) {
	    return yield ['value', 'change', e => e.currentTarget.value];
	  }

	  if (el instanceof HTMLDetailsElement) {
	    return yield ['open', 'toggle', e => e.currentTarget.open];
	  }

	  if (el instanceof HTMLMediaElement) {
	    yield ['currentTime', 'timeupdate', e => e.currentTarget.currentTime];
	    yield ['playbackRate', 'ratechange', e => e.currentTarget.playbackRate];
	    yield ['volume', 'volumechange', e => e.currentTarget.volume];
	    yield ['muted', 'volumechange', e => e.currentTarget.muted];
	    yield ['paused', 'playing', e => e.currentTarget.paused];
	    return yield ['paused', 'pause', e => e.currentTarget.paused];
	  }
	}

	const ValueEventMap = new WeakMap();

	function getValueEventBind(el) {
	  let list = ValueEventMap.get(el);

	  if (list) {
	    return list;
	  }

	  list = Object.create(null);
	  ValueEventMap.set(el, list);
	  return list;
	}

	const bindMap = new WeakMap();

	function getEventBind(el) {
	  let list = bindMap.get(el);

	  if (list) {
	    return list;
	  }

	  list = Object.create(null);
	  bindMap.set(el, list);
	  return list;
	}

	function updateEvent(props, el, emit) {
	  const valueEventMap = getValueEventBind(el);

	  for (const [prop, name, t] of getElementModel(el)) {
	    const value = props[prop];
	    const item = valueEventMap[prop];

	    if (item && item[0] === value) {
	      continue;
	    }

	    if (item) {
	      item[1]();
	    }

	    if (!isValue(value)) {
	      continue;
	    }

	    const f = e => {
	      value(t(e));
	    };

	    el.addEventListener(name, f);
	    valueEventMap[name] = [value, () => el.removeEventListener(name, f)];
	  }

	  const names = new Set(emit.names.map(String));
	  const eventBind = getEventBind(el);

	  for (const k of Object.keys(eventBind)) {
	    if (names.has(k)) {
	      continue;
	    }

	    eventBind[k]();
	    delete eventBind[k];
	  }

	  for (const k of names) {
	    if (k in eventBind) {
	      continue;
	    }

	    const f = p => emit(k, p);

	    el.addEventListener(k, f);

	    eventBind[k] = () => {
	      el.removeEventListener(k, f);
	    };
	  }
	}

	function updateProps(renderer, el, props, emit) {
	  const css = el.style;
	  const hasStyle = css instanceof CSSStyleDeclaration;
	  updateId(props, el);
	  updateClass(props, el);
	  updateAttrs(props, el, hasStyle);
	  updateStyle(props, el, css, hasStyle);
	  updateEvent(props, el, emit);
	  return el;
	}

	function nextFrame$1(f) {
	  window.requestAnimationFrame(f);
	}

	function getTarget(renderer, container, target, parent) {
	  if (isValue(target)) {
	    target = target.value;
	  }

	  if (target === null) {
	    return {
	      target: container,
	      insert: null,
	      next: null
	    };
	  }

	  if (typeof target === 'string') {
	    target = document.querySelector(target);
	  }

	  if (target instanceof Element) {
	    return {
	      target,
	      insert: null,
	      next: null
	    };
	  }

	  return {
	    target: null,
	    insert: null,
	    next: null
	  };
	}

	function mountContainer(renderer, element, {
	  target: targetProps,
	  ...props
	}, emit, parent) {
	  const container = createElement('div');
	  updateProps(renderer, container, (element === null || element === void 0 ? void 0 : element.props) || props, emit);
	  return { ...getTarget(renderer, container, targetProps),
	    container,
	    exposed: null
	  };
	}

	function unmountContainer(renderer, container, node) {
	  if (node === null) {
	    container.remove();
	  }
	}

	function updateContainer(renderer, container, element, {
	  target,
	  ...props
	}, emit, parent) {
	  updateProps(renderer, container, (element === null || element === void 0 ? void 0 : element.props) || props, emit);
	  return getTarget(renderer, container, target);
	}

	function removeNode(renderer, node) {
	  const p = renderer.getParent(node);

	  if (!p) {
	    return;
	  }

	  p.removeChild(node);
	}

	function getContainer(renderer, container, target, next) {
	  if (typeof target === 'string') {
	    target = document.querySelector(target);
	  }

	  if (target === null) {
	    return [null, null];
	  }

	  if (!(target instanceof Element)) {
	    target = document.body;
	  }

	  if (typeof next === 'string') {
	    next = document.querySelector(next);
	  }

	  if (!(next instanceof Element) || next.parentElement !== target) {
	    next = null;
	  }

	  return [target, next];
	}

	const renderer = {
	  type: 'html',
	  nextFrame: nextFrame$1,

	  isNode(v) {
	    return v instanceof Node;
	  },

	  getContainer(container, target, next) {
	    return getContainer(this, container, target, next);
	  },

	  mountContainer(data, props, emit, parent) {
	    return mountContainer(this, data, props, emit);
	  },

	  updateContainer(container, target, insert, next, data, props, emit, parent) {
	    return updateContainer(this, container, data, props, emit);
	  },

	  recoveryContainer() {},

	  unmountContainer(container, data, props, parent) {
	    return unmountContainer(this, container, data);
	  },

	  getMountOptions() {},

	  createElement(data) {
	    if (!data || typeof data !== 'string') {
	      return null;
	    }

	    return createElement(data);
	  },

	  createText(text) {
	    return createText(text);
	  },

	  createPlaceholder() {
	    return createPlaceholder();
	  },

	  createComponent() {
	    return createComponent();
	  },

	  getParent(node) {
	    return getParent(node);
	  },

	  nextNode(node) {
	    return node.nextSibling;
	  },

	  updateProps(node, data, props, emit) {
	    updateProps(this, node, props, emit);
	  },

	  insertNode(parent, node, next = null) {
	    return insertNode(parent, node, next);
	  },

	  removeNode(node) {
	    return removeNode(this, node);
	  }

	};

	let Container$1;
	function initContainer() {
	  Container$1 = createContainerComponent(createElement$1(''), {
	    renderer,
	    name: '[HTML]'
	  });
	}

	function init$1() {
	  initContainer();
	}

	installNeep(renderer);
	init$1();

	var Compute = Neep.createComponent(props => {
	  const a = Neep.value(1);
	  const b = Neep.value(2);
	  const c1 = Neep.computed(() => a + b);
	  const c2 = Neep.computed(() => a.value + b.value);
	  const c3 = Neep.computed(() => Number(a) + Number(b));
	  const c4 = Neep.computed(() => Number(a.value) + Number(b.value));
	  return Neep.createRenderElement(() => Neep.createElement(Neep.Template, null, "\u8BA1\u7B97", Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c1), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c2), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c3), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c4)));
	}, {
	  name: 'Compute'
	});

	var Compute2 = Neep.createComponent(() => {
	  const a = Neep.useValue();
	  const b = Neep.useValue();
	  const c1 = Neep.useValue(() => Neep.computed(() => a + b));
	  const c2 = Neep.useValue(() => Neep.computed(() => a.value + b.value));
	  const c3 = Neep.useValue(() => Neep.computed(() => Number(a) + Number(b)));
	  const c4 = Neep.useValue(() => Neep.computed(() => Number(a.value) + Number(b.value)));
	  return Neep.createElement(Neep.Template, null, "\u8BA1\u7B97", Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c1), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c2), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c3), Neep.createElement("div", null, Neep.createElement("input", {
	    value: a
	  }), "+", Neep.createElement("input", {
	    value: b
	  }), "=", c4));
	}, {
	  name: 'Compute2'
	});

	var Sync = Neep.createComponent(props => {
	  const inputValue = Neep.value('');
	  const checked = Neep.value(false);

	  const ref = x => console.log('Ref', 'B', x);

	  return Neep.createRenderElement(() => Neep.createElement(Neep.Template, null, "\u540C\u6B65\u7684\u8F93\u5165\u6846\u53CA\u663E\u793A", Neep.createElement("div", null, Neep.createElement("input", {
	    ref: ref,
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: "width: 100%"
	  })), Neep.createElement("div", null, Neep.createElement("input", {
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: {
	      width: '100%'
	    }
	  })), Neep.createElement("div", null, Neep.createElement("input", {
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: {
	      width: '100%'
	    }
	  })), Neep.createElement("div", {
	    ref: ref
	  }, "[", checked, "]", inputValue)));
	}, {
	  name: 'Sync'
	});

	var Sync2 = Neep.createComponent(() => {
	  const inputValue = Neep.useValue();
	  const checked = Neep.useValue();
	  return Neep.createElement(Neep.Template, null, "\u540C\u6B65\u7684\u8F93\u5165\u6846\u53CA\u663E\u793A", Neep.createElement("div", null, Neep.createElement("input", {
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: "width: 100%"
	  })), Neep.createElement("div", null, Neep.createElement("input", {
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: {
	      width: '100%'
	    }
	  })), Neep.createElement("div", null, Neep.createElement("input", {
	    type: "checkbox",
	    checked: checked
	  }), Neep.createElement("input", {
	    value: inputValue,
	    style: {
	      width: '100%'
	    }
	  })), Neep.createElement("div", null, "[", checked, "]", inputValue));
	}, {
	  name: 'Sync2'
	});

	const DeliverValue = Neep.createDeliverComponent(Neep.value(0));
	const DeliverNumber = Neep.createDeliverComponent(0);

	var B = Neep.createComponent((props, {
	  slot,
	  emit
	}) => {
	  Neep.withHook('beforeCreate', () => console.log('Hook', 'B', 'beforeCreate'), true);
	  Neep.withHook('created', () => console.log('Hook', 'B', 'created'), true);
	  Neep.withHook('beforeMount', () => console.log('Hook', 'B', 'beforeMount'), true);
	  Neep.withHook('mounted', () => console.log('Hook', 'B', 'mounted'), true);
	  Neep.withHook('beforeUpdate', () => console.log('Hook', 'B', 'beforeUpdate'), true);
	  Neep.withHook('updated', () => console.log('Hook', 'B', 'updated'), true);
	  const a = Neep.withDelivered(DeliverValue);
	  return Neep.createElement(Neep.Template, null, Neep.createElement("div", null, "B: ", a, "|", Neep.withDelivered(DeliverNumber)), slot('name'), Neep.createElement("br", null), slot(), Neep.createElement("button", {
	    onclick: props.onset
	  }, "[onclick]+1"), Neep.createElement("button", {
	    "on-click": props.onset
	  }, "[on-click]+1"), Neep.createElement("button", {
	    '@click': props.onset
	  }, "[@click]+1"), Neep.createElement("button", {
	    'on:click': props.onset
	  }, "[on:click]+1"), Neep.createElement("button", {
	    '@click': () => emit('set')
	  }, "[@click=emit]+1"), Neep.createElement("br", null), Neep.createElement(Neep.Slot, null), Neep.createElement(Neep.Slot, null), Neep.createElement("br", null), Neep.createElement(Neep.Slot, {
	    name: "666"
	  }, "666"), Neep.createElement("br", null), Neep.createElement(Neep.Slot, {
	    name: "name"
	  }, "name"), Neep.createElement("hr", null), Neep.createElement(Sync, null), Neep.createElement("hr", null), Neep.createElement(Sync2, null), Neep.createElement("hr", null), Neep.createElement(Compute, null), Neep.createElement("hr", null), Neep.createElement(Compute2, null), Neep.createElement("hr", null));
	}, {
	  name: 'B'
	});

	Neep.register('tb', B);

	var E = Neep.createShellComponent((props, {
	  childNodes
	}) => {
	  Neep.withLabel('{E}', '#F00');
	  const a = Neep.withDelivered(DeliverValue);
	  const newA = Neep.computed(() => a.value + 1);
	  return Neep.createElement(DeliverValue, {
	    value: newA
	  }, Neep.createElement(DeliverNumber, {
	    value: Neep.withDelivered(DeliverNumber) + 1
	  }, Neep.createElement("div", null, "E: ", a, "|", Neep.withDelivered(DeliverNumber)), Neep.createElement("tb", _extends({}, props, {
	    '@set': props.onset
	  }), childNodes())));
	}, {
	  name: 'E'
	});

	var D = Neep.createShellComponent((props, {
	  childNodes
	}) => {
	  Neep.withLabel('{D}', '#F00');
	  return Neep.createElement(E, props, childNodes());
	}, {
	  name: 'D'
	});

	var C = Neep.createShellComponent((props, {
	  childNodes
	}) => {
	  Neep.withLabel('{C}', '#F00');
	  const a = Neep.withDelivered(DeliverValue);
	  const newA = Neep.computed(() => a.value + 1);
	  return Neep.createElement(DeliverValue, {
	    value: newA
	  }, Neep.createElement(DeliverNumber, {
	    value: Neep.withDelivered(DeliverNumber) + 1
	  }, Neep.createElement("div", null, "C: ", a, "|", Neep.withDelivered(DeliverNumber)), Neep.createElement(D, props, childNodes())));
	}, {
	  name: 'C'
	});

	function createItem$2(bg) {
	  const div = document.createElement('div');
	  div.style.minHeight = '40px';
	  div.style.background = bg;
	  document.body.appendChild(div);
	  return div;
	}

	const divs = [createItem$2('#F00'), createItem$2('#FF0'), createItem$2('#F0F'), createItem$2('#0F0'), createItem$2('#0FF'), createItem$2('#00F')];
	var A = Neep.createComponent(props => {
	  const divIndex = Neep.value(6);
	  const div = Neep.computed(() => divs[divIndex.value]);

	  function moveDiv() {
	    divIndex.value = (divIndex.value + 1) % (divs.length + 1);
	  }

	  Neep.withLabel('{自定义标签文本}', '#F00');
	  Neep.withHook('beforeCreate', () => console.log('Hook', 'A', 'beforeCreate'));
	  Neep.withHook('created', () => console.log('Hook', 'A', 'created'));
	  Neep.withHook('beforeMount', () => console.log('Hook', 'A', 'beforeMount'));
	  Neep.withHook('mounted', () => console.log('Hook', 'A', 'mounted'));
	  Neep.withHook('beforeUpdate', () => console.log('Hook', 'A', 'beforeUpdate'));
	  Neep.withHook('updated', () => console.log('Hook', 'A', 'updated'));
	  const v = Neep.value(1);

	  const ref = x => console.log('Ref', 'B', x);

	  return Neep.createRenderElement(() => Neep.createElement(DeliverValue, {
	    value: v
	  }, Neep.createElement(DeliverNumber, {
	    value: v.value
	  }, Neep.createElement(Neep.Container, {
	    target: div
	  }, Neep.createElement("button", {
	    "on-click": moveDiv
	  }, "\u79FB\u52A8")), Neep.createElement("tc", {
	    a: "1",
	    onset: () => v.value++,
	    ref: ref
	  }, Neep.createElement("b", {
	    ref: ref
	  }, "\u4F60\u597D"), Neep.createElement("i", {
	    ref: ref
	  }, v), Neep.createElement("u", {
	    ref: ref,
	    slot: "name"
	  }, props.name)))));
	}, {
	  name: 'A',
	  components: {
	    tc: C
	  }
	});

	var App = Neep.createComponent(() => Neep.createElement(A, {
	  name: "\u554A"
	}), {
	  name: 'App'
	});

	Neep.render(App).mount();

})));
//# sourceMappingURL=index.js.map
