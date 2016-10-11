define(['./module'], function(module) {

  module.factory('teamListService', ['CacheList', '$http', '$q', 'httpService', function(CacheList, $http, $q, httpService) {


    function teamListService() {
      this.limit = 15;
      this.page = 1;
    }

    teamListService.prototype = new CacheList();


    teamListService.prototype.loadData = function(limit, page) {

      this.limit = limit;
      this.page = page;

      var deferred = $q.defer();
      httpService.dataServiceQ('get', "/group/list/" + this.limit + "/" + this.page)
        .then(function(data) {
          if (data.code == 0) {
            //缓存第一页的数据
            if (this.page == 1) {
              this.set("page1_data", data);
            }

            deferred.resolve(data.data);

          } else {
            deferred.reject(data);
          }
        }.bind(this))

      .catch(function(error) {
        // console.log("teamListService final error");
        deferred.reject(error);
      }.bind(this))

      return deferred.promise;
    }

    teamListService.prototype.getPage1Data = function() {

      var pre_data = this.get("page1_data");
      data = pre_data ? pre_data.data : "";

      return data;
    }

    // console.log("teamListService");

    return new teamListService();

  }])
  module.controller("teamListController", ["$scope", "httpService", "teamListService", function($scope, httpService, teamListService) {

    // console.log("teamListController");

    var data = teamListService.getPage1Data();
    $scope.sub_organization = data || "";

    $scope.limit = 15;
    $scope.page = 1;
    $scope.loadingStep = 0; //0 表示可以加载 1 表示正在加载

    //响应切换空间事件
    $scope.$on("switchSpace", function () {
      $scope.sub_organization  = [];
      teamListService.set("page1_data", {});
      $scope.loadData();
    })


    $scope.init =function () {
      $scope.loadData($scope.limit, $scope.page);
    }

    $scope.loadData = function(limit, page) {
      teamListService.loadData(limit, page)
        .then(function(data) {
          // console.log("success");
          // console.log(data);
          $scope.loadingStep = 0;
          if ($scope.page > 1) {
            $scope.sub_organization = $scope.sub_organization ? $scope.sub_organization.concat(data) : data;
          } else {
            //$scope.page == 1  这个时候去更新缓存
            $scope.sub_organization = data;
          }
        })
        .catch(function(error) {
          $scope.loadingStep = 0;
          // console.log("error");
          // console.error(error);
        })
    }

    $(".contact-teamlist").scroll(function() {

      var viewH = $(this).height(); //可见高度
      var contentH = $(this).get(0).scrollHeight; //内容高度

      $scope.scrollTopPre = $scope.scrollTop;
      $scope.scrollTop = $(this).scrollTop(); //滚动高度

      if ($scope.scrollTopPre) {
        $scope.delta = $scope.scrollTop - $scope.scrollTopPre;

      }

      if ($scope.loadingStep == 0) {
        if (contentH - viewH - $scope.scrollTop <= 20 && $scope.delta >0 ) {
          $scope.loadingStep = 1;
          $scope.page++;
          $scope.loadData($scope.limit, $scope.page);
        }
      }

    });


  }])

})
