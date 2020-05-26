/*!
 * NeepWebRender v0.1.0-alpha.12
 * (c) 2019-2020 Fierflame
 * @license MIT
 */
import * as core from '@neep/core';
import { IRender } from '@neep/core';

interface Render extends IRender {
    install(Neep: typeof core): void;
}
declare const _default: Render;

export default _default;
