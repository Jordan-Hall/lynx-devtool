/**
 * Memoizes a 1-arity function
 *
 * @param {Function} func Function to memoize
 * @returns {Function} Memoized version of func.
 */
declare const memoize: (func: any) => (key: any) => any;
export default memoize;
