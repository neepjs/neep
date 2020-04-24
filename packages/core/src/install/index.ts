import * as monitorableApi from 'monitorable';
import { IRender } from '../type';
import { isProduction } from '../constant';
import installDevtools from './devtools';
import installRender from './renderer';
import installMonitorable from './monitorable';


export * from './devtools';
export * from './renderer';
export * from './monitorable';


export interface InstallOptions {
	monitorable?: typeof monitorableApi;
	render?: IRender;
	renders?: IRender[];
	devtools?: any;
}


export default function install(apis: InstallOptions) {
	installMonitorable(apis.monitorable);
	installRender(apis);
	if (!isProduction) {
		installDevtools(apis.devtools);
	}
}
