define(["../module",'jquery'], function (module,$) {
	module.controller("mainCtrl", ['$rootScope', '$scope', "$stateParams", "$state", '$cookies', '$interval', "ngDialog", "NWKeyService", "updateService", "$compile","toaster","contactService","jsonService",
	function($rootScope, $scope, $stateParams, $state, $cookies, $interval, ngDialog, NWKeyService, updateService, $compile,toaster,contactService,jsonService) {

		$scope.$on("currentPersonInfo", function(name, data) {
			$scope.currentPersonInfo = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList('myself')[0];
		});

		$scope.ismac = NWKeyService.ismac;
		$scope.iswin = NWKeyService.iswin;
		$scope.islinux = NWKeyService.islinux;
		$scope.NWModule = window.NWModule;

		$scope.reconnect = function(e) {
			YYIMChat.disConnect();
			YYIMChat.connect();
			return false;
		}

		$scope.$on("userstateChange", function(name, data) {

			if (data.status == "chat") {
				$rootScope.userState.isonline = true;
				snsLoginConflict = false;
				$rootScope.islogout = false;
			} else {
				$rootScope.userState.isonline = false;
			}
		});

		$scope.logout = function() {
			YYIMChat.logout();
			//刷新会导致了菜单重新加载多一个。
			// location.reload();
			ngDialog.close();
			$state.go("login");
		}

		$scope.NO_Click = function() {
			ngDialog.close();
		}

		$scope.OK_Click = function() {
			$scope.logout();
		}

		$scope.logoutConfirm = function() {
			$scope.logout();
		}

		$scope.compileservice = function(ele, scope) {
			return $compile(ele)(scope);
		}

		$scope.safeApply = function(fn) {
			var phase = $scope.$$phase;
			if (phase == "$apply" || phase == "$digest") {
				if (fn && (typeof(fn) === "function")) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};


		/**
		 * iframe 打开应用
		 * @param {Object} appinfo
		 */
		$scope.openAppH5 = function(appinfo) {
			ngDialog.open({
				template: 'src/modules/yxim/template/app-Dialog.htm',
				controller: 'appCenterController',
				className: '',
				showClose: false,
				closeByEscape: false,
				closeByDocument: true,
				data: {
					appinfo: appinfo
				}
			});
		}

		$scope.safeApply = function(fn) {
			var phase = $scope.$$phase;
			if (phase == "$apply" || phase == "$digest") {
				if (fn && (typeof(fn) === "function")) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};

		// $interval(function() {
		// 	$scope.safeApply(function() {});
		// }, 400);

		var isEmojiClick = false;
		$scope.hideEmojiPanel = function(){
			$scope.expressionShow.show = false;
			var ele = jQuery('#IMChat_msg_cont');
			var position = ele.prop("selectionStart");;
			setSelectionRange(ele[0],position,position);
		}
		$scope.showEmojiPanel = function(e){
			// isEmojiClick = true;
			// window.setTimeout(function(){
			// 	isEmojiClick=false;
			// },49);
			e.preventDefault();
			$scope.expressionShow.show = true;
			var ele = jQuery('#IMChat_msg_cont');
			var position = ele.prop("selectionStart");;
			setSelectionRange(ele[0],position,position);

		}

		$scope.imTextAreaBlur = function(){
			// window.setTimeout(function(){
			// 	if(isEmojiClick){return;}
			// 	$scope.expressionShow.show = false;
			// },60);
		}

		$scope.exps = SNSExpressionData.DEFAULT;

		$scope.expressionShow = {
			show: false
		};

		function setSelectionRange(input, selectionStart, selectionEnd) {
			 if (input.setSelectionRange) {
				 input.focus();
				 input.setSelectionRange(selectionStart, selectionEnd);
			 }
			 else if (input.createTextRange) {
				 var range = input.createTextRange();
				 range.collapse(true);
				 range.moveEnd('character', selectionEnd);
				 range.moveStart('character', selectionStart);
				 range.select();
			 }
		 }


		$scope.addFace = function(index,e) {
			e.preventDefault();
			$scope.expressionShow.show = false;
			// jQuery('#IMChat_msg_cont').val(jQuery('#IMChat_msg_cont').val().trim() + $scope.exps.data[index].actionData);
			// jQuery('#IMChat_msg_cont').trigger('click').focus();
			// $scope.handleInputMsg();

			var str = $scope.exps.data[index].actionData;
			var ele = jQuery('#IMChat_msg_cont');
			var position = ele.prop("selectionStart");;
			var text = ele.val();
			ele.val(text.slice(0,position) + str +	text.slice(position,text.length));
			setSelectionRange(ele[0],position+str.length,position+str.length);

			jQuery('.IMChat-send-btn').addClass('active').removeAttr('disabled');
		}


		$scope.handleClick = function(event) {
			var _target = jQuery(event.target);
			if (!_target.hasClass('expression-tool')) {
				$scope.expressionShow.show = false;
			}
		}


		$scope.AllUnReadCounts = 0;

		$scope.$on("unreadchatmessage", function(name, data) {
			var length = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().unReadedNum;
			var lengthinfo = length > 99 ? "99+" : length;
			$scope.AllUnReadCounts = lengthinfo;
		})

		$scope.$on("unreadchatmessagechange", function(name, data) {
			var length = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().unReadedNum;
			var lengthinfo = length > 99 ? "99+" : length;
			$scope.AllUnReadCounts = lengthinfo;
		})

		$scope.handleInputMsg = function(e) {
			var _inputBox = jQuery('#IMChat_msg_cont');
			if (jQuery.trim(_inputBox.val()) && !jQuery('.IMChat-send-btn').hasClass('active')) {
				jQuery('.IMChat-send-btn').removeAttr('disabled', '');
				jQuery('.IMChat-send-btn').addClass('active');

			} else if (!jQuery.trim(_inputBox.val())) {
				jQuery('.IMChat-send-btn').removeClass('active').attr('disabled', 'true');
			}
			$scope.$broadcast("AtSomeOne", e);
		}

		$scope.keyDown = function(e) {
			if (e.keyCode === 8 || e.keyCode === 46) {
				$scope.$broadcast("deleteEdit", e, e.keyCode);
			}
		};

		$scope.modelVis = {
			cover: true,
			offlined: true,
			delGroupMem: false
		};

		$scope.doConfirm = function() {
			$scope.modelVis.cover = false;
			$scope.modelVis.offlined = false;
			$scope.modelVis.delGroupMem = false;
		}

		$scope.scanePic = function(e) {
			var target = jQuery(e.target);
			if (target.hasClass('chat-img')) {
				ngDialog.open({
					template: 'src/modules/yxim/template/img-viewer.htm',
					controller: 'mainCtrl',
					className: '',
					showClose: false,
					data: {
						imgSrc: target.attr('src')
					}
				});
			}
		}

		$rootScope.createGroupChat = function(e) {
			ngDialog.open({
				template: 'src/modules/yxim/template/add-groupchat.htm',
				controller: 'addGroupChatController',
				className: '',
				showClose: false,
				data: {
					chatinfo: $scope.chatiteminfo
				}
			});
		};

		//共享文件 右侧弹出层
		$scope.showShareFiles = function (param) {
			// console.log(param);
			ngDialog.open({
				template: 'src/modules/yxim/template/share-files.html',
				className: 'dudu-right-dialog-w',
				showClose: false,
				overlay: false,
				scope: $scope,
				controller:'fileListController',
				closeByDocument:true,
				data:param
			});
		}




		$scope.detailGroupChat = function(e) {
			ngDialog.open({
				template: 'src/modules/yxim/template/group-setup.htm',
				controller: 'groupSetupController',
				className: '',
				showClose: false,
				overlay: false,
				data: {
					chatinfo: $scope.chatiteminfo
				}
			});

		};
		$scope.goToHashPosition = function(e, messagePrompt) {
			e.preventDefault();
			e.stopPropagation();

			if ($stateParams.personId != messagePrompt.personId) {
				$state.go("main.imhomeplus.message", {
					personId: messagePrompt.personId,
					personName: messagePrompt.personName,
					chatType: messagePrompt.chatType,
					author: messagePrompt.author
				});
			} else {
				window.location.hash = messagePrompt.author;
				jQuery('body').scrollTop(0);
			}

			jQuery('#message-prompt').addClass('beforeHide');
			setTimeout(function() {
				$scope.messagePrompt.show = false;
				jQuery('#message-prompt').hide().removeClass('beforeHide');
			}, 500);
		};

		$scope.messagePrompt = {
			show: false
		};

		var atTimeouter = null;
		$scope.$on('atBySomeOne', function(name, message) {
			var type = YYIMAngularConstant.CHAT_TYPE.CHAT;
			var target = (message.from.id == message.opposite) ? message.from : message.to;
			if (target instanceof YYIMCacheGroup) {
				type = YYIMAngularConstant.CHAT_TYPE.GROUP_CHAT;
			} else if (target instanceof YYIMCachePubAccount) {
				type = YYIMAngularConstant.CHAT_TYPE.GROUP_CHAT;
			}

			$scope.messagePrompt = {
				author: message.id,
				show: true,
				title: message.from.name,
				atContent: message.data.content,
				name: !!message.fromRoster ? message.fromRoster.name : message.from.name,
				dateline: message.data.dateline,
				personId: target.id,
				personName: target.name || target.id,
				chatType: type
			};
			jQuery('#message-prompt').show();

			if (!!atTimeouter) clearTimeout(atTimeouter);
			atTimeouter = setTimeout(function() {
				jQuery('#message-prompt').addClass('beforeHide');
				setTimeout(function() {
					$scope.messagePrompt.show = false;
					jQuery('#message-prompt').hide().removeClass('beforeHide');
				}, 500);
			}, 10000)
		});

		//发起电话会议
		$scope.multiPartyCall = function(e,targetMobile){
			var handle;

			var myself = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("myself")[0];
			if(!YYIMRegularUtil.mobile.test(targetMobile)){
				handle = {
					title: '电话会议',
					message: '对方手机号码未设置！！'
				};
			}else if(!YYIMRegularUtil.mobile.test(myself.vcard.mobile)){
				handle = {
					title: '电话会议',
					message: '发起人手机号码未设置！！'
				};
			}else{
				handle = {
					title: '电话会议',
					message: '确定发起电话会议？',
					confirmText: '确定',
					fun: function(e){
						YYIMChat.multiPartyCall({
							caller: myself.vcard.mobile,
							phones: [targetMobile],
							accountMmanaged:true,
							success:function(){
								toaster.pop({
									title: '电话会议发起成功，请稍候！！',
									type: 'success'
								});
								ngDialog.close();
							},error:function(){
								toaster.pop({
									title: '你尚未开通电话会议的权限！！',
									type: 'warn'
								});
								ngDialog.close();
							}
						});
					}
				};
			}

			ngDialog.open({
				template: 'src/modules/yxim/template/confirm-dialog.htm',
				controller: 'confirmController',
				className: '',
				data: handle,
				showClose: false
			});

		};
		var now = new Date();
		var now_year = now.getFullYear();
		var now_month = (now.getMonth()+1);
		var now_day = now.getDate();
		// var now_hour = now.getHours();
		// var now_minu = now.getMinutes();
		// var now_val = now.valueOf();

		$scope.formatTime = function(timestr){
			try{
				timestr = parseInt(timestr);
				var date = new Date(timestr);
				var year = date.getFullYear();
				var month = (date.getMonth()+1);
				var day = date.getDate();
				var hour = date.getHours();
				var minu = date.getMinutes();
				minu = minu<10?("0"+minu):minu;
				var second = date.getSeconds();
				second = second<10?("0"+second):second;
				if(now_year == year && now_month == month && day == now_day){
					return (hour>12?"下午":"上午")+" "+hour+":"+minu;
				}else if(now_year==year){
					return (month<10?("0"+month):month)+"月"+(day<10?("0"+day):day)+"日 "+hour+":"+minu;
				}
				return year+"-"+(month<10?("0"+month):month)+"-"+(day<10?("0"+day):day)+" "+hour+":"+minu;
			}
			catch(e){
				return "";
			}
		}
		$scope.showUserInfo = function () {
			var storage = window.localStorage;
			$scope.esnUser = JSON.parse(storage.getItem("esn_user"));

			ngDialog.open({
				template: 'src/modules/contacts/userInfo.html',
				showClose:false,
				overlay:true,
				scope:$scope,
				disableAnimation:true
			});
		}
		//查看某人信息
		$rootScope.checkRosterInfo = function(member,useritem) {
	    //经销商空间下非管理员
			if ($rootScope.qz_user_type != 0 && $rootScope.qz_user_type != 1) {
				return;
			}

	     var id = '';
	     if(typeof(member) === 'string'){
	       id = member;
	     }else if(typeof(member) === 'object'){
	       id = member.id;
	     }
	     ngDialog.open({
	           template: 'src/modules/contacts/userCard.html',
	           showClose:false,
	           overlay:true,
	           disableAnimation:true,
	           scope: $scope,
	           controller:function(){
								// $scope.$apply(function(){
									if (useritem) {
										$scope.userItem = useritem;
									} else {
										$scope.userItem = null;
									}
									$scope.userCardinfo = null;
								// });
								contactService.getUserInfo({
								  memberId:id,
								  success:function(user){
								    if(user.data){
								      $scope.$apply(function(){
								        user.data.isNotSelf = jsonService.getJson("esn_user").muid!= user.data.member_id;
								        user.data.avatar = user.data.avatar+'.thumb.jpg';
								        $scope.userCardinfo = user.data;
								      });
								    } else {
											$scope.userItem = useritem;
								    }
								  }
								});

								$scope.followtog = function(memberId,follow_status){
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
																			$scope.userCardinfo.follow_status =1;
																			$rootScope.$broadcast("initFollowList");
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
																					 $scope.userCardinfo.follow_status =data.status;
																					 $rootScope.$broadcast("initFollowList");
																				 }
																		 },
																		 error:function(data){}
																 });
															}
													});
											}
								}
									$scope.replaceTxt = function(param) {
										var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
										if(!myreg.test(param)){
											var email = param.split("@");

											return param;
										} else {
											var phone =  param.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
											// console.log(phone);
											return phone;
										}
									}



	           }
	      });
		}

	}
])




})
