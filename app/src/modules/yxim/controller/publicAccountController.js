define(['../module'], function(module) {
module.controller('publicAccountController', ['$rootScope', '$scope', "$state", '_', function($rootScope, $scope, $state, _) {

	$scope.publicAccountList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getPubAccountManager().list;

	$scope.tabShowFlag = true;

	$scope.goToMessage_pubaccount = function(item, e) {
		e.preventDefault();
		e.stopPropagation();
		
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
			id: item.id,
			name: item.name,
			type: 'pubaccount',
			sort: true
		});
		
		$rootScope.$broadcast("chatlistmessage");
		
		$state.go("main.imhomeplus.message", {
			personId: item.id,
			personName: item.name,
			chatType: 'pubaccount'
		});
	};

}])
})