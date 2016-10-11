define(['../module','jquery'], function(module,$) {
module.controller('personalSettingController', ['$rootScope', '$scope', 'urlParseService', '_', '$stateParams', '$state', 'ngDialog', "toaster", function($rootScope, $scope, urlParseService, _, $stateParams, $state, ngDialog, toaster) {
    var data = $scope.ngDialogData;
    var entity = data.entity;
    var ngDialogId = $scope.ngDialogId;
    // console.log($scope);
    var param = $.extend(true, {}, data.chatinfo);
    $scope.param = param;
    $scope.entity = entity;




   $scope.goStick = function(){
       if(!$scope.entity.stick){
         YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().stick({
           to:$scope.entity.id,
           type:'chat',
           success:function(data){
                $rootScope.$broadcast("chatlistmessage");
            }});
       }else{
         YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().cancelStick({
           to:$scope.entity.id,
           type:'chat',
           success:function(data){
              $rootScope.$broadcast("chatlistmessage");
           }});
       }
  	}
    $scope.goMute = function(){
      if (!$scope.entity.mute){
          YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().mute({
            to:$scope.entity.id,
            type:'chat',
            success:function(){
                $rootScope.$broadcast("chatlistmessage");
            }
          });
      }else{
        YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().cancelMute({
          to:$scope.entity.id,
          type:'chat',
          success:function(){
              $rootScope.$broadcast("chatlistmessage");
          }
        });
      }
  }
	$scope.closeDiag = function() {
		$(".esn-right-dialog").addClass("esn-right-dialog-out");
		setTimeout(function() {
				ngDialog.close();
			}, 420)
	}
	$scope.invitePerson = function(event) {
    event.stopPropagation();
    event.preventDefault();
    if ($rootScope.qz_user_type != 0 && $rootScope.qz_user_type != 1) {
     return;
    }
    ngDialog.open({
     template: 'src/modules/common/contacts.html',
     controller: 'contactsController',
     className: 'dudu-right-dialog-w',
     closeByDocument:true,
     showClose: false,
     overlay: false,
     data: {
       getSelectedListModule: 'invitePerson',
       chatinfo:data.chatinfo
     }
    });
  }

    /***监听添加人员事件**/
    $scope.$on("getSelectedList.invitePerson", function (e,data,ngDialogId) {
        var member_id_array = [];
        var useForCach = [];
        if(data){
            for(var i in data){
                useForCach.push(data[i].name);
               if(!!data[i].id){
                  member_id_array.push(data[i].id);
               }else if(!!data[i].member_id){
                  member_id_array.push(data[i].member_id);
               }
            }
            YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().createChatGroup({
        			name:useForCach.toString(),
        			members:member_id_array,
        			success:function(group){
        				if(!!group){
        					ngDialog.close();
        					toast('群组创建成功！');
        					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
        						id: group.id,
        						name: group.name,
        						type: 'groupchat',
        						sort: true
        					});
        					$state.go("main.imhomeplus.message", {
        						personId: group.id,
        						personName: group.name,
        						chatType: 'groupchat'
        					});
        				}
        			}
        		});

        }

    });

}])
})
