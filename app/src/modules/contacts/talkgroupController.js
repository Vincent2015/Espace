define(['./module'], function(module) {

  module.controller("talkgroupController", ["$scope", "httpService", "$stateParams","$state",function($scope, httpService, $stateParams,$state) {
    $scope.sub = {
      talkgroup : null
    }
		var recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();;
    // console.log("talkgroupController");
    // console.log("===================");

    var talkgroup_data = [];
    for (var i = 0; i < recentList.length; i++) {
      if(recentList[i].type == "groupchat"){
        talkgroup_data.push(recentList[i]);
      }
    }
    $scope.sub.talkgroup = talkgroup_data;
    // console.log($scope.sub.talkgroup);
  }]);

})
