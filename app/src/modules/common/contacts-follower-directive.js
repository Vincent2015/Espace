define(['./module'], function(module) {


  module.factory('FollowerListService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService',function(CacheList, $http, $q, httpService, BasicCacheService) {



    var FollowerListService = BasicCacheService.extend({
      initialize: function() {

      },
      //获取分组列表
      getFollowGroup: function () {

        var deferred = $q.defer();

        var url = "/user/followGroup";

        this.fetch(url, "FollowGroup")
        .then(function (data) {
          deferred.resolve(data);
        })
        .catch(function (error) {
          deferred.reject(error);
        })

        return deferred.promise;

      }

    });



    return new FollowerListService();

  }])

module.directive('follower',["httpService", "FollowerListService",function(httpService, FollowerListService){
  return {
    restrict: 'AECM',
    templateUrl: 'src/modules/common/contacts-follower-directive.html',
    repalce: true,
    link: function ($scope, element, attrs) {

        console.log("follower===========directive");
        console.log($scope);
        $scope.FollowGroup = FollowerListService.getCacheData("FollowGroup");
        getFollowGroup();

        //响应切换空间事件
        $scope.$on("switchSpace", function () {
          $scope.FollowGroup  = [];
          getFollowGroup();
        })

        function getFollowGroup() {
          FollowerListService.getFollowGroup()
          .then(function (data) {
            console.log(data);
            $scope.FollowGroup = data;
          })
          .catch(function (error) {
            console.log(error);
          })
        }



      }
    }

}])
})
