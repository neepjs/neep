import { IRenderer, Devtools } from '../type';
import { isProduction } from '../constant';
import installDevtools from './devtools';
import installRender from './renderer';
import installMonitorable from './monitorable';


export * from './devtools';
export * from './renderer';


export interface InstallOptions {
	monitorable?: typeof import('monitorable');
	renderer?: IRenderer;
	devtools?: Devtools;
}


export default function install(apis: InstallOptions): void {
	installMonitorable(apis.monitorable);
	installRender(apis.renderer);
	if (!isProduction) {
		installDevtools(apis.devtools);
	}
}
