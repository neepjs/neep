/*!
 * NeepDevtools v0.1.0-alpha.4
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import { nameSymbol, typeSymbol } from '@neep/core';

let render;
let createElement;
let setHook;
let isValue;
let encase;
function install(Neep) {
  render = Neep.render;
  createElement = Neep.createElement;
  setHook = Neep.setHook;
  isValue = Neep.isValue;
  encase = Neep.encase;
  return Neep.install;
}

let Type;

(function (Type) {
  Type["tag"] = "tag";
  Type["placeholder"] = "placeholder";
  Type["standard"] = "standard";
  Type["simple"] = "simple";
  Type["native"] = "native";
  Type["container"] = "container";
  Type["special"] = "special";
})(Type || (Type = {}));

function* getTree(tree, parent = 0) {
  var _component$exposed;

  if (Array.isArray(tree)) {
    for (const it of tree) {
      yield* getTree(it);
    }

    return;
  }

  const {
    id,
    tag,
    props,
    children,
    key,
    component,
    label = component === null || component === void 0 ? void 0 : (_component$exposed = component.exposed) === null || _component$exposed === void 0 ? void 0 : _component$exposed.$label
  } = tree;

  if (!tag) {
    return yield {
      id,
      parent,
      type: Type.placeholder,
      tag: 'placeholder',
      children: []
    };
  }

  if (typeof tag !== 'string') {
    const name = tag[nameSymbol] || tag.name;

    if (!component) {
      return yield {
        id,
        parent,
        type: Type.simple,
        tag: name,
        children: [...getTree(children)],
        props,
        key,
        label
      };
    }

    const isNative = tag[typeSymbol] === 'native';
    return yield {
      id,
      parent,
      type: isNative ? Type.native : Type.standard,
      tag: name,
      children: [...getTree('content' in component ? component.content : isNative ? component.nativeTree : component.tree)],
      props,
      key,
      label
    };
  }

  const ltag = tag.toLowerCase();

  if (ltag === 'neep:value') {
    const treeValue = tree.value;
    return yield {
      id,
      parent,
      type: Type.special,
      tag,
      children: [],
      isNative: treeValue === tree.node,
      value: treeValue,
      props,
      key,
      label
    };
  }

  if (ltag.substr(0, 5) === 'neep:' || ltag === 'template') {
    return yield {
      id,
      parent,
      type: Type.special,
      tag,
      children: [...getTree(children)],
      props,
      key,
      label
    };
  }

  yield {
    id,
    parent,
    type: Type.tag,
    tag,
    children: [...getTree(children)],
    props,
    key,
    label
  };
}

function getValue(value) {
  const type = typeof value;

  if (type === 'function') {
    return createElement("span", {
      style: "font-weight: bold;"
    }, "[Function]");
  }

  if (type === 'string') {
    return createElement("span", null, value);
  }

  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || value === null) {
    return createElement("span", {
      style: "font-style: italic;"
    }, String(value));
  } else if (value instanceof RegExp) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, String(value));
  } else if (value instanceof Date) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, value.toISOString());
  } else if (type === 'object') {
    return createElement("span", {
      style: "font-style: italic;"
    }, String(value));
  }

  return null;
}
function TextNode({
  isNative,
  value
}) {
  if (isNative) {
    return createElement("span", {
      style: "font-weight: bold;"
    }, "[Native]");
  }

  if (!isValue(value)) {
    return getValue(value);
  }

  return createElement("template", null, createElement("span", {
    style: "font-weight: bold;"
  }, "[Value:\xA0"), getValue(value()), createElement("span", {
    style: "font-weight: bold;"
  }, "\xA0]"));
}

function getOptions({
  value = false,
  tag = false,
  placeholder = false,
  simple = false,
  container = false,
  template = false,
  scopeSlot = false,
  slotRender = false,
  deliver = false
}) {
  return {
    value,
    tag,
    placeholder,
    simple,
    container,
    template,
    scopeSlot,
    slotRender,
    deliver
  };
}

function createTag(name, keys, id, key, labels, ...children) {
  const opened = keys[id];
  const hasChildren = Boolean(children.length);
  return createElement("div", {
    key: id,
    style: " position: relative; min-height: 20px; font-size: 14px; line-height: 20px; "
  }, children.length && createElement("div", {
    style: " position: absolute; left: -20px; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;; ",
    onclick: () => keys[id] = !opened
  }, opened ? '-' : '+') || undefined, createElement("div", null, '<', name, typeof key === 'string' ? ` key="${key}"` : typeof key === 'number' ? ` key=${key}` : typeof key === 'boolean' ? ` key=${key}` : typeof key === 'bigint' ? ` key=${key}` : typeof key === 'symbol' ? ` key=${String(key)}` : key === null ? ` key=${key}` : key !== undefined && ` key={${String(key)}}`, hasChildren ? '>' : ' />', hasChildren && !opened && createElement("span", null, createElement("span", {
    onclick: () => keys[id] = true,
    style: "cursor: pointer;"
  }, "..."), '</', name, '>'), hasChildren && labels.filter(Boolean).map(([v, color]) => createElement("span", {
    style: `color: ${color || '#000'}`
  }, v))), hasChildren && opened && createElement("div", {
    style: "padding-left: 20px"
  }, children), opened && hasChildren && createElement("div", null, '</', name, '>'));
}

function* getList(list, keys, options, labels = []) {
  if (Array.isArray(list)) {
    for (const it of list) {
      yield* getList(it, keys, options, labels);
    }

    return;
  }

  const {
    id,
    type,
    tag,
    children,
    props,
    key,
    label,
    value,
    isNative
  } = list;

  if (type === Type.standard || type === Type.native) {
    return yield createTag(createElement("span", {
      style: "font-weight: bold;"
    }, tag), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (type === Type.tag) {
    if (!options.tag) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(tag, keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (type === Type.simple) {
    if (!options.simple) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: " font-style: italic; font-weight: bold; "
    }, tag), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (type === Type.placeholder) {
    if (!options.placeholder) {
      return;
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "placeholder"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (type === Type.container) {
    if (!options.container) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "container"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  const ltag = tag.toLowerCase();

  if (ltag === 'neep:deliver') {
    if (!options.deliver) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "Deliver"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (ltag === 'template') {
    if (!options.template) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "Template"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (ltag === 'neep:scopeslot' || ltag === 'neep:scope-slot') {
    if (!options.scopeSlot) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "ScopeSlot"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (ltag === 'neep:slotrender' || ltag === 'neep:slot-render') {
    if (options.slotRender) ;

    return;
  }

  if (ltag === 'neep:value') {
    if (!options.tag) {
      return;
    }

    if (!options.value) {
      return;
    }

    return yield createElement(TextNode, {
      isNative: isNative,
      value: value
    });
  }
}

var App = (props => {
  const keys = encase({});
  return () => createElement("div", {
    style: "padding-left: 20px;"
  }, [...getList(props.tree, keys, getOptions(props))]);
});

let creating = false;

function create() {
  creating = true;

  try {
    return render();
  } finally {
    creating = false;
  }
}

const devtools = {
  renderHook(container) {
    if (creating) {
      return;
    }

    let app;

    const getData = () => {
      if (!app) {
        app = create();
      }

      const tree = [...getTree(container.content)];
      app.$update(createElement(App, {
        tree,
        value: true,
        tag: true
      }));
    };

    setHook('drawnAll', getData, container.entity);
    setHook('mounted', () => {
      if (!app) {
        app = create();
      }

      getData();
      app.$mount();
    }, container.entity);
  }

};

function install$1(Neep) {
  install(Neep)({
    devtools
  });
}

export { install$1 as install };
