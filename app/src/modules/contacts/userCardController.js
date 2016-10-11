define(['./module','jquery'], function(module,$) {
    module.controller("userCardController", ["$scope", "contactService","$rootScope","jsonService",function($scope, contactService,$rootScope,jsonService) {
          var data = $scope.ngDialogData;
          var id = data.id;
          var useritem = data.useritem;

        contactService.getUserInfo({
          memberId:id,
          success:function(user){
            // console.log(user);
            if (useritem) {
              $scope.userItem = useritem;
            } else {
              $scope.userItem = null;
            }
            $scope.userCardinfo = null;
            if(user.data){
              $scope.$apply(function(){
                user.data.isNotSelf = jsonService.getJson("esn_user").muid!= user.data.member_id
                user.data.avatar = user.data.avatar+'.thumb.jpg';
                $scope.userCardinfo = user.data;
              });
            } else {
              $scope.userItem = useritem;
            }
          }
        });
        //contactService.getOwnInfo({});
        $scope.followtog = function(memberId,follow_status){
              var param = {
                  memberId:memberId
              }
              if(follow_status == 4 || follow_status == 3){
                  param.status=1;//关注
                  contactService.follow({
                      memberId:memberId,
                      status:1,
                      success:function(data){
                          if(data.status == 1||data.status == 2){
                              $scope.userCardinfo.follow_status =1;
                              $rootScope.$broadcast("initFollowList");
                          }
                      },
                      error:function(data){}
                  });
              }else if(follow_status == 1 || follow_status == 2){
                  param.status=0;//取消关注
                  singleConfirm.getInstance({
                      msg:"您确定要取消关注吗?",
                      confirm:function () {
                         contactService.follow({
                             memberId:memberId,
                             status:0,
                             success:function(data){
                               if(data.status == 4||data.status == 3){
                                   $scope.userCardinfo.follow_status =data.status;
                                   $rootScope.$broadcast("initFollowList");
                                 }
                             },
                             error:function(data){}
                         });
                      }
                  });
              }
        }

  }])
})
