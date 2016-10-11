define(['./module'], function(module) {
  module.factory('CacheList', [function() {

    function CacheList() {
      this.list = {};
    }

    CacheList.prototype.set = function(key, val) {
      if (key && val) {
        this.list[key] = val;
      }
    };

    CacheList.prototype.get = function(key) {
      if (key) {
        return this.list[key];
      }
      return this.list;
    };

    CacheList.prototype.getAll = function() {
      return this.list;
    };

    CacheList.prototype.reset = function(list) {
      if (_.isArray(list)) {
        _.each(list, function (value, key) {
          if (value.id) {
            this.list[value.id] = value;
          }
        }.bind(this));
      }
    };

    CacheList.prototype.remove = function(key) {
      if (key) {
        delete this.list[key];
      }
    };

    CacheList.prototype.update = function(key, val) {
      this.set.apply(this, arguments);
    };

    CacheList.prototype.clear = function() {
      this.list = {};
    };

    return CacheList;
  }])
})
