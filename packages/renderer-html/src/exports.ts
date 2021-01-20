export { default as renderer } from './renderer';
export { default as install } from './install';
export * from './init';
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
