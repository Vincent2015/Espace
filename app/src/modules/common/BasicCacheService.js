define(['./module'], function(module) {
  module.factory('BasicCacheService', ['CacheList', 'httpService','$q',function(CacheList, httpService, $q) {

    function BasicCacheService(attributes) {
      BasicCacheService.superClass.constructor.apply(this, arguments);

      if (_.isObject(attributes)) _.extend(this, attributes);

      this.initialize.apply(this, arguments);
    }

    inherit_extend(BasicCacheService, CacheList);

    BasicCacheService.prototype.initialize = function () {}


    //从服务器拉取数据 get请求
    BasicCacheService.prototype.fetch = function(url, field) {

      var url = url || this.url;


      var deferred = $q.defer();

      httpService.dataServiceQ('get', url)
        .then(function(data) {
          if (data.code == 0) {

            if(field) this.set(field, data);

            deferred.resolve(data.data);

          } else {
            deferred.reject(data);
          }
        }.bind(this))

      .catch(function(error) {
        console.log("httpService final error");
        deferred.reject(error);
      }.bind(this))

      return deferred.promise;
    };


    BasicCacheService.prototype.getCacheData = function(field) {
      if (field) {
        var pre_data = this.get(field);
        var data = pre_data ? pre_data.data : "";
        return data;
      }

    };

    BasicCacheService.extend = function(protoProps) {
      var parent = this;
      if (_.isFunction(protoProps)) {
        inherit_extend(protoProps, parent);
        return protoProps;
      } else if (_.isObject(protoProps)) {
        var child;

        // The constructor function for the new subclass is either defined by you
        // (the "constructor" property in your `extend` definition), or defaulted
        // by us to simply call the parent constructor.
        if (protoProps && _.has(protoProps, 'constructor')) {
          child = protoProps.constructor;
        } else {
          child = function() {
            return parent.apply(this, arguments);
          };
        }
        inherit_extend(child, parent);
        if (protoProps) _.extend(child.prototype, protoProps);
        return child;
      }

    }



    return BasicCacheService;
  }])
})
