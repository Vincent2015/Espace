define(['../module'], function(module) {
	module.directive('switchtool', ['$http', function($http) {
		 return {
					restrict:'AE',
					replace:true,
					scope:{troggle:'='},
					template:'<div ng-class={"esn-grpset-set-item-switch":true,"esn-grpset-set-item-switch-on":troggle,"esn-grpset-set-item-switch-off":!troggle}></div>',
					link: function($scope, element, attrs) {
							$(element).on('click',function(e){
								// e.stopPropagation();
								// e.preventDefault();
								$scope.troggle = !$scope.troggle;
							})
					 }
				}

	}]);
})
