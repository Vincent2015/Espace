define(['./module','jquery'], function(module,$) {

  module.directive('followgroup', ["followersService",function(followersService) {
     return {
           restrict:'AE',
           replace:true,
           scope: false,
           templateUrl:"followgroup.html",
           link: function($scope, element, attrs) {
           }
        }

  }])




});
