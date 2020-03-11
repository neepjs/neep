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
 * Current mode
 * @enum production
 * @enum development
 */
export const mode = '__MODE__' as any as 'production' | 'development';
/**
 * Is the current mode production mode
 * @description Support tree shaking
 */
export const isProduction = mode === 'production';
