import * as Neep from '@neep/web';
import * as monitorable from 'monitorable';
import App from './App';
import * as NeepDevtools from '@neep/devtools';
Neep.install({ monitorable });
NeepDevtools.install(Neep);
Neep.render(App).$mount();
