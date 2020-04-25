import render from '../render';
import { install as NeepInstall } from '@neep/core';
NeepInstall({ render });

export { isValue, EventEmitter, Error } from '@neep/core';
export default function install(Neep: typeof import('@neep/core')) {
}
