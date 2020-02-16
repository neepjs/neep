import * as Neep from '@neep/web';
import * as monitorable from 'monitorable';
import App from './App';
import { render } from '@neep/devtools';
Neep.install({ monitorable });

render(App);
