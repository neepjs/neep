import {
	RenderComponent,
	SimpleComponent,
	ContainerComponent,
	DeliverComponent,
	NativeComponent,
	ShellComponent,
	ElementComponent,
} from './type';
import {
	objectTypeSymbol,
	objectTypeSymbolSimpleComponent,
	objectTypeSymbolNativeComponent,
	objectTypeSymbolRenderComponent,
	objectTypeSymbolDeliverComponent,
	objectTypeSymbolContainerComponent,
	objectTypeSymbolShellComponent,
	objectTypeSymbolElementComponent,
} from './symbols';

export function isSimpleComponent(v: any): v is SimpleComponent<any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolSimpleComponent;
}
export function isShellComponent(v: any): v is ShellComponent<any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolShellComponent;
}
export function isNativeComponent(v: any):  v is NativeComponent<any, any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolNativeComponent;
}
export function isRenderComponent(v: any): v is RenderComponent<any, any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolRenderComponent;
}
export function isContainerComponent(v: any): v is ContainerComponent<any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolContainerComponent;
}
export function isElementComponent(v: any): v is ElementComponent<any, any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolElementComponent;
}
export function isDeliverComponent(v: any): v is DeliverComponent<any> {
	if (typeof v !== 'function') { return false; }
	return v[objectTypeSymbol] === objectTypeSymbolDeliverComponent;
}

export {
	isDeliverComponent as isDeliver,
};
