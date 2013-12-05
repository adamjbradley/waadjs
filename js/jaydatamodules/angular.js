// JayData 1.3.2
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, D�niel J�zsef, J�nos Roden, L�szl� Horv�th, P�ter Nochta
//     P�ter Zentai, R�bert B�nay, Szabolcs Czinege, Viktor Borza, Viktor L�z�r,
//     Zolt�n Gyebrovszki, G�bor Dolla
//
// More info: http://jaydata.org

Object.defineProperty($data.Entity.prototype, "_isNew", {
    get: function () {
        return !this.storeToken;
    }
});
Object.defineProperty($data.Entity.prototype, "_isDirty", {
    get: function () {
        return !this._isNew && this.changedProperties && this.changedProperties.length > 0;
    }
});

var originalSave = $data.Entity.prototype.save;
var originalRemove = $data.Entity.prototype.remove;

var _getCacheKey = function (query) {
    var key = query.expression.getJSON();
    var hash = 0, i, charC;
    if (key.length == 0) return hash;
    for (i = 0; i < key.length; i++) {
        charC = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + charC;
        hash = hash & hash;
    }
    return hash;
}

angular.module('jaydata', ['ng', function ($provide) {

    $provide.factory('$data', function ($rootScope, $q) {
        var cache = {};

        $data.Entity.prototype.hasOwnProperty = function (propName) {
            var member;
            if (this.getType && this.getType().memberDefinitions) {
                if (member = this.getType().memberDefinitions['$' + propName]) {
                    return ("property" === member.kind) && member.enumerable;
                } else {
                    return false;
                }
            }
            return Object.prototype.hasOwnProperty.apply(this, arguments);
        }

        $data.Queryable.prototype.toLiveArray = function (cb) {
            var _this = this;

            var trace = this.toTraceString();
            var cacheKey = _getCacheKey(this); // trace.queryText || trace.sqlText + JSON.stringify(trace.params);

            if (cache[cacheKey]) {
                return cache[cacheKey];
            }

            var result = [];
            cache[cacheKey] = result;

            result.state = "inprogress";
            result.successHandlers = [];
            result.errorHandlers = [];

            
            if (cb && typeof cb === 'function') {
                chainOrFire(cb, "success");
            }

            function chainOrFire(cb, type) {
                if (!cb) return;
                var targetCbArr = type === "success" ? result.successHandlers : result.errorHandlers;
                if (result.state === "completed") {
                    cb(result);
                } else {
                    targetCbArr.push(cb);
                }
                return result;
            }

            result.then = result.success = function (cb) {
                return chainOrFire(cb, "success");
            };

            result.error = function (cb) {
                return result;
            };

            result.refresh = function (cb) {
                //result = [];
                result.length = 0;
                result.state = "inprogress";
                chainOrFire(cb, "success");
                _this.toArray({ success: result.resolve, error: result.reject });
                return result;
            }

            result.resolve = function (items) {
                result.state = "completed";
                items.forEach(function (item) {
                    result.push(item);
                });
                result.successHandlers.forEach(function (handler) {
                    handler(result);
                });
                if (!$rootScope.$$phase) $rootScope.$apply();
            }

            result.reject = function (err) {
                result.state = "failed";
                result.errorHandlers.forEach(function (handler) {
                    handler(err);
                });
                if (!$rootScope.$$phase) $rootScope.$apply();
            }

            this.toArray({ success: result.resolve, error: result.reject });

            return result;
        };

        $data.Entity.prototype.save = function () {
            var _this = this;
            var d = $q.defer();
            originalSave.call(_this).then(function () {
                cache = {};
                d.resolve(_this);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            return d.promise;
        }

        $data.Entity.prototype.remove = function () {
            var d = $q.defer();
            var _this = this;
            originalRemove.call(_this).then(function () {
                cache = {};
                d.resolve(_this);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            
            return d.promise;
        }

        $data.EntityContext.prototype.liveSaveChanges = function () {
            var _this = this;
            var d = $q.defer();
            _this.saveChanges().then(function (n) {
                cache = {};
                d.resolve(n);
                if (!$rootScope.$$phase) $rootScope.$apply();
            }).fail(function (err) {
                d.reject(err);
                if (!$rootScope.$$phase) $rootScope.$apply();
            });
            return d.promise;
        }
        return $data;
    });
}]);
