define(['./module'], function(module) {

  module.factory('frendListService', ['CacheList', '$http', '$q', 'httpService', function(CacheList, $http, $q, httpService) {


    function frendListService() {

    }

    frendListService.prototype = new CacheList();


    frendListService.prototype.loadData = function() {



      var deferred = $q.defer();

      httpService.dataServiceQ('get', "/user/daily")
        .then(function(data) {
          if (data.code == 0) {
                for (var k=0;k<data.data.length;k++){
                           data.data[k].avatar += '.thumb.jpg';
                         }
            this.set("user_daily", data);
            deferred.resolve(data.data);

          } else {
            deferred.reject(data);
          }
        }.bind(this))

      .catch(function(error) {
        // console.log("frendListService final error");
        deferred.reject(error);
      }.bind(this))

      return deferred.promise;
    }

    frendListService.prototype.getData = function() {

      var pre_data = this.get("user_daily");
      data = pre_data ? pre_data.data : "";

      return data;
    }


    // console.log("frendListService");

    return new frendListService();

  }])
  module.controller("frendListController", ["$scope", "httpService", "frendListService", function($scope, httpService, frendListService) {

    //响应切换空间事件
    $scope.$on("switchSpace", function () {
      $scope.frendListMananger  = [];
      frendListService.set("user_daily", {});
      $scope.loadData();
    })

    //init入口
    $scope.init = function() {
      // console.log("frendListController");
      var data = frendListService.getData();
      $scope.frendListMananger = data || "";

      $scope.loadData();
    }

    $scope.loadData = function() {
      frendListService.loadData()
        .then(function(data) {
          // console.log("success");
          // console.log(data);

          $scope.frendListMananger = data;

        })
        .catch(function(error) {
          // console.log("error");
          // console.error(error);
        })
    }




  }])

})
