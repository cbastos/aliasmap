// @alias "Transme.Shared.Promise"
(function () {
    "use strict";

    function Promise() {
        var self = this,
            resolved = false,
            callbacks=[],
            errorcallbacks=[],
            args,
            promise;

        this.then = function (clback) {
            promise = new Promise();
            callbacks.push(clback);
            if (resolved) {
                executeCallBack(clback);
            }
            return promise;
        };

        this.resolve = function () {
            args = arguments;
            resolved = true;
            if (callbacks) {
                callbacks.forEach(function (callback) {
                    executeCallBack(callback);
                });               
            }
        };

        this.isResolved = function () {
            return resolved;
        }

        this.error = function (errCallback) {
            errorcallbacks.push(errCallback);
        }

        this.reject = function (data) {
            resolved = true;
            if (errorcallbacks) {
                errorcallbacks.forEach(function (errorCallback) {
                    errorCallback(data);
                });               
            }
        }
        function executeCallBack(callback) {
            if (callback === undefined || callback === null) {
                return;
            }

            var result = callback.apply(self, args);
            if (result && result.then) {
                result.then(promise.resolve);
            }
        }
    }

    module.exports = Promise;

}());