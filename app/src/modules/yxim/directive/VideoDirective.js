define(['../module'], function(module) {
	module.directive('vi', ['$sce', function($sce) {
		 return {
					restrict:'AE',
					replace:true,
					scope:{
						path : "=path"
					},
          sce:true,
					template:'<video controls="controls"></video>',
					link: function($scope, element, attrs) {
            debugger
            var path = $sce.trustAsResourceUrl($scope.path);
            var source = '<source src="'+path+'" type="video/mp4">';
            element.append(source);
					 }
				}

	}]);
})
