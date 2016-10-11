define(['./module'], function(module) {
  module.controller("talkgroupDetailController", ["$scope", "httpService", "$stateParams","$state",function($scope, httpService, $stateParams,$state) {
    $scope.sub = {
      talkgroupDetail : null
    }
    // console.log("talkgroupDetailController"+$stateParams["gid"]);
    var manager =  YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager();

  	$scope.entity = manager.get($stateParams["gid"]);
    //FIXME
    // console.log($scope.entity);
    // getUserInfo : function (params) {
    //     httpService.dataService("get","/user/info/"+params.memberId,function (json) {
    //         if(json && json.data){
    //             params.success(json.data);
    //         }
    //     },function (fail) {});
    // }
    // for (var i = 0; i < array.length; i++) {
    //   array[i]
    // }
    $scope.goToMessage = function(item) {
      $('.esn-im-nav-row').removeClass('active');
      document.getElementById("message_mod").classList.add("active");
      YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
        id: item.id,
        name: item.name,
        type: "groupchat",
        sort: true
      });
  		$scope.$emit("chatHistoryListChange_toparent", item);
      $state.go("main.imhomeplus.message", {
        personId: item.id,
        personName: item.name,
        chatType: "groupchat"
      });
    }
  }]);

})
