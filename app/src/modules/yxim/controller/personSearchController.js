define(["../module"], function (module) {
module.controller('personSearchController', ['$rootScope', '$scope', '_', '$state','SearchService','httpService',function($rootScope, $scope, _, $state,SearchService,httpService) {
	//被选择人员对象

	$scope.someGroupFn = function(item){
		   if(item.chatType == 'groupchat'){
		   		return '群组';
		   }else if(item.chatType == 'pubaccount'){
		   		return '公众号';
		   }else{
		   		return '联系人';
		   }
	 };

	$scope.searchList = [];

	$scope.keyword = null;

	$scope.refreshPersons = function(keyword) {
		$scope.searchList.length = 0;

		if(!keyword) return;
		$scope.keyword = keyword;

		function findImU(keyword) {
           var url ='/user/search';
            httpService.postData(url,{keyWord:keyword},function(data) {
            // console.log('搜索人员');
            // console.log(data);
             if (data.code == 0){
                $scope.searchList.length = 0;
                if (data.data.contacts_list&&data.data.contacts_list.length>0){
                	for(var x in data.data.contacts_list){
    					$scope.searchList.push({
								id: data.data.contacts_list[x].muid,
								name: data.data.contacts_list[x].uname,
								email: data.data.contacts_list[x].email,
								office: data.data.contacts_list[x].company,
								mobile: data.data.contacts_list[x].mobile,
								chatType: 'chat',
								type: 'chat',
								telephone: data.data.contacts_list[x].phone,
								from:data.data.contacts_list[x].from
							});

                	}
                }

                if (data.data.team_list&&data.data.team_list.length>0){
                	for(var x in data.data.team_list){
    					$scope.team_list.push({
								id: data.data.team_list[x].gid,
								name: data.data.team_list[x].group_name,
								email: '',
								office: '',
								mobile:'',
								chatType: 'chat',
								type: 'chat',
								telephone: '',
								from:data.data.team_list[x].from
							});

                	}
                }
                if (data.data.group_list&&data.data.group_list.length>0){
                	for(var x in data.data.group_list){
    					$scope.searchList.push({
								id: data.data.group_list[x].id,
								name: data.data.group_list[x].name,
								email: '',
								office: '',
								mobile:'',
								chatType: 'chat',
								type: 'chat',
								telephone: '',
								from:data.data.group_list[x].from
							});

                	}
                }

             }else{

             }

            // body...
          },function(error) {
            // body...

          })

         };



		//findImU($scope.keyword);
		$scope.searchList = [];
		var RecentList = YYIMCacheSpaceManager.get(currentSpaceId).getRecentManager().queryRecentList(keyword);
		var indx = 0;
		for(indx=0;indx<RecentList.length;indx++){


			if (RecentList[indx].type =='pubaccount'){
				$scope.searchList.push({
								id: RecentList[indx].id,
								name: RecentList[indx].name,
								chatType: 'pubaccount',
								type: 'pubaccount',
								type:RecentList[indx].type,
								from:RecentList[indx].from
							});
			}


			if (RecentList[indx].type =='groupchat'){
				$scope.searchList.push({
								id: RecentList[indx].id,
								name: RecentList[indx].name,
								chatType: 'groupchat',
								type: 'groupchat',
								from:RecentList[indx].from
							});
			}

			if (RecentList[indx].type =='chat'){
				$scope.searchList.push({
								id: RecentList[indx].id,
								name: RecentList[indx].name,
								email: RecentList[indx].from.vcard.email,
								office: RecentList[indx].from.vcard.office,
								mobile: RecentList[indx].from.vcard.mobile,
								chatType: 'chat',
								type: 'chat',
								telephone: RecentList[indx].from.vcard.telephone,
								from:RecentList[indx].from
							});
			}

		}




		// 搜索联系人
		// SearchService.roster({
		// 	keyword: keyword,
		// 	success:function(data){
		// 		$scope.searchList.length = 0;
		// 		if(!!$scope.keyword && data && data.items && data.items.length){
		// 			for(var x in data.items){
		// 				if(data.items[x].id && data.items[x].id != YYIMChat.getUserID()){
		// 					$scope.searchList.push({
		// 						id: data.items[x].id,
		// 						name: data.items[x].name,
		// 						email: data.items[x].email,
		// 						office: data.items[x].office,
		// 						mobile: data.items[x].mobile,
		// 						chatType: 'chat',
		// 						telephone: data.items[x].telephone
		// 					});
		// 				}
		// 			}

		// 		}
		// 	}
		// });

		// 搜索群组
		// SearchService.group({
		// 	keyword: keyword,
		// 	success:function(data){
		// 		if(data && data.items && data.items.length){
		// 			for(var x in data.items){
		// 				if(data.items[x].id){
		// 					$scope.searchList.push({
		// 						id: data.items[x].id,
		// 						name: data.items[x].name,
		// 						chatType: 'groupchat'
		// 					});
		// 				}
		// 			}
		// 		}
		// 	}
		// });
//
//		// 搜索公众号
		// SearchService.pubaccount({
		// 	keyword: keyword,
		// 	success:function(data){
		// 		if(data && data.items && data.items.length){
		// 			for(var x in data.items){
		// 				if(data.items[x].id){
		// 					$scope.searchList.push({
		// 						id: data.items[x].id,
		// 						name: data.items[x].name,
		// 						chatType: 'pubaccount',
		// 						type:data.items[x].type
		// 					});
		// 				}
		// 			}
		// 		}
		// 	}
		// });
	};
	$scope.goToMessage_Search = function(item,e) {
		if(!!e){
				e.preventDefault();
				e.stopPropagation();
		}

		if(item.id !== YYIMChat.getUserID()){
			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
				id: item.id,
				name: item.name,
				type: item.chatType,
				sort: true
			});
		}

		jQuery('.IMChat-search .dropdown-menu').scrollTop(0);
		$state.go("main.imhomeplus.message", {
			personId: item.id,
			personName: item.name,
			chatType: item.chatType
		});

		$scope.$emit("chatHistoryListChange_toparent", item);
	};
}])
})
