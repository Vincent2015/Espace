define(['./module'], function(module) {


  module.factory('TeamListService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService',function(CacheList, $http, $q, httpService, BasicCacheService) {



    var TeamListService = BasicCacheService.extend({
      initialize: function() {
          this.limit = 15;
          this.page = 1;
      },
      // 获取团队列表
      getTeamList: function (limit, page) {

        var deferred = $q.defer();

        this.limit = limit;
        this.page = page;

        var url = "/group/list/" + this.limit + "/" + this.page;

        if (this.page == 1 ) {
          this.fetch(url, "TeamListPage1")
          .then(function (data) {
            deferred.resolve(data);
          })
          .catch(function (error) {
            deferred.reject(error);
          })

        } else {
          this.fetch(url, "")
          .then(function (data) {
            deferred.resolve(data);
          })
          .catch(function (error) {
            deferred.reject(error);
          })
        }


        return deferred.promise;

      }

    });



    return new TeamListService();

  }])

module.directive('team',["httpService", "TeamListService",function(httpService, TeamListService){
  return {
    restrict: 'AECM',
    templateUrl: 'src/modules/common/contacts-team-directive.html',
    repalce: true,
    link: function ($scope, element, attrs) {

      console.log("team===========directive");

      $scope.teamList = TeamListService.getCacheData("TeamListPage1");

      $scope.limit = 15;
      $scope.page = 1;
      $scope.loadingStep = 0; //0 表示可以加载 1 表示正在加载


      getTeamList($scope.limit, $scope.page);

      initScroll();

      function getTeamList(limit, page) {
        TeamListService.getTeamList(limit, page)
          .then(function(data) {
            console.log("success");
            console.log(data);
            $scope.loadingStep = 0;
            if ($scope.page > 1) {
              $scope.teamList = $scope.teamList ? $scope.teamList.concat(data) : data;
            } else {
              //$scope.page == 1  这个时候去更新缓存
              $scope.teamList = data;
            }
          })
          .catch(function(error) {
            $scope.loadingStep = 0;
            //page -1
            $scope.page--;
            console.log("error");
            console.error(error);
          })
      }

      function initScroll() {
        $(".contacts_body_detail .c-p-container").scroll(function() {

          if ($scope.selected_num != 2) {
            return;
          }

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
              //page + 1
              $scope.page++;
              getTeamList($scope.limit, $scope.page);
            }
          }

        });
      }


    }
  }

}])
})
