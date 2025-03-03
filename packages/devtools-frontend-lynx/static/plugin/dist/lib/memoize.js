/**
 * Memoizes a 1-arity function
 *
 * @param {Function} func Function to memoize
 * @returns {Function} Memoized version of func.
 */
var memoize = function (func) {
  var cache = {};
  return function (key) {
    // if (key in cache == false) {
    //     cache[key] = func(key);
    // }
    // return cache[key];
    return func(key);
  };
};
export default memoize;
//# sourceMappingURL=memoize.js.map
