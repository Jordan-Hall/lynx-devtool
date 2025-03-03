var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as http from "http";
import * as https from "https";
/**
 * Get's a url. Compatible with http and https.
 */
var get = function (url) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (typeof url !== "string") {
        return {
            on: function (eventName, callback) {
                callback(new Error("URL must be a string."));
            }
        };
    }
    return url.indexOf("https://") === 0
        ? https.get.apply(https, __spreadArrays([url], args)) : http.get.apply(http, __spreadArrays([url], args));
};
/**
 * Get's a URL and returns a Promise
 */
var nodeFetcher = function (url) {
    return new Promise(function (resolve, reject) {
        get(url, function (res) {
            var data = null;
            // called when a data chunk is received.
            res.on("data", function (chunk) {
                if (data === null) {
                    data = chunk;
                    return;
                }
                data += chunk;
            });
            // called when the complete response is received.
            res.on("end", function () { return resolve(data); });
        }).on("error", reject);
    });
};
export default nodeFetcher;
//# sourceMappingURL=nodeFetcher.js.map