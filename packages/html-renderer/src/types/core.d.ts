module '@neep/core/' {
	/** 原生元素节点 */
	export interface NativeElementNodes {
		html: Element;
	}
	/** 原生文本节点 */
	export interface NativeTextNodes {
		html: Text;
	}
	/** 原生占位组件 */
	export interface NativePlaceholderNodes {
		html: Comment;
	}
	/** 原生组件 */
	export interface NativeComponentNodes {
		html: Element;
	}
	/** 原生组件内部 */
	export interface NativeShadowNodes {
		html: ShadowRoot;
	}
}
