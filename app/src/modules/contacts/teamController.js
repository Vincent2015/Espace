define(['./module'], function(module) {

  module.factory('teamService', ['CacheList', '$http', '$q', 'httpService', function(CacheList, $http, $q, httpService) {


    function teamService() {
    }

    teamService.prototype = new CacheList();


    teamService.prototype.loadData = function(gid) {

      var deferred = $q.defer();
      var groupId = gid;

      httpService.dataServiceQ('get', "/group/member/"+ groupId +"/1")
        .then(function(data) {
          var deferred = $q.defer();
          if (data.code == 0) {
            var totalMemberCount = data.data["totalMemberCount"];
            // var groupId = 566;
            //FIXME startTime = 0 或者不传 每次先刷得最新数据
            this.startTime = data.data["startTime"];

            httpService.dataServiceQ('get', "/group/member/"+ groupId +"/"+totalMemberCount)
            .then(function (data) {

              
              if (data.code == 0) {
                 for (var k=0;k<data.data.adminList.length;k++){
                    data.data.adminList[k].avatar += '.thumb.jpg';
                }
                for (var m=0;m<data.data.memberList.length;m++){
                    data.data.memberList[m].avatar += '.thumb.jpg';
                }
                this.set(gid, data);
                deferred.resolve(data.data);
              } else {
                deferred.reject(data);
              }

            }.bind(this))
            .catch(function(error) {
              deferred.reject(error);
            }.bind(this))


          } else {
            deferred.reject(data);
          }
          return deferred.promise;
        }.bind(this))
        .then(function (data) {
          deferred.resolve(data);
        }.bind(this))
        .catch(function(error) {
          // console.log("final error");
          deferred.reject(error);
        }.bind(this))

      return deferred.promise;
    }

    teamService.prototype.getData = function (gid) {
      var pre_data = this.get(gid);
      var data = pre_data ? pre_data.data: "";
      return data;
    }

    // console.log("teamService");

    return new teamService();

  }])
  module.controller("teamController", ["$scope", "httpService","teamService", "$stateParams","$state",function($scope, httpService, teamService,$stateParams,$state) {

    // console.log("teamController");

    //响应切换空间事件
    $scope.$on("switchSpace", function () {
      //FIXME ..
      teamService.clear();
    })


    var data = teamService.getData($stateParams["gid"]);
    $scope.groupMananger = data || "";
    $scope.group_name = $stateParams["group_name"];

      teamService.loadData($stateParams["gid"])
      .then(function(data) {
        // console.log("success");
        // console.log(data);
        $scope.groupMananger = data;
      })
      .catch(function(error) {
        // console.log("error");
        // console.error(error);
      })


    $scope.goBack = function () {
      $state.go("main.contact.teamlist");
    }

    // 进入团队聊天
    $scope.createTeamGroupChat = function () {

      var id = 'group_' + currentSpaceId + '_' + $stateParams["gid"];
      console.log($stateParams["group_name"]);
      YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
        id: id,
        name: $stateParams["group_name"],
        type: 'groupchat',
        sort: true
      });
      $state.go("main.imhomeplus.message", {
        personId: id,
        personName: $stateParams["group_name"],
        chatType: 'groupchat',
      });
      $('.esn-im-nav-row').removeClass('active');
      document.getElementById("message_mod").classList.add("active");
    }

  }])

})
