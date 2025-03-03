import { DONE } from './readyState.js';
import { OK } from './status.js';
var xmlHttpRequestFetcher = function (url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== DONE) return;
      xhr.status === OK
        ? resolve(xhr.responseText)
        : reject(xhr.status + ' ' + xhr.statusText);
    };
    xhr.open('GET', url, true);
    xhr.send();
  });
};
export default xmlHttpRequestFetcher;
//# sourceMappingURL=index.js.map
