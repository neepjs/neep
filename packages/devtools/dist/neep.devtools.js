/*!
 * NeepDevtools v0.1.0-alpha.2
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@neep/core')) :
	typeof define === 'function' && define.amd ? define(['exports', '@neep/core'], factory) :
	(global = global || self, factory(global.NeepDevtools = {}, global.Neep));
}(this, function (exports, Neep$1) { 'use strict';

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
	    const name = tag[Neep$1.nameSymbol] || tag.name;

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

	    const isNative = tag[Neep$1.typeSymbol] === 'native';
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

	  if (tag === Neep$1.Template || tag === Neep$1.Deliver || tag === Neep$1.ScopeSlot || tag === Neep$1.SlotRender) {
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

	  if (tag === Neep$1.Value) {
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
	    return Neep$1.createElement("span", {
	      style: "font-weight: bold;"
	    }, "[Function]");
	  }

	  if (type === 'string') {
	    return Neep$1.createElement("span", null, value);
	  }

	  if (type === 'bigint' || type === 'boolean' || type === 'number' || type === 'symbol' || type === 'undefined' || value === null) {
	    return Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, String(value));
	  } else if (value instanceof RegExp) {
	    return Neep$1.createElement("span", {
	      style: "font-weight: bold;"
	    }, String(value));
	  } else if (value instanceof Date) {
	    return Neep$1.createElement("span", {
	      style: "font-weight: bold;"
	    }, value.toISOString());
	  } else if (type === 'object') {
	    return Neep$1.createElement("span", {
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
	    return Neep$1.createElement("span", {
	      style: "font-weight: bold;"
	    }, "[Native]");
	  }

	  const isValue = Neep.isValue(value);
	  const data = isValue ? value() : value;

	  if (!Neep.isValue(value)) {
	    return getValue(data);
	  }

	  return Neep$1.createElement("template", null, Neep$1.createElement("span", {
	    style: "font-weight: bold;"
	  }, "[Value:\xA0"), getValue(data), Neep$1.createElement("span", {
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
	  return Neep$1.createElement("div", {
	    key: id,
	    style: " position: relative; min-height: 20px; font-size: 14px; line-height: 20px; "
	  }, children.length && Neep$1.createElement("div", {
	    style: " position: absolute; left: -20px; top: 0; width: 20px; height: 20px; text-align: center; cursor: pointer; background: #DDD;; ",
	    onclick: () => keys[id] = !opened
	  }, opened ? '-' : '+') || undefined, Neep$1.createElement("div", null, '<', name, typeof key === 'string' ? ` key="${key}"` : typeof key === 'number' ? ` key=${key}` : typeof key === 'boolean' ? ` key=${key}` : typeof key === 'bigint' ? ` key=${key}` : typeof key === 'symbol' ? ` key=${String(key)}` : key === null ? ` key=${key}` : key !== undefined && ` key={${String(key)}}`, hasChildren ? '>' : ' />', hasChildren && !opened && Neep$1.createElement("span", null, Neep$1.createElement("span", {
	    onclick: () => keys[id] = true,
	    style: "cursor: pointer;"
	  }, "..."), '</', name, '>'), hasChildren && labels.filter(Boolean).map(([v, color]) => Neep$1.createElement("span", {
	    style: `color: ${color || '#000'}`
	  }, v))), hasChildren && opened && Neep$1.createElement("div", {
	    style: "padding-left: 20px"
	  }, children), opened && hasChildren && Neep$1.createElement("div", null, '</', name, '>'));
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
	    return yield createTag(Neep$1.createElement("span", {
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

	    return yield createTag(Neep$1.createElement("span", {
	      style: " font-style: italic; font-weight: bold; "
	    }, tag), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (type === Type.placeholder) {
	    if (!options.placeholder) {
	      return;
	    }

	    return yield createTag(Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, "placeholder"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (type === Type.container) {
	    if (!options.container) {
	      return yield* getList(children, keys, options, [label, ...labels]);
	    }

	    return yield createTag(Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, "container"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (tag === Neep$1.Deliver) {
	    if (!options.deliver) {
	      return yield* getList(children, keys, options, [label, ...labels]);
	    }

	    return yield createTag(Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, "Deliver"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (tag === Neep$1.Template) {
	    if (!options.template) {
	      return yield* getList(children, keys, options, [label, ...labels]);
	    }

	    return yield createTag(Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, "Template"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (tag === Neep$1.ScopeSlot) {
	    if (!options.scopeSlot) {
	      return yield* getList(children, keys, options, [label, ...labels]);
	    }

	    return yield createTag(Neep$1.createElement("span", {
	      style: "font-style: italic;"
	    }, "ScopeSlot"), keys, id, key, [label, ...labels], ...getList(children, keys, options));
	  }

	  if (tag === Neep$1.SlotRender) {
	    if (options.slotRender) ;

	    return;
	  }

	  if (tag === Neep$1.Value) {
	    if (!options.tag) {
	      return;
	    }

	    if (!options.value) {
	      return;
	    }

	    return yield Neep$1.createElement(TextNode, {
	      isNative: isNative,
	      value: value
	    });
	  }
	}

	var App = Neep$1.create((props, {}, {
	  encase
	}) => {
	  const keys = encase({});
	  return () => Neep$1.createElement("div", {
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

	install(Neep$1);

	exports.install = install;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=neep.devtools.js.map
