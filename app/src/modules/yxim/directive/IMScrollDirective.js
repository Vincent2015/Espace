define(['../module'], function(module) {
	module.directive('imScroll', [ function() {
		 return {
					restrict:'AE',
					replace:true,
					scope:false,
					template:"",
					link: function($scope, element, attrs) {
						var isLoading = false;
						var curScrollHeight = 0,beforeScrollTop=0;
						element.bind("scroll",function(e){
              var scrollTop = element[0].scrollTop;
							if(scrollTop<beforeScrollTop){
							  if(element[0].scrollTop<2){
									if(isLoading){return;}
									curScrollHeight = element[0].scrollHeight;
									$scope.pullHistoryMessage(function(){
										isLoading = false;
										window.setTimeout(function(){
											element[0].scrollTop = element[0].scrollHeight - curScrollHeight;
										},0);
									});
								}
							}
							beforeScrollTop = scrollTop;
						});
					}
				}

	}]);
})
