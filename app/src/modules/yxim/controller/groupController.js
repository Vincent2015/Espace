define(['../module'], function(module) {
module.controller("groupController", ["$scope","$rootScope", "$state", function($scope,$rootScope,$state) {


	$scope.groupList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().list;

	$scope.goToMessage_group = function(item, e) {
		e.preventDefault();
		e.stopPropagation();

		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
			id: item.id,
			name: item.name,
			type: 'groupchat',
			sort: true
		});

		$rootScope.$broadcast("chatlistmessage");

		$state.go("main.imhomeplus.message", {
			personId: item.id,
			personName: item.name,
			chatType: 'groupchat'
		});
	};

}])
})
