define(['./module','jquery'], function(module,$) {
      module.controller("organizationController", ["$scope", "organizationService","$stateParams","$rootScope",'$state', function($scope, organizationService,$stateParams,$rootScope,$state) {
        // console.log($rootScope);
      var name =  $stateParams["name"] || $rootScope.deptArray[0].name;
      var deptId =  $stateParams["deptId"] || $rootScope.deptArray[0].deptId;

      //响应切换空间事件
      $scope.$on("switchSpace", function () {
         $state.go('main.contact.organization', $rootScope.zoneArray);
      })
      $scope.deptId = deptId;
      for(var i=0;i<$rootScope.deptArray.length;i++){
          if($rootScope.deptArray[i].deptId == deptId){
                $rootScope.deptArray = $rootScope.deptArray.slice(0,i+1);
                break;
          }else{
              $rootScope.deptArray.push({deptId:deptId,name:name});
          }
      }

  }])
})
