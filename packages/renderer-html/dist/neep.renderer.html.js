/*!
 * NeepRendererHtml v0.1.0-alpha.16
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@neep/core');

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

function installNeep(renderer) {
  core.install({
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
  const id = getId(core.isValue(props.id) ? props.id() : props.id);
  PropsMap.set(el, id);

  if (id !== old) {
    if (typeof id === 'string') {
      el.id = id;
    } else {
      el.removeAttribute('id');
    }
  }
}

function* recursive2iterable(list) {
  if (core.isValue(list)) {
    yield* recursive2iterable(list());
    return;
  }

  if (!Array.isArray(list)) {
    yield list;
    return;
  }

  for (const it of list) {
    yield* recursive2iterable(it);
  }
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

function update(el, classes, oClasses) {
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
  const classes = getClass(core.isValue(props.class) ? props.class() : props.class);
  update(el, classes, old);
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
  if (core.isValue(style)) {
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

    if (core.isValue(value)) {
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

function update$1(css, style, oStyle) {
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
  const style = getStyle(core.isValue(props.style) ? props.style() : props.style);
  update$1(css, style, old);
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

    if (core.isValue(data)) {
      data = data();
    }

    const value = stringify(data, name.substr(0, 2) === 'on');

    if (value !== undefined) {
      attrs[name] = value;
    }
  }

  return attrs;
}

function update$2(el, attrs, old) {
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
  update$2(el, attrs, old);
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

    if (!core.isValue(value)) {
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

function nextFrame(f) {
  window.requestAnimationFrame(f);
}

function getTarget(renderer, container, target, parent) {
  if (core.isValue(target)) {
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
  nextFrame,

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

function initContainer() {
  exports.Container = core.createContainerComponent(core.createElement(''), {
    renderer,
    name: '[HTML]'
  });
}

function init() {
  initContainer();
}

function install(Neep) {}
installNeep(renderer);
init();



var NeepHtmlRender = /*#__PURE__*/Object.freeze({
	__proto__: null,
	renderer: renderer,
	install: install,
	get Container () { return exports.Container; }
});

exports.default = NeepHtmlRender;
exports.install = install;
exports.renderer = renderer;
