define(['../module'], function(module) {
module.controller('confirmController', ['$rootScope', 'ngDialog','$scope', "$state", function($rootScope,ngDialog, $scope, $state) {
	/**
	 * 关闭详情窗口 
	 */
	$scope.closeDetailDialog = function(e){
		jQuery('.IMChat-group-slide').addClass('beforeHide');
		setTimeout(function(){
			jQuery('.IMChat-group-slide').removeClass('beforeHide').addClass('hidden');			
		},500);
		ngDialog.close();
	};
	
	/**
	 * 取消 
	 */
	$scope.cancel = function(){
		ngDialog.close();
	};
}])
})

