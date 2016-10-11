
define(['../module'], function(module) {
	module.controller('personcardController', ['$rootScope', 'ngDialog', 'toaster','$scope', "$state",'NWKeyService', function($rootScope, ngDialog, toaster, $scope, $state,NWKeyService) {
	$scope.ismac = NWKeyService.ismac;
	$scope.iswin = NWKeyService.iswin;
	
	$scope.roster = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache({id: $scope.ngDialogData.id});
	$scope.personCardInfo = $scope.roster.vcard;
	$scope.enableVCardFields = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().enableVCardFields;

	$scope.copyOriginal = function(e,mode){
		$scope.original = $scope.original || {}; 
		$scope.original[mode] = $scope.personCardInfo[mode];
	}
	
	$scope.saveMyInfo = function(e,mode){
		var arg = {
			success:function(){
			}
		};
		
		if(!$scope.personCardInfo['name']){
			arg.vcard = arg.vcard || {};
			arg.vcard.name = $scope.personCardInfo['name'] = $scope.personCardInfo['id'];
		}
		
		if($scope.personCardInfo[mode] !== $scope.original[mode]){
			arg.vcard = arg.vcard || {};
			arg.vcard[mode=='name'? 'nickname':mode] = $scope.personCardInfo[mode];
			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().setVCard(arg);
		}
	};
	
	$scope.goToMessageChat = function(item, e) {
		e.preventDefault();
		e.stopPropagation();
		
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
			id: item.id,
			name: item.name,
			type: 'chat',
			sort: true
		});
		
		$rootScope.$broadcast("chatlistmessage");
		
		$state.go("main.imhomeplus.message", {
			personId: item.id,
			personName: item.name,
			chatType: 'chat'
		});
		
		$scope.closeWin();
	};
	
	$scope.closeWin = function(){
		ngDialog.close();
	};
	
	//添加好友
	$scope.addFriend = function(item,e){
		if(item && item.id){
			ngDialog.open({
				template: 'src/modules/yxim/template/confirm-dialog.htm',
				controller: 'confirmController',
				className: '',
				data: {
					title: '添加好友',
					message: '确定要添加'+ item.name +'为好友吗？',
					confirmText: '确定',
					fun: function(e){
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().addRoster(item.id);
						ngDialog.close();
						toaster.pop({
							title: '添加好友请求已发送！',
							type: 'success'
						});
					}
				},
				showClose: false
			});
		}
	};
	
	//同意好友请求
	$scope.approveFriend = function(item,e){
		if(item && item.id){
			ngDialog.open({
				template: 'src/modules/yxim/template/confirm-dialog.htm',
				controller: 'confirmController',
				className: '',
				data: {
					title: '同意添加好友请求',
					message: '确定要同意添加'+ item.name +'为好友吗？',
					confirmText: '确定',
					fun: function(e){
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().approveRoster(item.id);
						ngDialog.close();
						toaster.pop({
							title: item.name + '已成为你的好友！',
							type: 'success'
						});
					}
				},
				showClose: false
			});
		}
	};
	
	//删除好友
	$scope.removeFriend = function(item,e){
		if(item && item.id){
			ngDialog.open({
				template: 'src/modules/yxim/template/confirm-dialog.htm',
				controller: 'confirmController',
				className: '',
				data: {
					title: '删除好友',
					message: '确定要删除'+ item.name +'这个好友？',
					confirmText: '确定',
					fun: function(e){
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().deleteRoster({
							id:item.id,success:function(){
								ngDialog.close();
								toaster.pop({
									title: item.name + '已成功删除！',
									type: 'success'
								});
							}
						});
					}
				},
				showClose: false
			});
		}
	};
	
}])
})




