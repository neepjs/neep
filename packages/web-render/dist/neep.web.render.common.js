/*!
 * NeepWebRender v0.1.0-alpha.2
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
'use strict';

function* recursive2iterable(list) {
  if (!Array.isArray(list)) {
    yield list;
    return;
  }

  for (const it of list) {
    yield* recursive2iterable(it);
  }
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

function getAttrs(props, hasStyle) {
  const attrs = Object.create(null);

  for (const k in props) {
    const name = k.replace(/([A-Z])/g, '-$1').replace(/(\-)\-+/g, '$1').toLowerCase();

    switch (name) {
      case 'style':
        if (!hasStyle) {
          break;
        }

      case 'is':
      case 'id':
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
}, hasStyle) {
  return {
    id: getId(id),
    classes: getClass(className),
    style: hasStyle ? getStyle(style) : undefined,
    attrs: getAttrs(attrs, hasStyle),
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
function update(el, props) {
  const css = el.style;
  const hasStyle = css instanceof CSSStyleDeclaration;
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
  } = getProps(props, hasStyle);
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

  if (hasStyle) {
    updateStyle(css, style, old.style);
  }

  updateAttrs(el, attrs, old.attrs);
  updateEvent(el, event, old.event);
  return el;
}

let list;
function nextFrame(f) {
  if (list) {
    list.push(f);
    return;
  }

  list = [f];
  window.requestAnimationFrame(() => {
    const fs = list;
    list = undefined;

    if (!fs) {
      return;
    }

    fs.forEach(f => f());
  });
}

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

const render = {
  type: 'web',
  nextFrame,

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

    const container = render.create(tag, {
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

    if (parent !== render) {
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
    render.update(container, {
      class: className,
      style
    });

    if (typeof target === 'string') {
      target = document.querySelector(target);
    }

    if (parent !== render && !(target instanceof Element)) {
      target = document.body;
    }

    const oldTarget = parent === render && container === node ? undefined : render.parent(node);

    if (oldTarget === target) {
      return [container, node];
    }

    if (parent !== render) {
      target.appendChild(container);
      return [container, node];
    }

    if (!oldTarget) {
      const newNode = parent.placeholder();
      const pNode = parent.parent(node);

      if (pNode) {
        render.insert(pNode, newNode, node);
        render.remove(node);
      }

      return [container, newNode];
    }

    if (!target) {
      const pNode = parent.parent(node);

      if (pNode) {
        render.insert(pNode, container, node);
        render.remove(node);
      }

      return [container, container];
    }

    target.appendChild(node);
    return [container, node];
  },

  draw() {},

  create(tag, props) {
    return update(createElement(tag), props);
  },

  text(text) {
    return document.createTextNode(text);
  },

  placeholder() {
    return document.createComment('');
  },

  component() {
    const node = createElement('neep-component');
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
    update(node, props);
  },

  insert(parent, node, next = null) {
    parent.insertBefore(node, next);
  },

  remove(node) {
    const p = render.parent(node);

    if (!p) {
      return;
    }

    p.removeChild(node);
  }

};

module.exports = render;
//# sourceMappingURL=neep.web.render.common.js.map
