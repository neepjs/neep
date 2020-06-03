API
========

辅助/Element API
--------

### Neep.isElement(any)

用于判断对象是否为 Neep 元素

* 参数：
  * `{any} any` - 被判断的对象
* 返回值： `{boolean}`

### Neep.createElement(tag [, attrs [, ...children] ])

用于创建 Neep 元素

* 参数：
  * `{string | Function} tag` - 元素属性
  * `{Object} attrs` - 元素属性及 Neep 参数
  * `{any} children` - 元素
* 返回值： `{Object NeepElement}`
* 用法：
  使用 jsx 写法时会自动调用，但需要配置合适的装换参数

### Neep.elements(nodes [, options])

将多层 Element 数组平坦成一维数组，支持对特殊嵌套标签的展开

* 参数：
  * `{any} nodes` - 要被平坦的数组或 Element
  * `{Object} options` - 选项
* 返回值： `{Array NeepElement}`

### Neep.equal(a, b)

比较两个 Element 结构是否相同

* 参数：
  * `{any} a` - 被比较的结构
  * `{any} b` - 被比较的结构
* 返回值： `{Boolean}}`

辅助/状态 API
--------

这一组 API 继承自 monitorable 与在 monitorable 中的定义相同

### Neep.value(value [, options])

创建一个可监听值，是 Monitorable.value 的代理

* 参数：
  * `{any} value` - 原始值
  * `{Object} options` - 选项
* 返回值： `{Function Value}`
* 示例：

``` javascript
const a = Neep.value(1);
// 其值保存在 value 属性中。
a.value++;
// value 属性的修改会被监视
```

### Neep.computed(getter [, setter] [, options])

创建一个计算属性，当 getter 中参与计算的可监视对象的值发生改变改变后，会触发重新计算。

* 参数：
  * `{Function} getter` - 计算值的函数
  * `{Function} setter` - 设置值时调用的设置函数，当不存在此项时，不支持修改
  * `{Object} options` - 选项
* 返回值： `{Function Value}`
* 示例：

``` javascript
const a = Neep.value(1);
const b = Neep.value(1);
const c = Neep.computed(() => a.value + b.value);

console.log(c) // 2

a.value = 2;

console.log(c) // 3

```

### Neep.isValue(any)

判断一个对象是否为 `Value`。

* 参数：
  * `{any} any` - 被判断的对象
* 返回值： `{boolean}`

### Neep.encase(value [, nest])

将 value 进行包装。

* 参数：
  * `{Object | Function} value` - 将被包装对象
* 返回值： `{Object | Function}`

### Neep.recover(value)

获取 value 包装前的值。

* 参数：
  * `{Object | Function} any` - 被包装对象
* 返回值： `{Object | Function}`

### Neep.valueify(props [, key [, def [, set]]])

### Neep.asValue(props[, key])

辅助/声明周期 API
--------

这一组 API 只在组件（不含简单组件）的执行周期中有效，在执行周期之外执行会报错

### Neep.watch(value/fn, cb)

监听 Value 对象或者函数执行时参与计算的相应值的变化。当组件销毁后，会自动结束监听。

* 参数：
  * `{Function Value} value` - 被监听的 Value
  * `{Function} fn` - 用于计算的函数
  * `{Function} cb` - 其值可能发生变化后的回调

### Neep.useValue(fn)

用于普通函数组件在不同执行周期中能够得到相同值。

* 参数：
  * `{Function} fn` - 初始化值的函数

### Neep.useService(fn [, ...args])

用于普通函数组件在不同执行周期中能够使用同一个服务实例。

* 参数：
  * `{Function} fn` - 服务函数
  * `{any} args` - 传递给 fn 的参数

### Neep.byService(fn [, ...args])

获取基于当前实例的服务实例。

* 参数：
  * `{Function} fn` - 服务函数
  * `{any} args` - 传递给 fn 的参数

### Neep.hook(name, hook [, createOnly])

用于注册当前组件的勾子

* 参数：
  * `{String} name` - 钩子名称
  * `{Function} hook` - 钩子函数
  * `{Boolean} createOnly` - 是否只在创建阶段注册

### Neep.expose(name, value/getter [, mix/nonModifiable/setter])

将值获函数暴露出去。

### Neep.deliver(name, value/getter [, mix/nonModifiable/setter])

传递值给后代组件。

辅助/标签 API
--------

### Neep.ScopeSlot

作用域槽标签，用于作用域槽的渲染

### Neep.SlotRender

### Neep.Slot

### Neep.Value

### Neep.Container

### Neep.Deliver

传递值给后代组件

### Neep.Template

### Neep.Fragment

Neep.Template 的别名

辅助/原生节点 API
--------

### Neep.getRect

辅助/开发模式 API
--------

这一组 API 在生产环境下无任何效果

### Neep.label(text, color)

用于在开发工具上标记元素的标签

渲染 API
--------

### Neep.render(component [, options])

* 参数：
  * `{Function} Component` - 要渲染的组件
  * `{Object} options` - 渲染选项
* 返回值： `Object RootExposed`

### Neep.refresh(fn, async)

创建/标记 API
--------

### Neep.mName(name, component)

### Neep.mType(type, component)

### Neep.mSimple(component)

### Neep.mNative(component)

### Neep.mRender(fn, component)

### Neep.mConfig(name, config, component)

### Neep.mComponent(name, item, component)

### Neep.mark(component, ...marks)

组件导出 API
--------

### exposed.$component

### exposed.$parent

### exposed.$isContainer

### exposed.$created

### exposed.$destroyed

### exposed.$mounted

### exposed.$unmounted

根组件导出 API
--------

### rootExposed.$update(node)

### rootExposed.$mount([target])

用于挂载

### rootExposed.$unmount()

用于卸载

上下文 API
--------

### context.slots

### context.created

### context.parent

### context.delivered

### context.children

### context.childNodes

### context.refresh(fn, async)

初始化 API
--------

### Neep.install(options)

创建/辅助 API
--------

### Neep.create<P, R>(component, res)

钩子 API
--------

### Neep.setHook(id, hook, exposed)

### Neep.callHook(id, exposed)

扩展 API
--------

### Neep.current

### Neep.checkCurrent(name, initOnly)

### Neep.addContextConstructor(constructor)

### Neep.addEntityConstructor(constructor)

### Neep.register(name, component)

错误类型
--------

### Neep.Error

常量
--------

### Neep.version

Neep Core 的版本号。

### Neep.isProduction

所使用的 Neep 是否为生产环境版本。

内置组件
--------

### Neep.lazy(importComponent)

创建懒加载组件
