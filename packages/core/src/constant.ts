/**
 * Global constant
 *
 * Will be replaced by the 'rollup-plugin-replace' plug-in
 */

 /**
 * Neep code version
 */
export const version = '__VERSION__' as string;
/**
 * Is the current mode production mode
 * @description Support tree shaking
 */
export const isProduction = process.env.NODE_ENV === 'production';
