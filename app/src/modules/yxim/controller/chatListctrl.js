define(["../module"], function (module) {
module.controller("chatListctrl", ["$rootScope", "$scope", "$state", "$interval", "ngDialog", /*"toaster", "_", "urlParseService",*/'yimService','$timeout',
	function($rootScope, $scope, $state, $interval, ngDialog/*, toaster, _, urlParseService*/,yimService,$timeout) {


			//经销商空间下非管理员处理
		function handleSpaceOnDealers() {
		//	if ($rootScope.qz_user_type != 0 && $rootScope.qz_user_type != 1) {
				//过滤recentList
		//		$scope.recentList = _.filter($scope.recentList, function(each){ return each.type != 'chat' && each.from.spaceId && each.from.spaceId == currentSpaceId});
		//	}
		}

		//响应切换空间事件
		$scope.$on("switchSpace", function () {
			// console.log($rootScope.qz_user_type);
			$scope.recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();
			handleSpaceOnDealers();
			$timeout(function(){
				$scope.$apply();
			});
		})


		//初始化
		$scope.recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();
		//handleSpaceOnDealers();

		$scope.$on("chatlistmessage", function(name, data) {

			//getRecentList
			$scope.recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();
			$timeout(function(){
				$scope.$apply();
			});
		});



		//移除群组 add by liucyu
		$scope.$on("removeGrp", function(name,gid) {
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().remove(gid);
				$scope.recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();
				$state.go("main.imhomeplus");
		});



		$scope.removeitem = function(item, e) {
			e.preventDefault();
			e.stopPropagation();
			//  广播消息进行消息显示数的更新
			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().remove(item.id);
			$scope.recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();
			$state.go("imhome");
		}

		$scope.getUserCurrentState = function(item) {
			var isonline = false;
			for (var j = 0; j < $rootScope.userStatesList.length; j++) {
				if ($rootScope.userStatesList[j].userid == item.id)
					for (var i = 0; i < $rootScope.userStatesList[j].presence.length; i++) {
						if ($rootScope.userStatesList[j].presence[i].available == 1) {
							isonline = true;
							return isonline;
						}
					};
			}
			return isonline;
		};

		///  添加用户在线状态的处理
		$scope.istoday = function(dateline) {
			var infodate = new Date(Number(dateline));
			var today = new Date();
			if ((infodate.getDay() != today.getDay()) || (infodate.getMonth() != today.getMonth()) || (infodate.getFullYear() != today.getFullYear())) {
				return false;
			}
			return true;
		}


		///  获取用户未读的消息
		$scope.getunReadmessageCounts = function(rosterId,item) {

			// if(item){
			// 	if(item && item.type && item.type != "folded"){
			// 		var length = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().getMessageList({
			// 			id: rosterId,
			// 			condition: 'unreaded'
			// 		}).length;
			// 		return length ;//> 99 ? "99" : length;
			// 	} else {
			// 		var notice = 0;
			// 		for (var i = 0; i < item.recentList.length; i++) {
			// 			notice += item.recentList[i].notice;
			// 		}
			// 		if (notice>0) {
			// 			return notice ;//> 99 ? "99" : notice;;
			// 		}
			// 		return undefined;
			// 	}
			// }
			if(item){
				return item.notice;
			}else{
				return 0;
			}
		}

		$scope.isShowDingYue = false;

		$scope.goToMessage = function(item, event) {
			// console.log(item);
			// $scope.isShowDingYue = true;
			
			$rootScope.curRecentItemEvent = event;
			switch (item.type) {
				case YYIMAngularConstant.CHAT_TYPE.CHAT:
					; //  单聊消息处理
				case YYIMAngularConstant.CHAT_TYPE.GROUP_CHAT:
					; //  群聊消息处理
				case YYIMAngularConstant.CHAT_TYPE.PUB_ACCOUNT: //公众号消息
					var color = event.currentTarget.getAttribute('headercolor');
					// debugger
					$scope.curId = item.id;
					$state.go("main.imhomeplus.message", {
						personId: item.id,
						personName: item.name || item.id,
						chatType: item.type,
						childrenType: item.childrenType || "",
						headerColor: color
					});
					break;
				default: //漏掉的消息类型
					// console.log(item.type);
					YYIMChat.log("未处理消息类型", 3, arg.type);
					break;
			}
		}
		$scope.goSubscribe = function(item, event){
			//取得当前空间下的订阅号
			$scope.subscribes = _.filter(item.recentList, function (each) {
				return each.spaceId == currentSpaceId;
			});
			// console.log(item);
			$scope.subscribeStyle = "left:65px;";
		}
		$scope.goBack = function(){
			$scope.subscribeStyle = "";
		}
		$scope.analysisStateHtml = function(item,obj){

			if  (item && typeof item!='string') {
				if(item.toString()=='[object Object]'){
					if(item.type){
						return '['+item.type+'文件]';
					} else {
						return '[未知文件]';
					}
				}
			}
			
			return item;
		}
	}
])
})
