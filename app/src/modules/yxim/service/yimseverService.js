define(['../module'], function(module) {
  module.service('yimserverService', ["$rootScope", "$state", "$stateParams", "toaster",
		"$cookies", "ngDialog", "audioPlayService", "updateService", "$interval", function($rootScope, $state, $stateParams, toaster, $cookies, ngDialog, audioPlayService, updateService, $interval){

       var yimserverService = {};

        $rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;
		$rootScope.chatMessages = [];
		$rootScope.SendMessages = [];
		$rootScope.userStatesList = [];

		var snsLoginConflict = false;
		$rootScope.islogout = false;
		$rootScope.issnsLoginConflict = false;
		$rootScope.userState = {
			isonline: false,
			isfirst: true
		};


       // function initSever(){

           YYIMChat.init({
			onOpened: function() {
				snsLoginConflict = false; // 连接后, 不冲突, 自动登录

				YYIMUtil['cookie']['set']('username', YYIMChat.getUserID());

				$rootScope.userState.isonline = true;

				/**
				 *  初始化缓存 rongqb 20160322
、				 */
				YYIMChat.getRosterItems({
					success: function(data) {
						data = JSON.parse(data);
						for (var x in data) {
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache(data[x]);
						}

						$rootScope.$broadcast("currentPersonInfo");
					},
					complete: function() {
						YYIMChat.getChatGroups({
							success: function(data) {
								data = JSON.parse(data);
								for (var x in data) {
									YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().updateCache(data[x]);
								}
							},
							complete: function() {
								YYIMChat.getPubAccount({
									success: function(data) {
										data = JSON.parse(data);
										for (var x in data) {
											YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getPubAccountManager().updateCache(data[x]);
										}

										YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().init();
										YYIMChat.getOfflineMessage({ //获取离线消息
											success: function() {
												$rootScope.$broadcast("chatlistmessage");
												$rootScope.$broadcast("unreadchatmessage");
											}
										});

										YYIMChat.setPresence(); //设置本人上线
										toaster.pop({
											title: '消息服务器连接成功！',
											type: 'success'
										});
										jQuery('#login-container').addClass('hidden');
										$rootScope.$broadcast("chatlistmessage");
									},
									complete: function() {

									}
								});
							}
						});
					}
				});

			},
			onClosed: function(arg) {
				// console.info("连接关闭");
				$rootScope.islogout = true;
				snsLoginConflict = false;
				$rootScope.userState.isonline = false;
			},
			onAuthError: function() {
				toaster.pop({
					title: '消息服务器登录失败,请退出重试！',
					type: 'error'
				});
				$rootScope.islogout = true;
				snsLoginConflict = false;
				$rootScope.userState.isonline = false;
			},
			onGroupUpdate: function(arg) {
				/**
				 * 群组信息更新 rongqb 20160233
				 */
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().updateCache(arg);
			},
			onKickedOutGroup: function(arg) {
				/**
				 * 被群组踢出 rongqb 20160233
				 */
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().KickedOutByGroup(arg);

				var groupinfo = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().get(arg.from);
				if (groupinfo) {
					var groupname = groupinfo.name;
				}

				var notification = new window.Notification("新消息通知", {
					body: "您被移除群" + groupname,
					icon: "logo.png"
				});

				///  此处需要进行历史消息的处理
				$rootScope.$broadcast("unreadchatmessagechange", "我的测试");
				$state.go("imhome");
			},
			onStatusChanged: function(status) {
				//debugger
				if (status && status.errorCode == 409) {
					snsLoginConflict = true;
					YYIMChat.logout();
					$rootScope.issnsLoginConflict = true;
					ngDialog.open({
						template: 'src/modules/yxim/template/MessageInfo.htm',
						controller: 'mainCtrl',
						className: '',
						showClose: false,
						closeByEscape: false,
						closeByDocument: false
					});
				}
			},
			onConnectError: function(status) {
				if (!status)
					return;
				if (snsLoginConflict) {
					YYIMChat.logout();
					ngDialog.open({
						template: 'src/modules/yxim/template/MessageInfo.htm',
						controller: 'mainCtrl',
						className: '',
						showClose: false,
						closeByEscape: false,
						closeByDocument: false
					});
				}

				// debugger
				if (status && status.errorCode == 409) {
					YYIMChat.logout();
					$rootScope.issnsLoginConflict = true;
					ngDialog.open({
						template: 'src/modules/yxim/template/MessageInfo.htm',
						controller: 'mainCtrl',
						className: '',
						showClose: false,
						closeByEscape: false,
						closeByDocument: false
					});
				} else {
					$rootScope.userState.isonline = false;
					toaster.pop({
						title: '连接失败，正在重试！',
						type: 'warn'
					});
					var info = {
						status: "not on line"
					}
					$rootScope.$broadcast("userstateChange", info);
//					if (!$rootScope.issnsLoginConflict) {
//						if (!$rootScope.userState.isonline) {
//							YYIMChat.connect();
//						}
//					}
				}
			},
			onUserBind: function(arg) {},
			onPresence: function(arg) {
				/**
				 * 联系人状态改变 rongqb 20160322
				 */
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updatePresence(arg);
			},
			onSubscribe: function(arg) {
				/**
				 * 加好友请求 rongqb 20160322
				 */
				if(arg.type === 'subscribe') {
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache({
						id: arg.from,
						ask: -1,
						recv: 1,
						subscription: YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.NONE
					});
				}else if (arg.type === 'subscribed') {
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache({
						id: arg.from,
						ask: -1,
						recv: -1,
						subscription: YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.BOTH
					});
				}
			},
			onRosterUpdateded: function(arg) {
				/**
				 * 联系人信息更新 rongqb 20160322
				 */
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache(arg);
			},
			onRosterDeleted: function(arg) {},
			onRoomMemerPresence: function(arg) {},
			onReceipts: function(arg) {
				/**
				 * 发送消息的回执 rongqb 20160322
				 */
				if (arg && arg.id) {
					if (arg.state === 2 || arg.type === 'groupchat') {
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().updateCache({
							id: arg.id,
							sendState: YYIMCacheConfig.SEND_STATE.READED
						});
					}
				}
			},
			onTextMessage: function(arg) {
				handleMessageFun(arg);
			},
			onPictureMessage: function(arg) {
				handleMessageFun(arg);
			},
			onFileMessage: function(arg) {
				handleMessageFun(arg);
			},
			onShareMessage: function(arg) {
				handleMessageFun(arg);
			},
			onMessageout: function(arg) {},
			onAudoMessage: function(arg) {
				handleMessageFun(arg);
			},
			onSystemMessage: function(arg) { //接收到单图文消息
				handleMessageFun(arg);
			},
			onPublicMessage: function(arg) { //接收到多图文消息
				handleMessageFun(arg);
			},
			onWhiteBoardMessage: function(arg) { //接收到白板消息
				handleMessageFun(arg);
			},
			onPubaccountUpdate: function(arg) {
				for (var x in arg) {
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getPubAccountManager().updateCache(arg[x]);
				}
			},
			onWhiteBoardUpdated: function(arg) {
				window.handleUpdateData(arg);
			}
		});

       // }


       function handleMessageFun(arg) {
			var message = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().updateCache(arg);

			if (message.opposite == $stateParams.personId) {
				message.data.isHaveAt = false;
			}

			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
				id: message.opposite,
				dateline: message.dateline,
				latestState: message.data,
				type: message.type,
				contentType: message.data.contentType,
				sort: true,
				isHaveAt: message.data.isHaveAt
			});

			if (!!message.data.isHaveAt) {
				$rootScope.$broadcast("atBySomeOne", message);
			}

			if (!!NodeWebKitSupport && !!message.received) {
				var recent = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().get(message.opposite) || '';
				var newinfo = recent.latestState;
				var newinfo = newinfo.substr(0, 30);

				if (!!newInfoer) {
					clearTimeout(newInfoer);
				}

				newInfoer = setTimeout(function() {
					var notification = new window.Notification("新消息通知", {
						body: newinfo,
						icon: "logo.png"
					});
          // console.log("yimserverService");
          audioPlayService.play();
					notification.onclick = function() {
						win.show();
					}
				}, 50);
			}
			$rootScope.$broadcast("chatlistmessage", message);
			$rootScope.$broadcast("unreadchatmessage", message);
			$rootScope.$broadcast("chatmessage", message);
		}


      /**
		 * 拉取联系人在线状态
		 */
		$interval(function() {
			var ids = Object.keys(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().list);

			if ($rootScope.userState.isonline && ids.length > 0 && !$rootScope.issnsLoginConflict) {
				YYIMChat.getRostersPresence({
					username: ids,
					success: function(data) {
						$rootScope.userStatesList = data;
						$rootScope.islogout = false;
					},
					error: function() {
						$rootScope.userStatesList = [];
					}
				});
			}
		}, 10000);

       //return yimserverService;
  }]);
});
