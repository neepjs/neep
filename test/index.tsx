import * as Neep from '@neep/core';
import render from '@neep/web-render';
import * as monitorable from 'monitorable';
import App from './App';
import * as NeepDevtools from '@neep/devtools';

Neep.install({ monitorable, render });
NeepDevtools.install(Neep);
Neep.render(App).$mount();
