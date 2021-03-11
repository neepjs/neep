/*!
 * NeepRendererHtml v0.1.0-alpha.18
 * (c) 2019-2021 Fierflame
 * @license MIT
 */
import Neep from '@neep/core';

declare const renderer: Neep.IRenderer;

declare function install(Neep: typeof Neep): void;

declare namespace Container {
    interface Props {
        target?: string | HTMLElement;
    }
}
declare let Container: Neep.ContainerComponent<Container.Props>;

declare module '@neep/core' {
    /** 原生元素节点 */
    interface NativeElementNodes {
        html: Element;
    }
    /** 原生文本节点 */
    interface NativeTextNodes {
        html: Text;
    }
    /** 原生占位组件 */
    interface NativePlaceholderNodes {
        html: Comment;
    }
    /** 原生组件 */
    interface NativeComponentNodes {
        html: Element;
    }
    /** 原生组件内部 */
    interface NativeShadowNodes {
        html: ShadowRoot;
    }
}

declare const NeepHtmlRender_renderer: typeof renderer;
declare const NeepHtmlRender_install: typeof install;
declare const NeepHtmlRender_Container: typeof Container;
declare namespace NeepHtmlRender {
  export {
    NeepHtmlRender_renderer as renderer,
    NeepHtmlRender_install as install,
    NeepHtmlRender_Container as Container,
  };
}

export default NeepHtmlRender;
export { Container, install, renderer };
