/** 
 * Global constant
 * 
 * Will be replaced by the 'rollup-plugin-replace' plug-in
 */
export const version = '__VERSION__';
/**
 * Current operating mode
 * @enum production
 * @enum development
 */
export const mode = '__MODE__' as string;
export const isProduction = mode === 'production';
