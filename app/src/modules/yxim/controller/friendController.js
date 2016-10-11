define(['../module'], function(module) {
module.controller("friendController", ["$scope", "$state", "$rootScope", "_", "$interval", function($scope, $state, $rootScope, _, $interval) {

	var followCtrl = $scope.followCtrl = {
		init: function() {
			$scope.followList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("friend").concat(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("ask"));
			
			if(!!$scope.followList && $scope.followList.length){
				$scope.followList.sort(function(a,b){return (a.name || '').localeCompare(b.name || '')})
			}
		}
	}
	
	$scope.statename = $rootScope.$state;
	$scope.userStates = [];

	$scope.getUserCurrentState = function(item){
		var isonline = false;
		for (var j = 0; j < $rootScope.userStatesList.length; j++) {
			if ($rootScope.userStatesList[j].userid == item.id)
				for (var i = 0; i < $rootScope.userStatesList[j].presence.length; i++) {
					if ($rootScope.userStatesList[j].presence[i].available == 1) {
						isonline = true;
						break;
					}
				};
		}
		return isonline;
	};

	followCtrl.init();

	//我的关注列表,点击进入聊天界面
	$scope.goToMessage_follow = function(item, e) {
		e.preventDefault();
		e.stopPropagation();
		
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
			id: item.id,
			name: item.name,
			type: 'chat',
			sort: true
		});
		
		$rootScope.$broadcast("chatlistmessage");
		
		$state.go("main.imhomeplus.message", {
			personId: item.id,
			personName: item.name,
			chatType: 'chat'
		});

	}
}])

})

