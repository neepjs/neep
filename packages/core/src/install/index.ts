import * as monitorableApi from 'monitorable';
import { IRender, Devtools } from '../type';
import { isProduction } from '../constant';
import installDevtools from './devtools';
import installRender from './render';
import installMonitorable from './monitorable';


export * from './devtools';
export * from './render';
export * from './monitorable';


export interface InstallOptions {
	monitorable?: typeof monitorableApi;
	render?: IRender;
	devtools?: Devtools;
}


export default function install(apis: InstallOptions) {
	installMonitorable(apis.monitorable);
	installRender(apis.render);
	if (!isProduction) {
		installDevtools(apis.devtools);
	}
}
