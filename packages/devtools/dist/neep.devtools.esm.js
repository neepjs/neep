/*!
 * NeepDevtools v0.1.0-alpha.1
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import { nameSymbol, typeSymbol, Template, Deliver, ScopeSlot, SlotRender, Value, create as create$1, createElement } from '@neep/core';

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

  if (tag === Template || tag === Deliver || tag === ScopeSlot || tag === SlotRender) {
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

  if (tag === Value) {
    const treeValue = tree.value;
    const type = typeof treeValue;
    let valueType = 'string';
    let value = '';

    if (type === 'string') {
      value = treeValue;
    } else if (treeValue === tree.node) {
      valueType = 'native';
    } else if (type === 'function') {
      valueType = 'function';
    } else if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || treeValue === null) {
      valueType = 'value';
      value = String(treeValue);
    } else if (treeValue instanceof RegExp) {
      valueType = 'regex';
      value = String(treeValue);
    } else if (treeValue instanceof Date) {
      valueType = 'date';
      value = treeValue.toISOString();
    } else if (type === 'object') {
      valueType = 'object';
      value = String(treeValue);
    }

    return yield {
      id,
      parent,
      type: Type.special,
      tag,
      children: [],
      valueType,
      value,
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

function createText(valueType = 'string', value = '') {
  switch (valueType) {
    case 'string':
      return createElement("span", null, value);

    case 'native':
      return createElement("span", {
        style: "font-weight: bold;"
      }, "[Native]");

    case 'function':
      return createElement("span", {
        style: "font-weight: bold;"
      }, "[Function]");

    case 'date':
      return createElement("span", {
        style: "font-weight: bold;"
      }, value);

    case 'regex':
      return createElement("span", {
        style: "font-weight: bold;"
      }, value);

    case 'value':
      return createElement("span", {
        style: "font-style: italic;"
      }, value);

    case 'object':
      return createElement("span", {
        style: "font-style: italic;"
      }, value);
  }
}

function createTag(name, keys, id, key, labels, ...children) {
  const opened = keys[id];
  const hasChildren = Boolean(children.length);
  return createElement("div", {
    key: id,
    style: " position: relative; min-height: 20px; font-size: 14px; line-height: 20px; "
  }, children.length && createElement("div", {
    style: " position: absolute; left: -20px; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;; ",
    onClick: () => keys[id] = !opened
  }, opened ? '-' : '+') || undefined, createElement("div", null, '<', name, typeof key === 'string' ? ` key="${key}"` : typeof key === 'number' ? ` key=${key}` : typeof key === 'boolean' ? ` key=${key}` : typeof key === 'bigint' ? ` key=${key}` : typeof key === 'symbol' ? ` key=${String(key)}` : key === null ? ` key=${key}` : key !== undefined && ` key={${String(key)}}`, hasChildren ? '>' : ' />', hasChildren && !opened && createElement("span", null, createElement("span", {
    onClick: () => keys[id] = true,
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
    valueType
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

  if (tag === Deliver) {
    if (!options.deliver) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "Deliver"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (tag === Template) {
    if (!options.template) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "Template"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (tag === ScopeSlot) {
    if (!options.scopeSlot) {
      return yield* getList(children, keys, options, [label, ...labels]);
    }

    return yield createTag(createElement("span", {
      style: "font-style: italic;"
    }, "ScopeSlot"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
  }

  if (tag === SlotRender) {
    if (options.slotRender) ;

    return;
  }

  if (tag === Value) {
    if (!options.tag) {
      return;
    }

    if (!options.value) {
      return;
    }

    return yield createText(valueType, value);
  }
}

var App = create$1((props, {}, {
  encase
}) => {
  const keys = encase({});
  return () => createElement("div", {
    style: "padding-left: 20px;"
  }, [...getList(props.tree, keys, getOptions(props))]);
});

let creating = false;

function create() {
  creating = true;

  try {
    return Neep.render();
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
      app.$update(Neep.createElement(App, {
        tree,
        value: true,
        tag: true
      }));
    };

    Neep.setHook('drawnAll', getData, container.entity);
    Neep.setHook('mounted', () => {
      if (!app) {
        app = create();
      }

      getData();
      app.$mount();
    }, container.entity);
  }

};

let Neep;
function install(neep) {
  neep.install({
    devtools
  });
  Neep = neep;
}

export { install };
//# sourceMappingURL=neep.devtools.esm.js.map
