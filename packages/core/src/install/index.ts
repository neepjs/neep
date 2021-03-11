import { IRenderer, Devtools } from '../types';
import { isProduction } from '../constant/info';
import installDevtools from './devtools';
import installRender from './renderer';
import installMonitorable from './monitorable';


export * from './devtools';
export * from './renderer';

function install(apis: install.Option): void {
	installMonitorable(apis.monitorable);
	installRender(apis.renderer);
	if (!isProduction) {
		installDevtools(apis.devtools);
	}
}


declare namespace install {
	export interface Option {
		monitorable?: typeof import('monitorable');
		renderer?: IRenderer;
		devtools?: Devtools;
	}

}
export default install;
