define(['./module','jquery'], function(module,$) {
  module.controller("showContactSearchDetailController", ["$scope","$stateParams","contactService","jsonService",function($scope,$stateParams,contactService,jsonService) {
      var ownerId = jsonService.getJson("esn_user").muid;
      $scope.ownerId = ownerId;
      $scope.detailInfo = {};
      contactService.getUserInfo({
          memberId:$stateParams['id'],
          success:function(data){
            $scope.$apply(function(){
              $scope.detail = data.data;
              $scope.detailInfo =  data.data;
              // console.log(data.data);
              $scope.detail.deptName = $stateParams['deptName']
            });
          }
      });

      $scope.followMember = function(memberId,follow_status){
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
                            $scope.detail.follow_status =1;
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
                                 $scope.detail.follow_status =data.status;
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
