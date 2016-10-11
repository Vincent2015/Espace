define([
	// './directive/namespace',
	// './service/namespace',
	// './controller/imchat/namespace',
	'./modules/contacts/namespace',
	'./modules/dudu/namespace',
	'./modules/login/namespace',
	'./modules/main/namespace',
	'./modules/wemail/namespace',
	'./modules/common/namespace',
	'./modules/im/namespace',
	'./modules/yxim/namespace',
	'./modules/app/namespace',
	// './app/namespace',
	// './plugin/namespace',
	// './filter/namespace'
], function() {
	'use strict';

	var app = angular.module('app', ['ui.router', 'app.dudu', 'app.login', 'app.main', 'app.wemail', 'app.contact', 'app.common', 'app.im', 'app.yxim', 'ui.select','toaster',
	  "ngSanitize", "infiniteScroll", "ngStorage", "pasvaz.bindonce", "ngAnimate", "ngCookies", "ngDialog","imageCropper",'app.app',"com.2fdevs.videogular"
	])

	app.filter('photoname', function() {
		return function(input) {
			var result = "";
			if (input) {
				switch (input.length) {
					case "0":
					case "1":
					case "2":
						result = input;
						break;
					default:
						result = input.substr(input.length - 2, 2);
						break;
				}
			}
			return result;
		}
	});

	app.filter('getFirstLetter', function() {
		return function(input) {
			return getFirstLetter(input);
		}
	});

	/**
	 * 根据场景获取相应界面组件的权限  rongqb 20160412
	 */
	app.filter('getSpectacle', ['$rootScope', function($rootScope) {
		return function(input) {
			//var spectacle = $rootScope.$stateParams.spectacle.toUpperCase();
			//var power = YYIMAngularConfig['SPECTACLE'][spectacle] || YYIMAngularConfig['SPECTACLE']['MESSAGE'];
			var power = YYIMAngularConfig['SPECTACLE']['MESSAGE'];
			return power[input.toString().toUpperCase()];
		}
	}]);

	app.filter('cutString', function() {
		return function(input, direction, length) {
			if (!input) return '';
			if (direction) {
				return input.substr(input.length - length, length);
			} else {
				return input.substr(0, length);
			}
		}
	});

	//配置应用的路由
	app.config(function($stateProvider, $urlRouterProvider, $compileProvider) {

		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|sms|app|data):/);
		$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|app|file):/);

		$stateProvider
			.state("login", {
				url: "/login",
				params: {
					'spectacle': 'MESSAGE'
				},
				templateUrl: "src/modules/login/login.html",
				controller: "loginController"
			})

		.state("main", {
				url: "/main",
				templateUrl: "src/modules/main/main.html",
				controller: "mainController"
			})
			.state("main.imhomeplus", {
				url: "/imhome",
				params: {
					'spectacle': 'MESSAGE'
				},
				templateUrl: "src/modules/yxim/template/menu-pannel-imhome.htm",
				controller: "chatListctrl"
			})
			.state("main.imhomeplus.message", {
				url: "/message",
				params: {
					'personId': '',
					'personName': '',
					'chatType': '',
					'childrenType':'',
					'spectacle': 'MESSAGE',
					'author': '',
					'headerColor': ''
				},
				templateUrl: "src/modules/yxim/template/list-content-message.htm",
				controller: "messageController"
			})
			.state("main.imhomeplus.messsidebar", {
				url: "/messsidebar",
				params: {
					'personId': '',
					'personName': '',
					'chatType': '',
					'spectacle': 'MESSAGE'
				},
				templateUrl: "src/modules/yxim/template/list-content-sidebar.htm",
				controller: "messageController"
			})
			.state("main.contacts", {
				url: "/contacts",
				templateUrl: "src/modules/yxim/template/menu-pannel-contacts.htm",
			})
			.state("main.contacts.friend", {
				url: "/friend",
				templateUrl: "src/modules/yxim/template/list-content-friend.htm",
				controller: "friendController"
			})
			.state("main.contacts.group", {
				url: "/group",
				templateUrl: "src/modules/yxim/template/list-content-group.htm",
				controller: "groupController"
			})
			.state("main.contacts.pubAcc", {
				url: "/pubAcc",
				templateUrl: "src/modules/yxim/template/list-content-pubAcc.htm",
				controller: "publicAccountController"
			})
			.state("main.imhome", {
				url: "/imhome",
				templateUrl: "src/modules/im/im_index.html",
				controller: "imController"
			})
			.state("main.imhome.person", {
				url: "/person/:id",
				templateUrl: "src/modules/im/personChat.html",
				controller: "personChatController"
			})
			.state("main.imhome.group", {
				url: "/group/:id",
				templateUrl: "src/modules/im/groupChat.html",
				controller: "groupChatController"
			})
			.state("main.imhome.discussiongroup", {
				url: "/discussiongroup/:id",
				templateUrl: "src/modules/im/discussionGroup.html",
				controller: "discussionGroupController"
			})
			.state("main.contact", {
				url: "/contact",
				templateUrl: "src/modules/contacts/contact_index.html",
				controller: "contactController"
			})
			.state("main.contact.organization", {
				url: "/organization?deptId&name&swch",
				templateUrl: "src/modules/contacts/organization.html",
				controller: "organizationController"
			})
			.state("main.contact.teamlist", {
				url: "/teamlist",
				templateUrl: "src/modules/contacts/teamlist.html",
				controller: "teamListController"
			})
			.state("main.contact.team", {
				url: "/team?gid&group_name",
				templateUrl: "src/modules/contacts/team.html",
				controller: "teamController"
			})
			.state("main.contact.friend", {
				url: "/friend",
				templateUrl: "src/modules/contacts/friend.html",
				controller: "frendListController"
			})
			.state("main.contact.talkgroup", {
				url: "/talkgroup",
				templateUrl: "src/modules/contacts/talkgroup.html",
				controller: "talkgroupController"
			})
			.state("main.contact.talkgroupDetail", {
				url: "/talkgroupDetail?gid&group_name",
				templateUrl: "src/modules/contacts/talkgroup-detail.html",
				controller: "talkgroupDetailController"
			})
			.state("main.contact.followers", {
				url: "/followers",
				templateUrl: "src/modules/contacts/followers.html",
				controller: "followersController"
			})
				.state("main.app", {
					url: "/app",
					templateUrl: "src/modules/app/app.html",
					controller: "appController"
			})
      .state("main.contact.showContactSearchDetail", {
        url: "/showContactSearchDetail?id&deptName",
        templateUrl: "src/modules/contacts/showContactSearchDetail.html",
        controller: "showContactSearchDetailController"
      })
			.state("main.dudu", { //嘟嘟模块
				url: "/dudu",
				templateUrl: "src/modules/dudu/dudu-index.html",
				controller: "phoneController"
			})
			.state("main.dudu.me", {
				url: "/me",
				templateUrl: "src/modules/dudu/dudu-me.html",
				controller: "duPersonController"

			})
			.state("main.dudu.phonemeeting", {
				url: "/phonemeeting",
				templateUrl: "src/modules/dudu/dudu-phonemeeting.html",
				controller: "phoneController"
			})
			.state("main.wemail", { //微邮模块 add by liucyu 2016-06-02
				url: "/wemail",
				templateUrl: "src/modules/wemail/wemail-index.html",
				controller: "wemailController"
			})
			.state("main.wemail.writMail", {
				url: "/writeMail",
				templateUrl: "src/modules/wemail/wemail-write.html"
			})

		//	$urlRouterProvider.otherwise('/imhome');
	});

	app.config(function($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			// Allow same origin resource loads.
			'self',
			// Allow loading from our assets domain.  Notice the difference between * and **.
			'http://h.yonyou.com/**', "http://y.yonyou.com/**", "https://h.yonyou.com/**"
		]);
	})
	window.immsgpngurl = 'src/style/images/filetype/';
	app.run(["$rootScope", "$state", "$stateParams", "toaster",

		"$cookies", "ngDialog", "audioPlayService", "updateService", "$interval","httpService",
		function($rootScope, $state, $stateParams, toaster, $cookies, ngDialog, audioPlayService, updateService, $interval,httpService) {
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
			//updateService.showupdateinfo(window.newversion); //版本更新更新提示
			window.currentSpaceId = null;
			try{
			//window.currentSpaceId = window.currentSpaceId ? window.currentSpaceId:JSON.parse(localStorage.getItem('esn_user')).qz_id;
			}catch(e){}
			$rootScope.$on('Fchatlistmessage',function() {
				// body...
				$rootScope.$broadcast("chatlistmessage");
			})
			YYIMChat.init({
				onOpened: function() {
					snsLoginConflict = false; // 连接后, 不冲突, 自动登录

					YYIMUtil['cookie']['set']('username', YYIMChat.getUserID());

					$rootScope.userState.isonline = true;
					
					httpService.dataServiceQ("get", "/qz")
			        .then(function(result) {
			            if(result.code == 0) {
						   	for(var i = 0; i < result.data.length; i++) {
						   		YYIMCacheSpaceManager.updateCache({
						   			id: result.data[i].qz_id,
						   			name: result.data[i].qz_name
						   		});
						   	}
					    }
			            
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentDigset({
							success: function(isEnd){
								$rootScope.$broadcast("chatlistmessage");
							  	$rootScope.$broadcast("unreadchatmessage");
							}
						});
						
						YYIMChat.setPresence(); //设置本人上线
						toaster.pop({
							title: '消息服务器连接成功！',
							type: 'success'
						});
						
						jQuery('#im-message-app').removeClass('hidden');
						jQuery('#login-container').remove();

			        })
			        .catch(function(error) {
			          console.log(error);
			        })
					
				},
				onClosed: function(arg) {
					console.info("连接关闭");
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

					var groupinfo = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().get(arg.from);

					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().KickedOutByGroup(arg);

					if(arg && arg.to && arg.to == YYIMChat.getUserID()){ //beitidiaole
						closeAlldialog();
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().remove(arg.from);
						$rootScope.$broadcast("chatlistmessage");


						$state.go("main.imhome");

						///  此处需要进行历史消息的处理
						$rootScope.$broadcast("unreadchatmessagechange", "我的测试");
						if (groupinfo) {
							var groupname = groupinfo.name;
							var notification = new window.Notification("新消息通知", {
								body: "您被移除群" + groupname,
								icon: "logo.png"
							});

					    }


					}else if(arg && arg.to && arg.to != YYIMChat.getUserID()){

					}else if(arg && !arg.to){
						closeAlldialog();
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().remove(arg.from);
						$rootScope.$broadcast("chatlistmessage");
                        $state.go("main.imhome");
						$rootScope.$broadcast("unreadchatmessagechange", "我的测试");
						if (groupinfo) {
							var groupname = groupinfo.name;
							var notification = new window.Notification("新消息通知", {
								body: groupname+"群已被群主解散",
								icon: "logo.png"
							});

					    }


					}

					//$state.go("imhome");
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
//						if (!$rootScope.issnsLoginConflict) {
//							if (!$rootScope.userState.isonline) {
//								YYIMChat.connect();
//							}
//						}
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
					if (arg.type === 'subscribe') {
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache({
							id: arg.from,
							ask: -1,
							recv: 1,
							subscription: 'none'
						});
					} else if (arg.type === 'subscribed') {
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().updateCache({
							id: arg.from,
							ask: -1,
							recv: -1,
							subscription: 'both'
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
						if (arg.state === 2) {
							var message = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().updateCache({
								id: arg.id,
								sendState: 'readed',
								readedVersion: arg.sessionVersion
							});
							
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
								id: message.opposite,
								type: message.type,
								readedVersion: message.sessionVersion,
								sessionVersion: message.sessionVersion
							});
						}
				
						if (arg.state === 1) {
							var message = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).updateCache({
								id: arg.id,
								dateline: arg.dateline,
								sessionVersion: arg.sessionVersion,
								readedVersion: arg.sessionVersion
							});
							
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
								id: message.opposite,
								type: message.type,
								readedVersion: message.sessionVersion,
								sessionVersion: message.sessionVersion
							});
						}
						
						$rootScope.$broadcast("chatlistmessage");
					}
				},
				onMessage: function(arg) {
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
					 	if (!!arg[x].id){
						 	YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getPubAccountManager().updateCache(arg[x]);
					 	}
					 }
				},
				onWhiteBoardUpdated: function(arg) {
					window.handleUpdateData(arg);
				},
				onTransparentMessage: function(arg) {
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().updateCacheByTransMessage(arg);
				},
				onSmallVideoMessage: function(arg) {
					handleMessageFun(arg);
				},
				onLocationMessage: function(arg){
					handleMessageFun(arg);
				},
				onTransferGroupOwner: function(arg){
					arg.action ="append";
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().updateCache(arg);

				}
			});

			/**
			 * 处理收到的消息
			 * @param {Object} arg
			 */
			var newInfoer;

			function handleMessageFun(arg) {
				var message = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().updateCache(arg);

				if (message.opposite == $stateParams.personId) {
					message.data.isHaveAt = false;
				}
				if(message.received){
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						type: message.type,
						contentType: message.data.contentType,
						sessionVersion: message.sessionVersion,
						sort: true,
						isHaveAt: message.data.isHaveAt
					});
				}else{
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						type: message.type,
						contentType: message.data.contentType,
						sessionVersion: message.sessionVersion,
						readedVersion:message.sessionVersion,
						sort: true,
						isHaveAt: message.data.isHaveAt
					});
				}

				if (!!message.data.isHaveAt) {
					$rootScope.$broadcast("atBySomeOne", message);
				}

				if (!!NWModule && !!message.received) {
					var recent = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().get(message.opposite) || '';
					var newinfo = recent.latestState;
					var newinfo = newinfo.substr(0, 30);

					if (!!newInfoer) {
						clearTimeout(newInfoer);
					}
					if(recent.mute)
						return;
					newInfoer = setTimeout(function() {
						var notification = new window.Notification(recent.name, {
							body: newinfo,
							icon: "logo.png"
						});
	          console.log(recent);
						audioPlayService.play("src/audio/message.mp3");
						notification.onclick = function() {
							win.show();
						}
					}, 50);
				}
				$rootScope.$broadcast("chatlistmessage", message);
				$rootScope.$broadcast("unreadchatmessage", message);
				$rootScope.$broadcast("chatmessage", message);
			}
			function closeAlldialog() {
				var dialoglist = jQuery('.ngdialog');
				for (var i=0;i<dialoglist.length;i++){
					ngDialog.close(jQuery('.ngdialog ')[0].id);
				}

			}

			/**
			 * 拉取联系人在线状态
			 */
			// $interval(function() {
			// 	if ($rootScope.userState.isonline){
			// 	var ids = Object.keys(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().list);

			// 	if ($rootScope.userState.isonline && ids.length > 0 && !$rootScope.issnsLoginConflict) {
			// 		YYIMChat.getRostersPresence({
			// 			username: ids,
			// 			success: function(data) {
			// 				$rootScope.userStatesList = data;
			// 				$rootScope.islogout = false;
			// 			},
			// 			error: function() {
			// 				$rootScope.userStatesList = [];
			// 			}
			// 		});
			// 	}
			//    }
			// }, 10000);
		}
	]);

	return app;
})
