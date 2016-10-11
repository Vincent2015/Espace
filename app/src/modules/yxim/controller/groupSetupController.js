define(['../module'], function(module) {
module.controller('groupSetupController', ['$rootScope', '$scope', 'urlParseService', '_', '$stateParams', '$state', 'ngDialog', "toaster", function($rootScope, $scope, urlParseService, _, $stateParams, $state, ngDialog, toaster) {
	
	$scope.group = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().get($stateParams.personId);
	$scope.myself = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("myself")[0];
	
	if($scope.group.owner && $scope.group.owner.id == $scope.myself.id){
		$scope.isOwner = true;
	}
	
	var recent = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().get($scope.group.id);
	$scope.group.stick = recent.stick;
	
	//群组置顶
	$scope.$watch('group.stick',function(newValue,oldValue){
		if(newValue !== oldValue){
			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
				id:$scope.group.id,
				stick: newValue
			});
			$rootScope.$broadcast("chatlistmessage");
		}
	});
	
	var modifyTimer = null;
	var groupName = $scope.group.name;
	
	/**
	 * 保存群组信息 
	 * @param {Object} e
	 * @param {Object} mode
	 */
	$scope.saveProjectDetail = function(e,mode){
		var message = null;
		
		switch(mode){
			case 'name':
			if(!$scope.group.name ||  $scope.group.name == groupName){
				$scope.group.name = groupName;
				return;
			}
			message = '群组名称已更改！';
			groupName = $scope.group.name;
			$rootScope.$broadcast("chatlistmessage");
			break;
			default:break;
		}
			
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().modifyChatGroupInfo({
			to:$scope.group.id,
			name:$scope.group.name,
			success:function(group){
				if(!!group){
					toaster.pop({
					 	title: message,
					 	type: 'success'
					});
				}
			}
		});
	};
	
	/**
	 * 时间控件 
	 * @param {Object} e
	 */
	$scope.openTimer = function(e){
		if($scope.isOwner){
			jQuery(e.target).datetimepicker({
			      lang:"ch",           //语言选择中文
			      format:"Y-m-d",      //格式化日期
			      timepicker:false,    //关闭时间选项
			      yearStart:2000,     //设置最小年份
			      yearEnd:2050,        //设置最大年份
			      todayButton:false    //关闭选择今天按钮
			});
			jQuery(e.target).datetimepicker('show');
		}
	};
	
	/**
	 *  打开添加群成员的窗口
	 */
	$scope.addGroupMember = function(){
		ngDialog.open({
				template: 'src/modules/yxim/template/add-groupchat.htm',
				controller: 'addGroupChatController',
				className: '',
				showClose: false,
				data: {
					mode: "addgroupmember",
					group: $scope.group
				}
			});
	};
	
	/**
	 * 关闭详情窗口 
	 */
	$scope.closeDetailDialog = function(e){
		jQuery('.IMChat-group-slide').addClass('beforeHide');
		setTimeout(function(){
			jQuery('.IMChat-group-slide').removeClass('beforeHide').addClass('hidden');			
		},500);
		ngDialog.close();
	};
	
	/**
	 * 取消 
	 */
	$scope.cancel = function(){
		ngDialog.close();
	};
	
	/**
	 * 退出群聊 
	 */
	$scope.quitChatGroup = function(){
		$scope.closeDetailDialog();
		ngDialog.open({
			template: 'src/modules/yxim/template/confirm-dialog.htm',
			controller: 'groupSetupController',
			className: '',
			data: {
				title: '退出群组',
				message: '确定要退出群组吗？',
				group: $scope.group,
				confirmText: '确定',
				fun: function(e){
					alert('开发中，敬请期待！！');
				}
			},
			showClose: false
		});
	};
	
	/**
	 * 关闭群聊
	 */
	$scope.exitChatGroup = function() {
		ngDialog.open({
			template: 'src/modules/yxim/template/confirm-dialog.htm',
			controller: 'groupSetupController',
			className: '',
			data: {
				title: '关闭群组',
				message: '您确定要关闭群组吗？',
				group: $scope.group,
				confirmText: '确定',
				fun: function(e){
					alert('开发中，敬请期待！！');
				}
			},
			showClose: false
		});
	};
	
	//群成员删除按钮
	$scope.deleteGroupMember_Click = function(per, e) {
		e.preventDefault();
		e.stopPropagation();
		ngDialog.open({
			template: 'src/modules/yxim/template/delMemberConfirmMessage.htm',
			controller: 'groupSetupController',
			className: '',
			data: {
				Message: "是否把" + per.name + "移出群？",
				group: $scope.groupSetupInfo,
				person: per
			},
			showClose: false
		});
	}
}])
})