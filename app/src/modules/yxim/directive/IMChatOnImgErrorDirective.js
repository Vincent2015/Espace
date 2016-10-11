define(['../module'], function(module) {
module.directive("onImgError", [
	function() {
		return {
			restrict: "AE",
			link: function(scope,element,attrs) {
				    element.bind('error', function() {
				        if (attrs.src != attrs.onImgError) {
				          attrs.$set('src', attrs.onImgError);
				        }
				    });    
			}
		}
	}
])
})