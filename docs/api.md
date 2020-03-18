API
========

上下文 API
--------

### context.slots

### context.created

### context.parent

### context.delivered

### context.children

### context.childNodes

### context.refresh(fn)

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

### exposed.$update(node)

### exposed.$mount(target)

### exposed.$unmount()

初始化 API
--------

### Neep.install(options)

渲染 API
--------

### Neep.render(el/Component, options)

辅助/Element API
--------

### Neep.isElement(any)

### Neep.createElement(tag, attrs, ...children)

### Neep.elements(nodes, options)

辅助/标签 API
--------

### Neep.ScopeSlot

### Neep.SlotRender

### Neep.Slot

### Neep.Value

### Neep.Container

### Neep.Deliver

### Neep.Template

### Neep.Fragment

Neep.Template 的别名

辅助/状态 API
--------

### Neep.value(value, options)

### Neep.computed(getter, setter, options)

### Neep.isValue(any)

### Neep.encase(value, nest)

### Neep.recover(value)

辅助/声明周期 API
--------

这一组 API 尽在组件（不含简单组件）的执行周期中有效，在执行周期之外执行会报错

### Neep.watch(value/fn, cb)

### Neep.hook(name, hook, initOnly)

### Neep.expose(name, value/getter mix/nonModifiable/setter)

辅助/开发模式 API
--------

这一组 API 在生产环境下无任何效果

### Neep.label(text, color)

创建/标记 API
--------

### Neep.mName(name, component)

### Neep.mType(type, component)

### Neep.mSimple(component)

### Neep.mNative(component)

### Neep.mRender(fn, component)

### Neep.mark(component, ...marks)

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

### Neep.setAuxiliary(name, value)

### Neep.defineAuxiliary(name, get)

错误类型
--------

### Neep.Error

常量
--------

### Neep.version

### Neep.mode

### Neep.isProduction
