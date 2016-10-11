define(["../module"], function (module) {
module.controller("messageController", ["$scope", "$stateParams", "$state", "$rootScope", "_", "$interval", "toaster", "ngDialog", "fileCaptureService", "NWKeyService", "fileConvertService", "SearchService","yimService","jsonService","$sce","messageService", function($scope, $stateParams, $state, $rootScope, _, $interval, toaster, ngDialog, fileCaptureService, NWKeyService, fileConvertService, SearchService,yimService,jsonService,$sce,messageService) {
	// console.log($stateParams.personId + "---" + $stateParams.personName + "---" + $stateParams.chatType+"------"+$stateParams.headerColor);
	// debugger
	window.showloading();
	if ($stateParams.headerColor) {
		$scope.headercolor = $stateParams.headerColor;
	}
	$(".capturecontrl").remove();
	var span = $('<span  class="capturecontrl"></span>');
	span.html('<embed id="screenshotPlugin" wmode="opaque" width="0" height="0" type="application/x-dingscreenshot-plugin"></embed>');
	$("body").append(span);

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

	$interval(function() {
		$scope.safeApply(function() {});
	}, 400);

	var manager = null;
	switch ($stateParams.chatType) {
		case 'groupchat':
			manager = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager();
			break;
		case 'pubaccount':
			manager = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getPubAccountManager();
			break;
		default:
			manager = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager();
			break;
	}

	$scope.entity = manager.get($stateParams.personId);


	// 群组设置 新
	$scope.setGroup = function() {
		// console.log(param);
		//团队聊天设置转web
		// if (param.groupType && param.groupType == 'team') {
		// 	// window.open(WEBRESOURSE.TEAMSETURL);
		// 	if (typeof require != "undefined") {
		// 			try {
		// 				if (!!require('nw.gui')) {
		// 					this.gui = require('nw.gui');
		// 				}
		// 			}
		// 			catch (err){}
		// 	}
		// 	// if (item.templateCode == 16) {
		// 	this.gui.Shell.openExternal(WEBRESOURSE.TEAMSETURL);
		// 	return;
		// }

		ngDialog.open({
			template: 'src/modules/yxim/template/groupSetting.html',
			className: 'dudu-right-dialog-w',
			showClose: false,
			overlay: false,
			scope: $scope,
			controller:'groupSettingController',
			closeByDocument:true,
			data:$scope.entity
		});
	}

	//add by liucyu
	$scope.$on("kickoutGroupMember", function(name, data) {
			$scope.entity = data;//替换缓存中数据
	})

	 // yimService.getUserinfo($scope.entity.name,({
  //       success:function(data) {
  //         $scope.entity.name = data;
  //       },
  //       error:function(err) {
  //         // body...
  //       }
  //     }));

	YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
		id: $scope.entity.id,
		isHaveAt: false
	});


	$scope.chatiteminfo = {
		id: $stateParams.personId,
		name: $scope.entity ? $scope.entity.name : $stateParams.personName,
		type: $stateParams.chatType
	};


	$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
		id: $rootScope.$stateParams.personId,
		condition: 'all'
	});

	if ($scope.chatMessages.length < 10) {
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().getHistoryMessage({
			id: $scope.chatiteminfo.id,
			chatType: $scope.chatiteminfo.type,
			present: $scope.chatMessages.length,
			success: function() {
				$rootScope.$broadcast("chatlistmessage");
				$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
					id: $rootScope.$stateParams.personId,
					condition: 'all'
				});
			}
		});
	}
	window.stoploading();

	$scope.$emit("unreadchatmessagechange", "change");

	$scope.$on("chatmessage", function(name, data) {
		if ($rootScope.$stateParams.personId) {
			$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
				id: $rootScope.$stateParams.personId,
				condition: 'all'
			});

			var scrollDis = jQuery('.message-entity').height() - jQuery('.IMChat-entity-display').scrollTop();
			if (scrollDis > (jQuery('.IMChat-entity-display').height() + 200)) {
				$scope.latest_btn.show = true;
			} else {
				$scope.checkLatest(data);
			}
		} else {
			$scope.$emit("unreadchatmessagechange", "change");
		}
	});


	$scope.$on("groupchatmessage", function(name, data) {
		if ($rootScope.$stateParams.personId) {
			$scope.$apply(function() {
				$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
					id: $rootScope.$stateParams.personId,
					condition: 'all'
				});
			})
			var scrollDis = jQuery('.message-entity').height() - jQuery('.IMChat-entity-display').scrollTop();
			if ($rootScope.$stateParams.personId.toLowerCase() == data.from.id) {
				if (scrollDis > (jQuery('.IMChat-entity-display').height() + 200)) {
					$scope.latest_btn.show = true;
				} else {
					$scope.checkLatest(data);
				}
			}
			$scope.$emit("unreadchatmessagechange", "change");
		}

	})

	$scope.atSomeOne = function(e) {

		jQuery('.IMChat-send-btn').addClass('active').removeAttr('disabled');
		var cursorIndex = $scope.AtHandler.getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
		var temp = '';
		var inputContent = jQuery('#IMChat_msg_cont').val();
		temp += inputContent.slice(0, cursorIndex) + '@';
		temp += inputContent.slice(cursorIndex);
		jQuery('#IMChat_msg_cont').val(temp);
		$scope.AtHandler.setCaretPosition(jQuery('#IMChat_msg_cont')[0], cursorIndex + 1);
		$scope.$emit("AtSomeOne", e);
	};
	$scope.analysisVmailTitle = function(item){
		var i = item.data.extend.displayText.indexOf(" ");
		var from_name = item.data.extend.displayText.substring(0,i);
		return from_name +" "+ item.data.extend.esndata.title;
	};
	$scope.analysisHtml = function(item){
		if (item && item.data && item.data.extend &&item.data.extend.esndata && item.data.extend.esndata.type_detail){

			switch (item.data.extend.esndata.type_detail) {
			case "announce_new":
			case "redpacket_new":
			case "speech_like":
			case "third_party_app":
			case "speech_reply_quan":
			case "speech_reply":
			case "third_notice_pc_app":

				// var reger=new RegExp("[@]\d+[@]","gm");
				// var reg = /^@\d+@$/;
				return item.data.extend.esndata.content.replace(/@\d+@/gm,"");
			case "group_invite_apply":
			case "group_apply":
			case "group_join":
			case "speech_save":
				var i = item.data.extend.displayText.indexOf(" ");
				var from_name = item.data.extend.displayText.substring(0,i);
				return from_name +" "+ item.data.extend.esndata.content;
			default:
				if (item.data.extend.esndata.srcData.name) {

					var from_name = item.data.extend.esndata.srcData.name;
					return from_name +" "+ item.data.extend.esndata.content;
				}
				return item.data.extend.esndata.content;
		  }
		}
		
	}
	//编辑框内容
	$scope.EditBox = {
		content: ''
	};

	$scope.AtHandler = (function() {
		/**
		 * 获取光标的位置
		 * @param {Object} ctrl
		 */
		function getCursortPosition(ctrl) {
			var CaretPos = 0; // IE Support
			if (document.selection) {
				ctrl.focus();
				var Sel = document.selection.createRange();
				Sel.moveStart('character', -ctrl.value.length);
				CaretPos = Sel.text.length;
			}
			// Firefox support
			else if (ctrl.selectionStart || ctrl.selectionStart == '0')
				CaretPos = ctrl.selectionStart;
			return (CaretPos);
		}

		/**
		 * 设置光标的位置
		 * @param {Object} ctrl
		 * @param {Object} pos
		 */
		function setCaretPosition(ctrl, pos) {
			if (ctrl.setSelectionRange) {
				ctrl.focus();
				ctrl.setSelectionRange(pos, pos);
			} else if (ctrl.createTextRange) {
				var range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}

		function appendAtUnit(member) {
			var temp = '';
			var str = jQuery('#IMChat_msg_cont').val();

			var cursorIndex = getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
			var atIndex = str.lastIndexOf('@', cursorIndex - 1);

			var unit = '@' + member.name + ' ';
			temp = str.slice(0, atIndex);
			temp += unit;
			temp += str.slice(cursorIndex);

			var selectPerpleFilter = _.where(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, {
				id: member.id
			});

			if (selectPerpleFilter.length == 0) {
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList.push({
					id: member.id,
					name: member.name,
					start: atIndex,
					end: atIndex + unit.length
				});
			}

			return temp;
		}

		function getAtStr() {
			var temp = '';
			var str = jQuery('#IMChat_msg_cont').val();

			var cursorIndex = getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
			setCaretPosition(jQuery('#textedit-box-hide .cont')[0], cursorIndex);

			var atIndex = str.lastIndexOf('@', cursorIndex - 1);
			var backIndex = str.indexOf(' ', atIndex);

			if (atIndex > -1) {
				temp = str.slice(atIndex, cursorIndex);
				return (backIndex >= cursorIndex || backIndex == -1) ? temp : '';
			}

		}

		function deleteAtStrLeft() {
			var temp = '';
			var str = jQuery('#IMChat_msg_cont').val();

			var cursorIndex = getCursortPosition(jQuery('#IMChat_msg_cont')[0]);

			var atIndex = str.lastIndexOf('@', cursorIndex - 1);
			var backIndex = str.indexOf(' ', atIndex);

			if (atIndex > -1 && backIndex > -1) {
				temp += str.slice(0, atIndex);
				temp += str.slice(cursorIndex);

				if (backIndex == cursorIndex - 1) {
					var deleteName = str.slice(atIndex + 1, backIndex);

					var done = false;
					_.each(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, function(item, index, atuser) {
						if (item.name == deleteName && item.start == atIndex) {
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList = _.filter(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, function(obj) {
								return obj.name != deleteName;
							});
							done = true;
						}
					});
					return done ? temp : str;
				}
			}
			return str;
		}

		function deleteAtStrRight() {
			var temp = '';
			var str = jQuery('#IMChat_msg_cont').val();

			var cursorIndex = getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
			var atIndex = str.indexOf('@', cursorIndex);
			var backIndex = str.indexOf(' ', atIndex);

			if (atIndex > -1 && backIndex > -1) {
				temp += str.slice(0, atIndex);
				temp += str.slice(backIndex + 1);

				if (atIndex == cursorIndex) {
					var deleteName = str.slice(atIndex + 1, backIndex);
					var done = false;

					_.each(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, function(item, index, atuser) {
						if (item.name == deleteName && item.start == atIndex) {
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList = _.filter(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, function(obj) {
								return obj.name != deleteName;
							});
							done = true;
						}
					});

					return done ? temp : str;
				}
			}
			return str;
		}

		function onCursorMove(e) {
			if (e.keyCode >= 37 && e.keyCode <= 40 || e.which == 1) {
				var temp = '';
				var str = jQuery('#IMChat_msg_cont').val();

				var cursorIndex = getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
				var atIndex = str.lastIndexOf('@', cursorIndex - 1);
				var backIndex = str.indexOf(' ', atIndex);

				if (atIndex > -1 && backIndex >= cursorIndex) {
					temp = str.slice(cursorIndex, backIndex);
					if (temp.indexOf('@') == -1) {
						var deleteName = str.slice(atIndex + 1, backIndex);
						var isTarget = false;

						_.each(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, function(item, index, atuser) {
							if (item.name == deleteName && item.start == atIndex) {
								isTarget = true;
							}
						});

						if (isTarget) {
							var target = atIndex;
							if (e.keyCode == 39) {
								target = backIndex + 1;
							}
							setCaretPosition(jQuery('#IMChat_msg_cont')[0], target);
						}
						return !isTarget;
					}
				}
			}
			return true;
		}

		return {
			getCursortPosition: getCursortPosition,
			setCaretPosition: setCaretPosition,
			appendAtUnit: appendAtUnit,
			getAtStr: getAtStr,
			deleteAtStrLeft: deleteAtStrLeft,
			deleteAtStrRight: deleteAtStrRight,
			onCursorMove: onCursorMove
		};
	})();


	$scope.$on('AtSomeOne', function(name, e) {
		if ($stateParams.chatType == 'groupchat') {
			var _inputBox = jQuery('#IMChat_msg_cont');
			if (!!e) {
				var atStr = ''
				if ($scope.AtHandler.onCursorMove(e)) {
					atStr = $scope.AtHandler.getAtStr();
				}
				if (!!atStr) {
					$scope.showAtBox(atStr.replace('@', ''));
				} else {
					jQuery('.IMChat-entity-list').addClass('hidden');
				}
			}
			$scope.EditBox.content = _inputBox.val();
		}
	});

	$scope.$watch("EditBox.content", function(newValue, oldValue) {
		newValue = jQuery.trim(newValue);
		oldValue = jQuery.trim(oldValue);

		if (newValue !== oldValue) {
			var atUserList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList;
			var cursorIndex = $scope.AtHandler.getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
			for (var x in atUserList) {
				if (!!atUserList[x].id && atUserList[x].start >= (cursorIndex - (newValue.length - oldValue.length))) {
					atUserList[x].start += (newValue.length - oldValue.length) || 0;
					atUserList[x].end += (newValue.length - oldValue.length) || 0;
				}
			}
		}
	});

	// $scope.handleClick = function(e) {
	// 	$scope.AtHandler.onCursorMove(e);
	// };

	$scope.$on('deleteEdit', function(name, e, keyCode) {
		if ($stateParams.chatType == 'groupchat') {
			var _inputBox = jQuery('#IMChat_msg_cont');
			var inputCont = _inputBox.val();
			if (keyCode == 8) {
				var deleteAtStr = $scope.AtHandler.deleteAtStrLeft();
			} else if (keyCode == 46) {
				var deleteAtStr = $scope.AtHandler.deleteAtStrRight();
			}

			if (deleteAtStr != inputCont) {
				e.preventDefault();
				e.stopPropagation();
				var cursorIndex = $scope.AtHandler.getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
				$scope.EditBox.content = deleteAtStr;
				_inputBox.val(deleteAtStr);
				$scope.groupMembers.length = 0;
				if (keyCode == 8) {
					$scope.AtHandler.setCaretPosition(jQuery('#IMChat_msg_cont')[0], cursorIndex - (inputCont.length - deleteAtStr.length));
				} else if (keyCode == 46) {
					$scope.AtHandler.setCaretPosition(jQuery('#IMChat_msg_cont')[0], cursorIndex);
				}
			}

		}
	});

	$scope.getMemberTimeouter = null;
	$scope.showAtBox = function(searchStr) {
		var _inputBox = jQuery('#IMChat_msg_cont');
		var inputCont = _inputBox.val();
		var cursorIndex = $scope.AtHandler.getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
		jQuery('#textedit-box-hide .cont').html(inputCont.slice(0, cursorIndex));

		clearTimeout($scope.getMemberTimeouter);
		$scope.getMemberTimeouter = setTimeout(function() {
			$scope.groupMembers = $scope.groupMembers || [];
			$scope.groupMembers.length = 0;
			for (var x in $scope.entity.members) {
				if (!!$scope.entity.members[x].id && $scope.entity.members[x].id != YYIMChat.getUserID()) {
					var selectPerpleFilter = _.where(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().atUserList, {
						id: $scope.entity.members[x].id
					});

					if (selectPerpleFilter.length == 0 && (!searchStr || (!!$scope.entity.members[x].name && $scope.entity.members[x].name.indexOf(searchStr) > -1) || (!!$scope.entity.members[x].email && $scope.entity.members[x].email.indexOf(searchStr) > -1))) {
						$scope.groupMembers.push($scope.entity.members[x]);
					}
				}
			}

			if ($scope.groupMembers.length) {
				jQuery('.IMChat-entity-list').css({
					left: jQuery('#textedit-box-hide .cursor').position().left - 10,
					bottom: jQuery('.textedit-box-container').height() - jQuery('#textedit-box-hide .cursor').position().top + 10
				}).removeClass('hidden');
			}
		}, 200);
	};

	$scope.appendToAt = function(e, member) {
		var _inputBox = jQuery('#IMChat_msg_cont');
		var inputCont = _inputBox.val();
		if (member.id) {
			var cursorIndex = $scope.AtHandler.getCursortPosition(jQuery('#IMChat_msg_cont')[0]);
			var finaStr = $scope.AtHandler.appendAtUnit(member);
			$scope.EditBox.content = finaStr;
			_inputBox.val(finaStr);
			$scope.groupMembers.length = 0;
			$scope.AtHandler.setCaretPosition(jQuery('#IMChat_msg_cont')[0], cursorIndex + finaStr.length - inputCont.length);
			jQuery('.IMChat-entity-list').addClass('hidden');
		}
	}

	$scope.chattype = {
		chattype: $rootScope.$stateParams.chatType
	};

	$scope.getfileurl = function(thumbId) {
		// console.log(YYIMChat.getFileUrl(thumbId));
		return YYIMChat.getFileUrl(thumbId);
	};

	$scope.handleKeyup = function(e) {
		var _inputBox = jQuery('#IMChat_msg_cont');
		if (jQuery.trim(_inputBox.text()) && !jQuery('.IMChat-send-btn').hasClass('active')) {
			jQuery('.IMChat-send-btn').addClass('active');
		} else {
			jQuery('.IMChat-send-btn').removeClass('active');
		}
	};

	$scope.presskey = function(e) {
		var key = jsonService.getJson("esn_user").user_id;
		var obj = jsonService.getJson(key);
		if (obj && !obj.isChoose) {
			if ((e.keyCode == 13 || e.keyCode == 10) && e.ctrlKey) {
				if ($(".textedit-box").val().trim()) {
					$scope.sendMessage();
				}
				e.preventDefault();
				e.stopPropagation();
			}
		} else if(obj && obj.isChoose){
			if (e.keyCode == 13 && !e.ctrlKey) {
				if ($(".textedit-box").val().trim()) {
					$scope.sendMessage();
				}
				e.preventDefault();
				e.stopPropagation();
			}
		} else {
			if (e.keyCode == 13 && !e.ctrlKey) {
				if ($(".textedit-box").val().trim()) {
					$scope.sendMessage();
				}
				e.preventDefault();
				e.stopPropagation();
			}
		}
	};

	$scope.canLoad = true;


	$scope.pullHistoryMessage = function(sucCallBack) {
		jQuery('.loading-animation').removeClass('hidden');
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().getHistoryMessage({
			id: $rootScope.$stateParams.personId,
			chatType: $scope.chatiteminfo.type,
			success: function() {
				$scope.safeApply(function() {
					$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
						id: $rootScope.$stateParams.personId,
						condition: 'all'
					});
					jQuery('.loading-animation').addClass('hidden');
					sucCallBack();
					// jQuery('.IMChat-entity-display').scrollTop('5');
				})
			}
		});
	}

	/**
	 * 获取文档 转换情况
	 * @param {Object} e
	 * @param {Object} attach
	 */
	$scope.getTransformResult = function(e, attach) {
		YYIMChat.getTransformFileList({
			attachId: attach.attachId,
			success: function(data) {
				if (!!data && data.result) {
					$scope.openWhiteBoard(data.result || []);
				} else {
					toaster.pop({
						title: '该文档不能预览！',
						type: 'warn'
					});
				}
			}
		});
	};

	/**
	 * 发送白板消息 20160329
	 * @param {Object} e
	 */
	$scope.sendWhiteBoard = function(text) {
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().sendWhiteBoardMessage({
			to: $rootScope.$stateParams.personId,
			type: $rootScope.$stateParams.chatType,
			content: {
				wid: window.currentWhiteBoard.wid,
				name: window.currentWhiteBoard.name,
				text: text
			},
			success: function(message) {
				YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
					id: message.opposite,
					dateline: message.dateline,
					latestState: message.data,
					type: message.type,
					contentType: message.data.contentType,
					sort: true
				});
				$rootScope.$broadcast("chatlistmessage");

				$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
					id: $rootScope.$stateParams.personId,
					condition: 'all'
				});
				jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height());
				$scope.checkLatest();
			},
			error: function(err) {
				toaster.pop({
					title: '白板发送失败，请重试！',
					type: 'error',
					showCloseButton: true
				});
			}
		});
	};

	/**
	 * 监听白板  20160329
	 * @param {Object} content
	 * @param {Object} e
	 */
	$scope.listenToWhiteBorad = function(content, e) {

		if (!$rootScope.userState.isonline) {
			toaster.pop({
				title: '您已经离线,不能打开白板，请退出重试！',
				type: 'warn'
			});
			return false;
		}


		var origin = YYIMChat.getUserID();
		if ($rootScope.$stateParams.chatType == 'groupchat') {
			origin = $rootScope.$stateParams.personId;
		}

		YYIMChat.operateWhiteBoard({
			wid: content.wid,
			origin: origin,
			operation: 'listen',
			success: function(data) {
				if (!!data.wid) {
					window.currentWhiteBoard = {
						wid: data.wid,
						name: data.name
					};

					if (jQuery('#whiteBoradCover > *').length < 2) {
						jQuery.get('message/whiteboard/whiteboard.html').done(function(data) {
							jQuery('#whiteBoradCover').append(data);
						});
					}
					setTimeout(function() {
						resizeHandler()
					}, 500)
					jQuery('#whiteBoradCover').show();
					svgCanvas.undoMgr.resetUndoStack();
					window.temVar.loadFromString("" + decodeURIComponent(data.data.replace(/&amp;/g, '&')));
					//					window.temVar.loadFromString(""+(data.data));
				}
			},
			error: function() {
				toaster.pop({
					title: '您刚刚监听白板：' + window.currentWhiteBoard + '失败了！',
					type: 'error',
					showCloseButton: true
				});
			}
		});
	};

	/**
	 * 关闭白板 20160329
	 * @param {Object} e
	 */
	$rootScope.closeWhiteBoard = function(e) {

		jQuery('#whiteBoradCover').hide();

		if (!$rootScope.userState.isonline) {
			toaster.pop({
				title: '您已经离线,不能发送关闭消息，请退出重试！',
				type: 'warn'
			});
			return false;
		}

		var origin = YYIMChat.getUserID();
		if ($rootScope.$stateParams.chatType == 'groupchat') {
			origin = $rootScope.$stateParams.personId;
		}

		if (window.svgCanvas.undoMgr.undoStack.length > 1) {
			$scope.sendWhiteBoard(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList('myself')[0].name + '标注了一个白板');
		}

		YYIMChat.operateWhiteBoard({
			wid: window.currentWhiteBoard.wid,
			origin: origin,
			operation: 'end',
			success: function(data) {

			},
			error: function() {}
		});
	};

	/**
	 * 新建白板 20160329
	 * @param {Object} e
	 */
	$scope.openWhiteBoard = function(files) {

		if (!$rootScope.userState.isonline) {
			toaster.pop({
				title: '您已经离线,不能创建白板，请退出重试！',
				type: 'warn'
			});
			return false;
		}


		var origin = YYIMChat.getUserID();
		if ($rootScope.$stateParams.chatType == 'groupchat') {
			origin = $rootScope.$stateParams.personId;
		}

		var whiteName = '白板';

		YYIMChat.operateWhiteBoard({
			name: whiteName,
			origin: origin,
			operation: 'create',
			success: function(data) {
				if (!!data.wid) {
					window.currentWhiteBoard = {
						wid: data.wid,
						name: whiteName,
						files: files
					};

					$scope.sendWhiteBoard(YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList('myself')[0].name + '创建了一个白板');

					if (jQuery('#whiteBoradCover > *').length < 2) {
						jQuery.get('message/whiteboard/whiteboard.html').done(function(data) {
							jQuery('#whiteBoradCover').append(data);
						});
					}
					setTimeout(function() {
						resizeHandler()
					}, 500)
					jQuery('#whiteBoradCover').show();
					svgCanvas.undoMgr.resetUndoStack();
					window.temVar.loadFromString('<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="980" height="800"><g><title>Layer 1</title></g></svg>');
				}
			},
			error: function() {
				toaster.pop({
					title: '白板创建失败！',
					type: 'error',
					showCloseButton: true
				});
			}
		});
	};


	//非window 平台下的屏幕截图显示
	$scope.showSendImageDialogByScreenCut = function(data){
		$scope.isShowSendImageDialog = true;
		// var data = data.toString('base64');
		$scope.imagefiletype = "data:image/png;base64," + data;

	}

	//  文件發送
	var picFileMark,curSendPicArg;

	$scope.hideSendImageDialig = function(){
		$scope.isShowSendImageDialog = false;
		$scope.isScreenCut = false;
		$scope.imagename = "";
		$scope.sendimagefilesize = "";
		YYIMChat.cancelUpload(curSendPicArg.fileInputId,curSendPicArg.file.id)
	}

	$scope.realSendPicFile = function(){
		if (!$rootScope.userState.isonline) {
			toast('您已经离线,不能发送消息，请退出重试！',1000);
		} else {
			//截图情况下

			$scope.isShowSendImageDialog = false;
			if ($scope.isScreenCut) {
				$scope.sendScreenpic($scope.screenCapture);
				$scope.isScreenCut = false;
				return;
			}
		}
		var dateline = 0;
		var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
		var all = !alldata?[]:alldata.all;

		if(all.length>0){
			dateline = all[all.length-1].dateline+1;
		}
		all.push(
			{
				filemark:picFileMark,
				type:"photoItemWhichFromSelf",
				avaster:avaster,
				sendername:currName,
				dateline:dateline,
				sendingstatus:"发送中"
			}
		);
		$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
			id: $rootScope.$stateParams.personId,
			condition: 'all'
		});

		$scope.isShowSendImageDialog = false;
		YYIMChat.startUpload(curSendPicArg.fileInputId);
	}
	$scope.sendpicFile = function(e) {
		picFileMark = (new Date()).valueOf();
		if (!$rootScope.userState.isonline) {
			toast('您已经离线,不能发送消息，请退出重试！',1000);
		} else {
			//截图情况下
			if ($scope.isScreenCut) {
				$scope.sendScreenpic($scope.screenCapture);
				$scope.isScreenCut = false;
				return;
			}
			var photofile = e.files[0];
			var IMAGE_TYPES = ["png", "gif", "jpg", "bmp"];

			if (photofile) {

				if (photofile.size > 104857600) {
					// toaster.pop({
					// 	title: ' 文件大小仅限100M！',
					// 	type: 'warn',
					// 	showCloseButton: true
					// });
					toast(' 文件大小不能超过100M！',1000);
					return;
				}

				var index = photofile.name.lastIndexOf('.');
				var strtype = photofile.name.substr(index + 1);
				strtype = strtype.toLowerCase();
				// debugger
				if (jQuery.inArray(strtype, IMAGE_TYPES) >= 0) {
					//增加一个占位

					// console.log($scope.chatMessages);
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().sendPicMessage({
						fileInputId: "file_upload_input",
						chatInfo: function() {
							return {
								to: $rootScope.$stateParams.personId,
				        type: $rootScope.$stateParams.chatType
							}
						},
						fileFiltered:function(arg){
							// alert("pic fileFiltered");
							var fileName = arg.file.name;
							var fileType = (fileName.split(".")[1]||"").toUpperCase();
							$scope.imagefiletype = "./src/style/css/images/filetype/image@2x.png";
							$scope.imagename = fileName;
							$scope.sendimagefilesize = FormatSize(arg.file.size);

							curSendPicArg = arg;
							$scope.isShowSendImageDialog = true;
						},
						beforeUpload:function(){
						},
						success: function(message) {
							var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
							var all = !alldata?[]:alldata.all;
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
								id: message.opposite,
								dateline: message.dateline,
								latestState: message.data,
								type: message.type,
								contentType: message.data.contentType,
								readedVersion: message.sessionVersion,
		            sessionVersion: message.sessionVersion,
								sort: true
							});
							$rootScope.$broadcast("chatlistmessage");
							//更新占位的信息

							for(var i=all.length-1;i>=0;i--){
								var itemdata = all[i];
								//如果存在间隔短发送文件 导致的filemark变量混淆 那么需要sendFileMessage方法中将该参数传入
								//再由success 方法传入
								if(itemdata.filemark == picFileMark){
									itemdata.sendingstatus = "";
									break;
								}

							}

							$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
								id: $rootScope.$stateParams.personId,
								condition: 'all'
							});
							jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height());
							$scope.checkLatest();
							toaster.pop({
								title: '图片发送成功！',
								type: 'success',
								showCloseButton: true
							});
						},
						error: function(err) {
							toast('图片发送失败，请重试！',1000);
							// toaster.pop({
							// 	title: '图片发送失败，请重试！',
							// 	type: 'error',
							// 	showCloseButton: true
							// });
						}
					})

				} else {
					toast('图片格式不支持！',1000);
					// toaster.pop({
					// 	title: '图片格式不支持！',
					// 	type: 'warn'
					// });
				}
			}
		}
	}

	// $scope.OK_Click = function() {



		// var formdata = new FormData();
		// var file = fileConvertService.b64ToFile($scope.ngDialogData.picdata, "image/png", "capture.png")
		// formdata.append("file", file);
		// IMChatHandler.getInstance().sendFormMessage({
		// 	to: $rootScope.$stateParams.personId,
		// 	file: {
		// 		name: "capture.png",
		// 		size: file.size
		// 	},
		// 	mediaType: 1,
		// 	type: $rootScope.$stateParams.chatType,
		// 	data: formdata,
		// 	success: function(data) {
		//
		//
		// 		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
		// 						id: message.opposite,
		// 						dateline: message.dateline,
		// 						latestState: message.data.content,
		// 						type: message.type,
		// 						contentType: message.data.contentType,
		// 						readedVersion: message.sessionVersion,
		// 			            sessionVersion: message.sessionVersion,
		// 						sort: true
		// 					});
		//
		// 		// toaster.pop({
		// 		// 	title: '截图发送成功！',
		// 		// 	type: 'success',
		// 		// 	showCloseButton: true
		// 		// });
		// 		// var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
		// 		// var all = !alldata?[]:alldata.all;
		// 		// for(var i=all.length-1;i>=0;i--){
		// 		// 	var itemdata = all[i];
		// 		// 	//如果存在间隔短发送文件 导致的filemark变量混淆 那么需要sendFileMessage方法中将该参数传入
		// 		// 	//再由success 方法传入
		// 		// 	if(itemdata.filemark == picFileMark){
		// 		// 		itemdata.sendingstatus = "";
		// 		// 		break;
		// 		// 	}
		// 		//
		// 		// }
		//
		//
		//
		// 		$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
		// 			id: $rootScope.$stateParams.personId,
		// 			condition: 'all'
		// 		});
		// 		$scope.checkLatest();
		// 		$state.transitionTo("main.imhomeplus.message", {
		// 			personId: $scope.chatiteminfo.id,
		// 			personName: $scope.chatiteminfo.name,
		// 			chatType: $scope.chatiteminfo.type
		// 		}, {
		// 			location: true,
		// 			inherit: true,
		// 			notify: true,
		// 			reload: true
		// 		});
		// 		ngDialog.close();
		// 	},
		// 	error: function() {
		// 		toast('图片发送失败，请重试！',1000);
		// 		// toaster.pop({
		// 		// 	title: ' 图片发送失败，请重试！',
		// 		// 	type: 'error',
		// 		// 	showCloseButton: true
		// 		// });
		// 		ngDialog.close();
		// 	}
		// })


	// }
	$scope.arrayBufferToBase64 = function( buffer, callback ) {
    var blob = new Blob([buffer],{type:'application/octet-binary'});
    var reader = new FileReader();
    reader.onload = function(evt){
        var dataurl = evt.target.result;
        callback(dataurl.substr(dataurl.indexOf(',')+1));
    };
    reader.readAsDataURL(blob);
	}
	$scope.sendScreenpic = function(picdata) {

		var formdata = new FormData();
		// var basedata = picdata.toString('base64');
		// console.log(basedata);
		var file = fileConvertService.b64ToFile(picdata, "image/png", "capture.png");
		formdata.append("file", file);

		var dateline = 0;
		var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
		var all = !alldata?[]:alldata.all;

		var ScreenPicFileMark = (new Date()).valueOf();
		if(all.length>0){
			dateline = all[all.length-1].dateline+1;
		}
		all.push(
			{
				filemark:ScreenPicFileMark,
				type:"photoItemWhichFromSelf",
				avaster:avaster,
				sendername:currName,
				dateline:dateline,
				sendingstatus:"发送中"
			}
		);
		YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().sendFormMessage({
			to: $rootScope.$stateParams.personId,
			file: {
				name: "capture.png",
				size: file.size
			},
			mediaType: 1,
			type: $rootScope.$stateParams.chatType,
			data: formdata,
			success: function(data) {
				var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
				var all =!alldata?[]:alldata.all;

				// toaster.pop({
				// 	title: '截图发送成功！',
				// 	type: 'success',
				// 	showCloseButton: true
				// });
				// toast('截图发送成功！',1000);
				// alert('截图发送成功！');
				$rootScope.$broadcast("chatlistmessage");
				for(var i=all.length-1;i>=0;i--){
					var itemdata = all[i];
					if(itemdata.filemark == ScreenPicFileMark){
						itemdata.sendingstatus = "";
						break;
					}
				}
				$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
					id: $rootScope.$stateParams.personId,
					condition: 'all'
				});
				$scope.checkLatest();
			},
			error: function() {
				for(var i=all.length-1;i>=0;i--){
					var itemdata = all[i];
					if(itemdata.filemark == ScreenPicFileMark){
						itemdata.sendingstatus = "";
						break;
					}
				}
				// toaster.pop({
				// 	title: ' 图片发送失败，请重试！',
				// 	type: 'error',
				// 	showCloseButton: true
				// });
				toast('截图发送失败！',1000);
				ngDialog.close();
			}
		})

	}
	$scope.NO_Click = function() {
		ngDialog.close();
	}
	/// 此处是解决页面打开iframe奇特的滚动问题
	$scope.ismac = NWKeyService.ismac;
	$scope.iswin = NWKeyService.iswin;
	$scope.islinux = NWKeyService.islinux;

	$(window).on("keydown", function(e) {
		var shift = e.shiftKey;
		if (shift) {
			window.shiftpress = true;
		}
	});
	var currentE = null,currentImageE = null;

	$scope.isShowSendFileDialog = false;
	$scope.isShowSendImageDialog = false;
	$scope.isScreenCut = false;
	$scope.imagename = "";
	$scope.sendimagefilesize = "";


	function FormatSize(fileSize){
    var arrUnit = ["B", "KB","MB", "G", "T", "P"];
    var powerIndex = Math.log2(fileSize) / 10;
    powerIndex = Math.floor(powerIndex);
    var len = arrUnit.length;
    powerIndex = powerIndex < len ? powerIndex : len - 1;
    var sizeFormatted = fileSize / Math.pow(2, powerIndex * 10);
    sizeFormatted = sizeFormatted.toFixed(2);
		if(powerIndex >1 ){
			$scope.sizeFormatted = sizeFormatted;
		} else {
			$scope.sizeFormatted = 0;
		}
    return sizeFormatted + " " + arrUnit[powerIndex];
	}
	//  发送文件
	var FileMapping = {
		"PNG":"image@2x.png",
		"JPG":"image@2x.png",
		"JPEG":"image@2x.png",
		"GIF":"image@2x.png",
		"BMP":"image@2x.png",
		"PPT":"ppt@2x.png",
		"PPTX":"ppt@2x.png",
		"PDF":"pdf@2x.png",
		"DOCX":"word@2x.png",
		"DOC":"word@2x.png",
		"XLSX":"excel@2x.png",
		"XLS":"excel@2x.png",
		"ZIP":"zipfile@2x.png",
		"RAR":"zipfile@2x.png",
		"7Z":"zipfile@2x.png",
		"CAB":"zipfile@2x.png",
		"ARJ":"zipfile@2x.png"
	};
	$scope.showSendFileDialog = function(e){
		currentE = e;
		$scope.isShowSendFileDialog = true;
		var fileName = e.files[0].name;
		var fileType = (fileName.split(".")[1]||"").toUpperCase();
		$scope.filetype = "./src/style/css/images/filetype/"+(FileMapping[fileType]||"other@2x.png");
		$scope.sendfilename = fileName;
		$scope.sendfilesize = FormatSize(e.files[0].size);
	}

	$scope.loadFile=function(item){
		if(item.filesrc){
			document.getElementById("loadfileframe").src = item.filesrc;
		}
	}
	var userInfo = jsonService.getJson("esn_user");
	var avaster = userInfo.avatar_middle;
	var currName = userInfo.uname;
	var curSendFileArg = null;
	var fileMark;

	$scope.realSendFile = function(){
		//增加一个占位
		var dateline = 0;
		var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
		var all =!alldata?[]:alldata.all;
		if(all.length>0){
			dateline = all[all.length-1].dateline+1;
		}
		all.push(
			{
				type:"fileItemWhichFromSelf",
				filemark:fileMark,
				filename:$scope.sendfilename,
				filesize:$scope.sendfilesize,
				avaster:avaster,
				sendername:currName,
				dateline:dateline,
				fileimage:$scope.filetype,
				sendingstatus:"发送中"
			}
		);
		$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
			id: $rootScope.$stateParams.personId,
			condition: 'all'
		});

		window.setTimeout(function(){
			jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height()+100);
		},1);

		YYIMChat.startUpload(curSendFileArg.fileInputId);
		$scope.isShowSendFileDialog = false;
	}
	$scope.hideSendFileDialig = function(){
		$scope.isShowSendFileDialog = false;
		YYIMChat.cancelUpload(curSendFileArg.fileInputId,curSendFileArg.file.id);
	}

	$scope.sendFile = function(e) {
		fileMark =(new Date()).valueOf();


		//e.value=""; todo。。验证发送成功后放开。。。
		if (!$rootScope.userState.isonline) {
			toast('您已经离线,不能发送消息，请退出重试！',1000);
		} else {
			var photofile = e.files[0];
			if (photofile) {
				if (photofile.size <= 104857600) {
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().sendFileMessage({
						fileInputId: "file_upload_inputfile",
						chatInfo: function() {
							return {
								to: $rootScope.$stateParams.personId,
				        type: $rootScope.$stateParams.chatType
							}
						},
						fileFiltered:function(arg){
							var fileName = arg.file.name;
							var fileType = (fileName.split(".")[1]||"").toUpperCase();
							$scope.filetype = "./src/style/css/images/filetype/"+(FileMapping[fileType]||"other@2x.png");
							$scope.sendfilename = fileName;
							$scope.sendfilesize = FormatSize(arg.file.size);
							curSendFileArg = arg;
							$scope.isShowSendFileDialog = true;
						},
						beforeUpload:function(){

						},
						transform: true,
						success: function(message) {
							var alldata = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().messList[$rootScope.$stateParams.personId];
							var all =!alldata?[]:alldata.all;
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
								id: message.opposite,
								dateline: message.dateline,
								latestState: message.data.content,
								type: message.type,
								contentType: message.data.contentType,
								readedVersion: message.sessionVersion,
		            sessionVersion: message.sessionVersion,
								sort: true
							});
							//更新占位的信息
							for(var i=all.length-1;i>=0;i--){
								var itemdata = all[i];
								//如果存在间隔短发送文件 导致的filemark变量混淆 那么需要sendFileMessage方法中将该参数传入
								//再由success 方法传入
								if(itemdata.filemark == fileMark){
									itemdata.sendingstatus = "";
									itemdata.filesrc = message.data.content.path;
									break;
								}

							}


							// $rootScope.$broadcast("chatlistmessage");
							// $scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
							// 	id: $rootScope.$stateParams.personId,
							// 	condition: 'all'
							// });
							$scope.checkLatest();
							// toast('文件发送成功！！',1000);
						},
						error: function() {
							for(var i=all.length-1;i>=0;i--){
								var itemdata = all[i];
								if(itemdata.filemark == fileMark){
									itemdata.sendingstatus = "发送失败";
									itemdata.filesrc = message.data.content.path;
									break;
								}
							}
							// toast( ' 文件发送失败，请重试！',1000);
						},
						progress:function(data){
							// console.log(data.percent);
						}
					});

				} else {
				toast(' 文件大小不能超过100M！',1000);
					// toaster.pop({
					// 	title: ' 文件大小仅限100M！',
					// 	type: 'warn',
					// 	showCloseButton: true
					// });
				}

			}
		}
	}
	/***增加群成员提醒**/
	$scope.$on('groupAddMemberRemind',function(e){
		//TODO
	});


	$scope.sendMessage = function() {
		if (!$rootScope.userState.isonline) {

			toast('您已经离线,不能发送消息，请退出重试！',1000);
		} else {
			var chattype = $rootScope.$stateParams.chatType;
			var text = $scope.htmlEscape($(".textedit-box").val().trim());
			YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().sendTextMessage({
				to: $rootScope.$stateParams.personId,
				msg: text,
				type: chattype,
				success: function(message) {

					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						readedVersion: message.sessionVersion,
					    sessionVersion: message.sessionVersion,
						type: message.type,
						sort: true
					});
					$rootScope.$broadcast("chatlistmessage");

					$scope.chatMessages = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().showMessageList({
						id: $rootScope.$stateParams.personId,
						condition: 'all'
					});
					$(".textedit-box").val("");
					jQuery('.IMChat-send-btn').removeClass('active').attr('disabled', 'true');
					jQuery('.list-wrapper').scrollTop(0); // 最近聊天的显示头部
					// jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height());
					// setTimeout(function() {
					// 	jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height())
					// }, 50);
					window.setTimeout(function(){
						jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height()+100);
					},100);
				},
				error: function() {
					toaster.pop({
						title: '消息发送失败,请重试！',
						type: 'warn'
					});
				}
			});
		}
	}

	$scope.htmlEscape = function(html) {
		return html.replace(/[<>"&]/g, function(match, pos, origin) {
			switch (match) {
				case "<":
					return "&lt";
					break;
				case ">":
					return "&gt";
					break;
				case "&":
					return "&amp";
				case "\"":
					return "&quot";
					break;
			}
		})
	}

	//消息面板右上角  单聊转群聊点击事件
	$scope.personSetup_Click = function(param) {
		var myself = JSON.parse(localStorage.getItem('esn_user'));
		ngDialog.open({
        template: 'src/modules/yxim/template/personSetting.html',
        showClose: false,
        overlay: false,
				className: 'dudu-right-dialog-w',
				closeByDocument:true,
        scope: $scope,
        controller:'personalSettingController',
				data:{
					chatinfo:$scope.chatiteminfo,
					myself:myself,
					entity:$scope.entity
				}
      });
	}
	//通知、公告点击查看详情事件
	$scope.viewDetails_Click = function(item){
		console.log(item);
		//FIXME 本次迭代先为跳转到web端查看详情
		if (typeof require != "undefined") {
				try {
					if (!!require('nw.gui')) {
						this.gui = require('nw.gui');
					}
				}
				catch (err){}
		}
		if (item.templateCode == 16) {
			this.gui.Shell.openExternal(item.data.content.contentSourceUrl);
		}else {
			var url = "";
			if (item.data.extend || item.data.extend.esndata || item.data.extend.esndata.detail_url) {
				url = item.data.content.contentSourceUrl;
			}
			var _this = this;
			if (item.from.noticyType=="vmail") {
				messageService.getClientCode({success:function(data){
					_this.gui.Shell.openExternal(httpHost+webUrl.vmailUrl+item.from.spaceId+"/"+item.data.extend.esndata.from_id+"?client_code="+data.code);
				}});
			} else if (item.from.noticyType =='feed') {
				//http://123.103.9.204:91/space/home/detail/feedid/339163/VISITID/1
				messageService.getClientCode({success:function(data){
					var feedId = "";
					if(item.data.extend.esndata.srcData.fromSrcData){
						feedId = item.data.extend.esndata.srcData.fromSrcData.feedId;
					} else {
						feedId = item.data.extend.esndata.srcData.feedId;
					}
					_this.gui.Shell.openExternal(httpHost+webUrl.feedUrl+feedId+"/VISITID/"+item.from.spaceId+"?client_code="+data.code);
				}});
			}
			else if (item.from.noticyType =='app') {
				switch (item.data.extend.esndata.type_detail) {
					case "redpacket_new":
						messageService.getClientCode({success:function(data){
							_this.gui.Shell.openExternal(httpHost+webUrl.redpacketUrl+item.from.spaceId+"?client_code="+data.code);
						}});
						break;
					case "announce_new":
						messageService.getClientCode({success:function(data){
							_this.gui.Shell.openExternal(httpHost+webUrl.announceUrl+item.data.extend.esndata.from_id+"/VISITID/"+item.from.spaceId+"?client_code="+data.code);
						}});
						break;
					case "task_invite":
					case "task_injoin":
					case "task_submit":
					case "task_inform":
					case "task_restart":
					case "task_accept":
					case "task_refuse":
					case "task_close":
					case "task_open":
					case "task_startnotice":
					case "task_endnotice":
					case "task_delete":
					case "task_evaluation":
					case "task_transferred":
						messageService.getClientCode({success:function(data){
							_this.gui.Shell.openExternal(httpHost+webUrl.taskUrl+item.data.extend.esndata.from_id+"/VISITID/"+item.from.spaceId+"?client_code="+data.code);
						}});
						break;
					case "schedule_invite":
					case "calendar_share":
						messageService.getClientCode({success:function(data){
							_this.gui.Shell.openExternal(httpHost+webUrl.scheduleUrl+item.data.extend.esndata.from_id+"/VISITID/"+item.from.spaceId+"?client_code="+data.code);
						}});
						break;
					case "third_party_app":
						this.gui.Shell.openExternal(item.data.extend.esndata.detail_url);
						break;
					case "third_notice_pc_app":
						// item.data.extend.esndata.note
						messageService.getCode({success:function(code){
							if (item.data.extend.esndata.note.callbackUrl.indexOf("?")>-1) {
								this.gui.Shell.openExternal(item.data.extend.esndata.note.callbackUrl+"&esnclient=web&code="+code);
							} else {
									this.gui.Shell.openExternal(item.data.extend.esndata.note.callbackUrl+"?esnclient=web&code="+code);
							}
						},error:function(error){}});
						break;
					default:

				}
			}
			else if (item.data.extend.esndata.type_detail =='group_admin_join' || item.data.extend.esndata.type_detail =='group_invite_apply') {
				// http://123.103.9.204:91/group/index/index/gid/3058/VISITID/1
				messageService.getClientCode({success:function(data){
					_this.gui.Shell.openExternal(httpHost+webUrl.teamUrl+item.data.extend.esndata.from_id+"/VISITID/"+item.from.spaceId+"?client_code="+data.code);
				}});
			} else if (item.data.extend.esndata.type_detail =='qz_apply_new') {
				messageService.getClientCode({success:function(data){
					_this.gui.Shell.openExternal(httpHost+webUrl.spaceUrl+item.from.spaceId+"?client_code="+data.code);
				}});
			}
		}
	}

	$scope.screenCut=function(){

		if (!NWModule) return;

		var os = require('os');
		var platform = os.platform();
		// console.log(platform);
		// $scope.$apply(function(){
			$scope.imagename = '';
			$scope.sendimagefilesize = '';
		// });
		if (platform == "win32") {
			require('screencutjs').start(
			  {type:'file/png'},
			  function(result){
			  // console.log('screencut result: ' + JSON.stringify(result));
			  var fs= require('fs');
			  fs.readFile(result.file,"base64",function (err, data) {
					  if (err) throw err;
					  // console.log(data);
					  // $scope.sendScreenpic(data);

						compressBaseStr(data,function(realData){
							 data = realData.split(",")[1];
							//  $scope.sendScreenpic(data);
								$scope.screenCapture = data;
								$scope.isScreenCut = true;
								$scope.showSendImageDialogByScreenCut(data);
						 });
					});
			});
		}else{
			//其他平台下 截图支持
			var screencapture = require('screencapture');
			screencapture(function (err, imagePath) {
				var fs= require('fs');
				// test(imagePath)
				// console.log(imagePath);

				if (imagePath && !err) {
				// 	console.log(imagePath);
					fs.readFile(imagePath,"base64", function (err, data) {

							if (!err) {
							 compressBaseStr(data,function(realData){
									data = realData.split(",")[1];
									$scope.screenCapture = data;
									$scope.isScreenCut = true;
									$scope.showSendImageDialogByScreenCut(data);
								});


								// $scope.screenCapture = data;
								// $scope.isScreenCut = true;
								// $scope.showSendImageDialogByScreenCut(data);
							}
						});
				}

			})
		}

	}

	function compressBaseStr(baseStr,success) {
		var img = new Image;

		img.onload = resizeImage;
		img.src = base64ToDataUri(baseStr);
		// console.log(img);
		function resizeImage() {
			var size = getCompressSize(2000,1200,img);
		  var newDataUri =  imageToDataUri(img, size.width, size.height);
		  // continue from here...
			success(newDataUri);
		}
 };

 function getCompressSize(maxWidth, maxHeight, img) {
  var hRatio;
  var wRatio;
  var Ratio = 1;
  var w = img.width;
  var h = img.height;
  wRatio = maxWidth / w;
  hRatio = maxHeight / h;
  if (maxWidth == 0 && maxHeight == 0) {
    Ratio = 1;
  } else if (maxWidth == 0) { //
    if (hRatio < 1) Ratio = hRatio;
  } else if (maxHeight == 0) {
    if (wRatio < 1) Ratio = wRatio;
  } else if (wRatio < 1 || hRatio < 1) {
    Ratio = (wRatio <= hRatio ? wRatio: hRatio);
  }
  if (Ratio < 1) {
    w = w * Ratio;
    h = h * Ratio;
  }
  return {width:w,height:h};
}
 function base64ToDataUri(base64) {
    return 'data:image/png;base64,' + base64;
 }
 function imageToDataUri(img, width, height) {

    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    // set its dimension to target size
    canvas.width = width;
    canvas.height = height;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);

    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL();
}

	$scope.sources = {src: $sce.trustAsResourceUrl("http://yyim-test.oss-cn-qingdao.aliyuncs.com/upesn/esntest/153436/20160806/1804/27290337-801a-4707-9b7a-ea03e9fd1df0.mp4"), type: "video/mp4"};


	$scope.videopath = function(path) {
		return $sce.trustAsResourceUrl(path);
	}
	/* 聊天窗口新消息提醒 by yangjz0*/
	$scope.latest_btn = {
		show: false
	};

	var scrollClock = false;
	$scope.checkLatest = function(data) {
		if (scrollClock) clearTimeout(scrollClock)
		scrollClock = setTimeout(function() {
			jQuery('.IMChat-entity-display').scrollTop(jQuery('.message-entity').height() + 10000)
		}, 400)
	}

	//-----------------岳振华添加--------------------
	$scope.checkLatest();
	setTimeout(function() {
		jQuery('#IMChat_msg_cont').val('').trigger('click').focus();
		jQuery('.IMChat-entity-display.message').addClass('fadeIn')
	}, 160);

	var author = $stateParams.author;
	if (!!author) {
		setTimeout(function() {
			window.location.hash = author;
			jQuery('body').scrollTop(0);
		}, 1500)
	}
}])
})
