import DeliverProxy from '../entity/proxy/DeliverProxy';
import ElementProxy from '../entity/proxy/ElementProxy';
import GroupProxy from '../entity/proxy/GroupProxy';
import ShellProxy from '../entity/proxy/ShellProxy';
import SlotProxy from '../entity/proxy/SlotProxy';
import ValueProxy from '../entity/proxy/ValueProxy';
import RenderProxy from '../entity/proxy/RenderProxy';

import NodeProxy from '../entity/proxy/NodeProxy';

import ContainerProxy from '../entity/proxy/ContainerProxy';

import StandardComponentProxy from '../entity/proxy/StandardComponentProxy';
import RenderComponentProxy from '../entity/proxy/RenderComponentProxy';
import ComponentProxy from '../entity/proxy/ComponentProxy';

import RefProxy from '../entity/proxy/RefProxy';
import BaseProxy from '../entity/proxy/BaseProxy';

export function isProxy(v: any, type?: ''): v is RefProxy<any, any, any>;
export function isProxy(v: any, type?: ''): v is BaseProxy<any>;

export function isProxy(v: any, type: 'component'): v is ComponentProxy<any, any, any, any>;
export function isProxy(v: any, type: 'standardComponent'): v is StandardComponentProxy<any, any, any, any>;
export function isProxy(v: any, type: 'renderComponent'): v is RenderComponentProxy<any, any, any, any>;
export function isProxy(v: any, type: 'container'): v is ContainerProxy<any>;

export function isProxy(v: any, type: 'node'): v is NodeProxy<any>;
export function isProxy(v: any, type: 'deliver'): v is DeliverProxy<any>;
export function isProxy(v: any, type: 'element'): v is ElementProxy<any>;
export function isProxy(v: any, type: 'group'): v is GroupProxy<any>;
export function isProxy(v: any, type: 'shell'): v is ShellProxy<any>;
export function isProxy(v: any, type: 'value'): v is ValueProxy;
export function isProxy(v: any, type: 'render'): v is RenderProxy;
export function isProxy(v: any, type: 'slot'): v is SlotProxy;

export function isProxy(v: any, type?: string): boolean {
	switch (type) {
		case 'standardComponent': return v instanceof StandardComponentProxy;
		case 'renderComponent': return v instanceof RenderComponentProxy;
		case 'component': return v instanceof ComponentProxy;

		case 'container': return v instanceof ContainerProxy;

		case 'deliver': return v instanceof DeliverProxy;
		case 'element': return v instanceof ElementProxy;
		case 'group': return v instanceof GroupProxy;
		case 'shell': return v instanceof ShellProxy;
		case 'value': return v instanceof ValueProxy;
		case 'render': return v instanceof RenderProxy;
		case 'slot': return v instanceof SlotProxy;
		case 'node': return v instanceof NodeProxy;
		case 'ref': return v instanceof RefProxy;
	}
	return v instanceof BaseProxy;
}
