define(['../module'], function(module) {
module.controller('addGroupChatController', ['$rootScope', '$scope', 'urlParseService', '_', '$stateParams', '$state', 'ngDialog', "toaster", 'SearchService', "$compile",function($rootScope, $scope, urlParseService, _, $stateParams, $state, ngDialog, toaster,SearchService,$compile) {
	$scope.PersonList = [];
	$scope.multipleDemo = {};
    $scope.multipleDemo.selectedPeopleWithGroupBy = [];
    $scope.multipleDemo.originalSelectedPeople = [];
    
    $scope.showList = {
		'friend':{
			name:'我的好友',
			show:false,
			level:2,
			id:'friend',
			selectAll:false
		},'recent':{
			name:'最近联系人',
			show:true,
			level:2,
			id:'recent',
			selectAll:false
		}
	};

	/**
	 *  检查人员是否选中状态
	 */
	$scope.updateDepartMembersCheckType = function(){
		for(var x in $scope.showList){
			var entity = $scope.showList[x];
			if(entity.id && entity.members){
				for(var y in entity.members){
					entity.members[y].checktype = false;

					if($scope.ngDialogData.mode == 'addgroupmember'){
						var selectPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople.concat($scope.multipleDemo.selectedPeopleWithGroupBy), {
							id: entity.members[y].id
						});

					}else{
						var selectPerpleFilter = _.where($scope.multipleDemo.selectedPeopleWithGroupBy, {
							id: entity.members[y].id
						});
					}

					if(selectPerpleFilter.length){
						entity.members[y].checktype = true;
					}
				}
			}
		}
	};

	$scope.showList["recent"].members = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getListByChatType('chat',true);
	$scope.updateDepartMembersCheckType();

	if(!!$scope.ngDialogData.group){
		$scope.group = $scope.ngDialogData.group;

		_.each($scope.group.members,function(item,index){
//			$scope.multipleDemo.selectedPeopleWithGroupBy.push(item);
			$scope.multipleDemo.originalSelectedPeople.push(item);
		});
		$scope.updateDepartMembersCheckType();
	}

	/**
	 * 参与人
	 */
	$scope.$watch('multipleDemo.selectedPeopleWithGroupBy', function(newvalue, oldvalue) {
		if(newvalue && newvalue.length){
			var member = newvalue[newvalue.length-1];
			var selectPerpleFilter = _.where($scope.multipleDemo.selectedPeopleWithGroupBy, {
				id: member.id
			});
			if (selectPerpleFilter.length > 1) {
				$scope.multipleDemo.selectedPeopleWithGroupBy.pop();
			}
		}
		$scope.updateDepartMembersCheckType();
		jQuery('.selectAffiliated input').attr('placeholder','搜索名称、拼音、手机号').trigger('focus');
	});

	/**
	 * 点击展开部门人员下拉列表
	 * @param {Object} e
	 * @param {Object} departId
	 */
	$scope.toggleDepartMembers = function(e,mode){
		$scope.showList[mode].show = !$scope.showList[mode].show;
		if(!!$scope.showList[mode].show){
			if(mode == "friend"){
				$scope.showList[mode].members = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("friend");
			}else if(mode == "recent"){
				$scope.showList[mode].members = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getListByChatType('chat',true);
			}
			$scope.updateDepartMembersCheckType();
		}
	};

	/**
	 * 搜索 参与人
	 * @param {Object} personSearch
	 */
	$scope.refreshPersons = function(keyword,mode) {
		$scope.PersonList.length = 0;

		if(!keyword) return;

		SearchService.roster({
			keyword: keyword,
			success:function(data){
				if(data && data.items && data.items.length){
					for(var x in data.items){
						if(data.items[x].id){

							data.items[x].chatType = 'chat';
							if(mode == 'charge'){
								var selectPerpleFilter = _.where($scope.multipleDemo.selectedChargeWithGroupBy, {
									id: data.items[x].id
								});

								if (selectPerpleFilter.length == 0) {
									$scope.ChargeList.push(data.items[x]);
								}

							}else{
								var selectPerpleFilter = _.where($scope.multipleDemo.selectedPeopleWithGroupBy, {
									id: data.items[x].id
								});

								var selectOriginalSPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople, {
									id: data.items[x].id
								});

								if (selectPerpleFilter.length == 0 && selectOriginalSPerpleFilter.length == 0) {
									$scope.PersonList.push(data.items[x]);
								}
							}
						}
					}

				}
			}
		});

	};

	/**
	 * 全选功能 rongqb 20160418
	 */
	$scope.seleteDeptAllFlag = {};
	$scope.selectDeptAll = function(e,id) {
		for (var i in $scope.showList[id].members) {
			if(!$scope.showList[id].members[i].id) return;

			var selectPerpleFilter = _.where($scope.multipleDemo.selectedPeopleWithGroupBy, {
				id: $scope.showList[id].members[i].id
			});

			if (!$scope.showList[id].selectAll && selectPerpleFilter.length != 0) {

				if($scope.ngDialogData.mode == 'addgroupmember'){
					var selectOriginalPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople, {
						id: $scope.showList[id].members[i].id
					});

					if(selectOriginalPerpleFilter.length == 0){
						$scope.multipleDemo.selectedPeopleWithGroupBy = _.filter($scope.multipleDemo.selectedPeopleWithGroupBy, function(obj) {
							return obj.id != $scope.showList[id].members[i].id;
						});
					}
				}else{
					$scope.multipleDemo.selectedPeopleWithGroupBy = _.filter($scope.multipleDemo.selectedPeopleWithGroupBy, function(obj) {
						return obj.id != $scope.showList[id].members[i].id;
					});
				}
			}else if($scope.showList[id].selectAll && selectPerpleFilter.length == 0) {

				if($scope.ngDialogData.mode == 'addgroupmember'){
					var selectOriginalPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople, {
						id: $scope.showList[id].members[i].id
					});

					if(selectOriginalPerpleFilter.length == 0){
						$scope.multipleDemo.selectedPeopleWithGroupBy = $scope.multipleDemo.selectedPeopleWithGroupBy || [];
						$scope.multipleDemo.selectedPeopleWithGroupBy.push($scope.showList[id].members[i]);
					}
				}else{
					$scope.multipleDemo.selectedPeopleWithGroupBy = $scope.multipleDemo.selectedPeopleWithGroupBy || [];
					$scope.multipleDemo.selectedPeopleWithGroupBy.push($scope.showList[id].members[i]);
				}
			}

			$rootScope.$broadcast("multipleDemo.selectedPeopleWithGroupBy");
			$scope.updateDepartMembersCheckType();
		}
	}

	/**
	 * 点击添加成员
	 * @param {Object} e
	 * @param {Object} member
	 */
	$scope.addGroupLeaguer = function(e, member) {
		var selectPerpleFilter = _.where($scope.multipleDemo.selectedPeopleWithGroupBy, {
			id: member.id
		});

		if (selectPerpleFilter.length == 0) {

			if($scope.ngDialogData.mode == 'addgroupmember'){
				var selectOriginalPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople, {
					id:member.id
				});

				if(selectOriginalPerpleFilter.length == 0){
					$scope.multipleDemo.selectedPeopleWithGroupBy = $scope.multipleDemo.selectedPeopleWithGroupBy || [];
					$scope.multipleDemo.selectedPeopleWithGroupBy.push(member);
				}
			}else{
				$scope.multipleDemo.selectedPeopleWithGroupBy = $scope.multipleDemo.selectedPeopleWithGroupBy || [];
			$scope.multipleDemo.selectedPeopleWithGroupBy.push(member);
			}


		} else {
			if($scope.ngDialogData.mode == 'addgroupmember'){
				var selectOriginalPerpleFilter = _.where($scope.multipleDemo.originalSelectedPeople, {
					id: member.id
				});

				if(selectOriginalPerpleFilter.length == 0){
					$scope.multipleDemo.selectedPeopleWithGroupBy = _.filter($scope.multipleDemo.selectedPeopleWithGroupBy, function(obj) {
						return obj.id != member.id;
					});
				}
			}else{
				$scope.multipleDemo.selectedPeopleWithGroupBy = _.filter($scope.multipleDemo.selectedPeopleWithGroupBy, function(obj) {
					return obj.id != member.id;
				});
			}
		}

		$rootScope.$broadcast("multipleDemo.selectedPeopleWithGroupBy");
		$scope.updateDepartMembersCheckType();
	}


	/**
	 * 关闭创建窗口
	 */
	$scope.closeCreateGroupChat = function() {
		ngDialog.close();
	}

	$scope.isCreateProjecting = false;

	$scope.createChatGroup = function(e){
		e.preventDefault();
		e.stopPropagation();

		if($scope.isCreateProjecting) return;


		if(!$scope.project_name){
			toaster.pop({
					title: '群组标题不能为空！',
					type: 'warn'
				});

			return;
		}

		var affiliatedIdList = _.pluck($scope.multipleDemo.selectedPeopleWithGroupBy, 'id');
		affiliatedIdList = _.difference(affiliatedIdList);

		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().createChatGroup({
			name:$scope.project_name,
			members:affiliatedIdList,
			success:function(group){
				if(!!group){
					ngDialog.close();

					toaster.pop({
					 	title: '群组创建成功！',
					 	type: 'success'
					});

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
	};

	/**
	 * 添加 群成员
	 */
	$scope.addMembers = function(groupId){

		if($scope.isCreateProjecting) return;
		$scope.isCreateProjecting = true;

		var affiliatedIdList = _.pluck($scope.multipleDemo.selectedPeopleWithGroupBy, 'id');
		affiliatedIdList = _.difference(affiliatedIdList);


		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().inviteGroupMember({
			to: $scope.group.id,
			members:affiliatedIdList,
			success:function(group){
				ngDialog.close();

				toaster.pop({
						title: '群组人员添加成功！',
						type: 'success'
					});
			}
		});


	};
}])
})
