define(['./module'], function(module) {
  module.factory('PhoneHistoryManager', ['CacheList', '$http', '$q', function(CacheList, $http, $q) {

    function Phone(arg) {
      if (arg) {
        this.setData(arg);
      }
    }

    Phone.prototype.setData = function(arg) {
      angular.extend(this, arg);
    }



    function PhoneHistoryManager() {
      var arr = [{
        id: 1,
        time: "2015-08-08 9:00",
        name: "张三",
        time0: "40分钟"
      }, {
        id: 2,
        time: "2015-09-08 4:00",
        name: "西门",
        time0: "42分钟"
      }];
      _.each(arr, function(each) {
        this.updateCache(each);
      }.bind(this))
    }
    PhoneHistoryManager.prototype = new CacheList();


    PhoneHistoryManager.getInstance = function() {
      if (!this._instance) {
        this._instance = new PhoneHistoryManager();
      }
      return this._instance;
    };

    PhoneHistoryManager.prototype.updateCache = function(arg) {
      if (arg && arg.id) {
        var instance = this.get(arg.id);
        if (instance) {
          instance.setData(arg);
        } else {
          instance = new Phone(arg);
          this.set(instance.id, instance);
        }
        return instance;
      }
    };



    PhoneHistoryManager.prototype.loadData = function() {

      var deferred = $q.defer();

      var obj = {
        method: 'GET',
        url: "/w",
        timeout: 10000 //设置为10s后超时
      };
      console.log(obj);

      $http.get(obj)
        .success(function(data) {

          data.forEach(function(each) {
            this.updateCache(each);

          }.bind(this));

          deferred.resolve(this.getAll());
        }.bind(this))
        .error(function() {
          deferred.reject(this.getAll());
        }.bind(this));

      return deferred.promise;
    }



    return PhoneHistoryManager.getInstance();

  }])
})
