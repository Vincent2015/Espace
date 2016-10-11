define(['./module'], function(module) {
  module.controller("discussionGroupController", ["$scope","$state","$stateParams","imService",'pushService', function($scope,$state,$stateParams,imService,pushService) {
    // console.log("discussionGroupController");
    $scope.imType = "discussiongroup";
    $scope.winInfo = imService.winInfo;
    // var esnuser = JSON.parse(localStorage.getItem('esn_user'));
    $scope.user_mid =imService.getUserInfo().muid;



    $scope.id ='tg_' + $stateParams.id;
    var newMsgCount = $stateParams.newMsgCount;
    pushService.curScope = $scope;
    $scope.list=[];

    window.currentWin = imService.initWinResultMapping[$scope.id];
    if(!window.currentWin){
      imService.InitWin($scope.id,({
          success:function(data) {
              imService.initWinResultMapping[$scope.id]=data.data;
              window.currentWin = data.data;
              window.currentWin.sid = 'tg_'+data.data.fid;
              if (window.allUnMsgCount<=0){
                jQuery('#message_mod span').css('display','none')
              }else{
                 imService.upnoreadmsg(newMsgCount);
              }

              $scope.loadMessage({isLoadMore:false});
          },
          error:function(err) {
            // body...
          }
        }));
    }else{
      window.currentWin.sid = 'tg_'+imService.initWinResultMapping[$scope.id].fid;
      window.setTimeout(function(){
        $scope.$apply(function(){
          $scope.loadMessage({isLoadMore:false});
        }
        );
      },100);
    }



  }])

})
