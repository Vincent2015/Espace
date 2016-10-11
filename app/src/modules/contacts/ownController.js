define(['./module','jquery'], function(module,$) {
    module.controller("ownController", ["$scope", "contactService","$rootScope","jsonService",function($scope, contactService,$rootScope,jsonService) {

        contactService.getOwnInfo({
          success:function(result) {

            var esn_user_new = jsonService.getJson("esn_user");
            esn_user_new["duty"] = result.data.duty;
            esn_user_new["dept_name"] = result.data.dept_name;
            esn_user_new["company"] = result.data.company;
            esn_user_new["mobile"] = result.data.mobile;
            esn_user_new["email"] = result.data.email;
            jsonService.setJson("esn_user", JSON.stringify(esn_user_new));

            $scope.$apply(function(){
              $scope.esnUser = esn_user_new;
            });
          },
          error:function (data) {

          }
        });


  }])
})
