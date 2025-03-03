import memoize from './memoize.js';
import xmlHttpRequestFetcher from './xmlHttpRequestFetcher/index.js';
var isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
/* istanbul ignore next - difficult to test */
var defaultFetcher = isBrowser ? xmlHttpRequestFetcher : nodeFetcher;
var defaultRequires = function (name) {
  throw new Error(
    "Could not require '" +
      name +
      "'. The 'requires' function was not provided.",
  );
};
export var createLoadRemoteModule = function (_a) {
  var _b = _a === void 0 ? {} : _a,
    requires = _b.requires,
    fetcher = _b.fetcher;
  var _requires = requires || defaultRequires;
  var _fetcher = fetcher || defaultFetcher;
  return memoize(function (url) {
    return _fetcher(url).then(function (data) {
      var exports = {};
      var module = { exports: exports };
      var func = new Function('require', 'module', 'exports', data);
      func(_requires, module, exports);
      return module.exports;
    });
  });
};
//# sourceMappingURL=loadRemoteModule.js.map
