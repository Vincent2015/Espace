window.ctrlpress = false;
window.shiftpress = false;
window.newversion = "0.0.2";

var useragent = window.navigator.userAgent;
var ismac = window.navigator.userAgent.indexOf('Mac') > -1 ? true : false;
var iswin = window.navigator.userAgent.indexOf('Windows') > -1 ? true : false;
var islinux = window.navigator.userAgent.toLowerCase().indexOf('linux') > -1 ? true : false;

window.NWModule = false;
window.isShowWindow = true;
window.currMsg = null;
try {
	if (require('nw.gui')) {
		var gui = require('nw.gui');

		gui.App.clearCache();
		window.NWModule = true;

		var win = gui.Window.get();

		win.on("minimize", function() {
			isShowWindow = false;
		});

		win.on("maximize", function() {
			isShowWindow = true;
		});

		win.on("focus", function() {
			isShowWindow = true;
		});

		win.on("restore", function() {
			isShowWindow = true;
		});

		win.on("show", function() {
			isShowWindow = true;
		});

		win.on("hide", function() {
			isShowWindow = false;
		});

		win.on('unmaximize', function() {
			isShowWindow = false;
		});

		win.setShowInTaskbar(true);

		/* 系统托盘  */
		var tray = null;
		if (ismac) {
			var tray = new gui.Tray({
				// title: '企业空间',
				icon: "esn_favicon.png"
			});
		}

		if (iswin) {
			var tray = new gui.Tray({
				// title: '企业空间',
				icon: "esn_favicon.png"
			});
		}

		tray.tooltip = '点此打开';

		/* 系统托盘图标 */
		var menu = new gui.Menu();

		var openmenu = new gui.MenuItem({
			label: '打开桌面端'
		});

		menu.append(openmenu);
		var closemenu = new gui.MenuItem({
			label: '关闭桌面端'
		});

		menu.append(closemenu);

		openmenu.click = function() {
			win.show();
			isShowWindow = true;
			win.setShowInTaskbar(true);
		};

		closemenu.click = function() {
			if (YYIMChat) {
				YYIMChat.logout();
			}
			tray.remove();
			tray = null;
			gui.App.closeAllWindows();
			//gui.App.quit();
		};
		if (!tray.menu) {
			tray.menu = menu;
		}


		//click事件
		tray.on('click', function() {
			if (isShowWindow) {
				win.hide();
				win.setShowInTaskbar(true);
				isShowWindow = false;
			} else {
				win.show();
				win.setShowInTaskbar(true);
				isShowWindow = true;
			}
		});

		closewin = function() {
			singleConfirm.getInstance({
					msg:"您确定要退出企业空间吗？",
					confirm:function(){
						if (YYIMChat) {
							YYIMChat.logout();
						}
						tray.remove();
						tray = null;
						gui.App.closeAllWindows();
					}
			});
			// if (ismac) {
			// 	win.minimize();
			// 	win.setShowInTaskbar(true);
			// }
			// if (iswin) {
			// 	var notification = new window.Notification("应用提示", {
			// 		body: "应用已经最小化，点击此处打开",
			// 		icon: "logo.png"
			// 	});
			// 	win.minimize();
			// 	isShowWindow = false;
			// 	win.setShowInTaskbar(false);
			// }
		}

		min = function() {
			win.setShowInTaskbar(true);
			win.minimize();
			isShowWindow = false;
		}

		var ismaxmac, ismax;

		max = function() {
			if (ismac) {
				if (ismaxmac) {
					//	win.setShowInTaskbar(true);
					win.restore();
					ismaxmac = !ismaxmac;
				} else {
					// win.setShowInTaskbar(true);
					win.maximize();
					ismaxmac = !ismaxmac;
				}
			}

			if (iswin) {
				if (ismax) {
					win.restore();
					win.setShowInTaskbar(true);
					ismax = !ismax;
				} else {
					win.maximize();
					win.setShowInTaskbar(true);
					ismax = !ismax;
				}
			}
		}

		var gui = require('nw.gui');


		function ClibMenu() {
			this.menu = new gui.Menu();
			this.cut = new gui.MenuItem({
				label: '剪切',
				click: function() {
					document.execCommand('cut');
				}
			});
			this.copy = new gui.MenuItem({
				label: '复制',
				click: function() {
					document.execCommand('copy');
				}
			});
			this.paste = new gui.MenuItem({
				label: '粘贴',
				click: function() {
					document.execCommand('paste');
				}
			});

			this.cancel = new gui.MenuItem({
				label: '撤回',
				click: function() {
				     if (!window.currMsg){
				     	return;
				     }
					 var mid = window.currMsg.target.parentElement.getAttribute('bo-attr-mid');
					 var type = window.currMsg.target.parentElement.getAttribute('bo-attr-type');
					 var to = window.currMsg.target.parentElement.getAttribute('bo-attr-tid');
					 var tm = window.currMsg.target.parentElement.getAttribute('bo-attr-tm');
					 // var tmp = Date.parse(new Date())/1000;
					 // if ((tmp - tm) > (2*60*1000)){
					 // 	toast('发送时间超过2分钟的消息，不能撤回');
					 // 	return;
					 // }
					// console.log('000000000000000');
					//return;
					YYIMChat.revocationMessage({
						id:mid,
						to:to,
						type:type,
						success:function(data) {
							// body...
							toast('消息撤回成功');
							window.currMsg.target.parentElement.parentElement.parentElement.remove();
							var list = YYIMCacheSpaceManager.get(currentSpaceId).getMessageManager().getMessageList({id:to});
							if(list.length>=0){
							 var temp = list[list.length-2];
							 YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
									id: temp.opposite,
									dateline: temp.dateline,
									latestState: temp.data,
									type: temp.type,
									contentType: temp.data.contentType,
									sort: true,
									isHaveAt: temp.data.isHaveAt
								});

							}

						},
						error:function(error) {
							// body...
							if(error.detailCode == 40335){
							  toast('发送时间超过2分钟的消息，不能撤回');
							}
							else{
							  toast('消息撤回失败');
							}

						},
						complete:function() {
							// body...
						}
					});
				}
			});
			this.forward = new gui.MenuItem({
				label: '转发',
				click: function() {
					// console.log('转发消息')
					 if (!window.currMsg){
				     	return;
				     }
					var mid = window.currMsg.target.parentElement.getAttribute('mid');
					window.selectMember({'mid':mid});
					//YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().forwardMessage({'mid':mid,'to':''});

				}
			});

		}
		ClibMenu.prototype.init = function(){
			this.menu.append(this.cut);
			this.menu.append(this.copy);
			this.menu.append(this.paste);
			this.menu.append(this.cancel);
			this.menu.append(this.forward);
		};
		ClibMenu.prototype.removeCut = function(){
			this.menu.remove(this.cut);
		};
		ClibMenu.prototype.removeCopy = function(){
			this.menu.remove(this.copy);
		};
		ClibMenu.prototype.removePaste = function(){
			this.menu.remove(this.paste);
		};
		ClibMenu.prototype.removeCancel = function(){
			this.menu.remove(this.cancel);
		};
		ClibMenu.prototype.canCopy = function(bool) {
			this.cut.enabled = bool;
			this.copy.enabled = bool;
		};

		ClibMenu.prototype.canPaste = function(bool) {
			this.paste.enabled = bool;
		};

		ClibMenu.prototype.canCut = function(bool) {
			this.cut.enabled = bool;
		};

		ClibMenu.prototype.canCancel = function(bool) {
			this.cancel.enabled = bool;
		};

		ClibMenu.prototype.popup = function(x, y) {
			this.menu.popup(x, y);
		};

		jQuery(document).on('contextmenu', function(e) {
			e.preventDefault();
			window.currMsg = e;
			if (!jQuery(window.currMsg.target.parentElement).hasClass('dialog-content')){
				return;
			}
			// console.log('=');
			var clibmenu = new ClibMenu();
			var $target = jQuery(e.target);
			clibmenu.init();
			var selectionType = window.getSelection().type.toUpperCase();
			if ($target.is(':text')) { // TODO url/email/... 未加入判断哦
				var clipData = gui.Clipboard.get().get();
				clibmenu.canPaste(clipData.length > 0);
				clibmenu.canCopy(selectionType === 'RANGE');
				clibmenu.popup(e.originalEvent.x, e.originalEvent.y);
			}else{
				if ((jQuery($target)[0].tagName =='TEXTAREA')||(jQuery($target)[0].tagName =='INPUT')){
				clibmenu.removeCancel();
				   clibmenu.popup(e.originalEvent.x, e.originalEvent.y);
				}else{
					// clibmenu.canCut(false);
					clibmenu.removeCut();
					clibmenu.popup(e.originalEvent.x, e.originalEvent.y);
				}

			}
		});
	}
} catch (e) {}

function getSNSBasePath() {
	return location.href.replace('index.html', '');
};

function imgErr(target) {
	target.attr('src', 'src/style/images/filetype/file_default.jpg');
}

$(document).on('click', function(e) {
	var _target = jQuery(e.target);

	if (!_target.closest('.trigger').length) {
		jQuery('.fold-menu').addClass('hidden');
		if (_target.closest('.setting-item').length) {
			_target.closest('.setting-item').find('.fold-menu').removeClass('hidden');
		}
		if (!_target.closest('.IMChat-model-bd,input.ui-select-search,.ui-select-choices-group,.ui-select-match,.ui-select-match-close').length) {
			jQuery('.IMChat-model-cover,.IMChat-model-bd').addClass('hidden');
		}
	}
	if (_target.parent().hasClass('IMChat-menu-items')) {
		jQuery('.IMChat-menu-items>li').removeClass('cur');
		_target.addClass('cur');
	}
	if (_target.closest('.list-item').length) {
		jQuery('.list-item').removeClass('cur');
		_target.closest('.list-item').addClass('cur');
	}

	if (_target.is('.IMChat-create')) {
		jQuery('#create-dialog').css({
			left: (_target.width() - jQuery('#create-dialog').width()) / 2 + e.clientX,
			top: e.clientY + 15
		}).show();
	} else {
		jQuery('#create-dialog').hide();
	}

	if (!_target.is('.IMChat-group-slide *') && !_target.is('.operate-item li:nth-child(3)') && !_target.is('#prodetail')) {
		jQuery('.IMChat-group-slide').addClass('beforeHide');
		setTimeout(function() {
			jQuery('.IMChat-group-slide').removeClass('beforeHide').addClass('hidden')
		}, 500);
	}

	if (!_target.is('.IMChat-entity-list')) {
		jQuery('.IMChat-entity-list').addClass('hidden');
	}
});

$(window).on('dragover', function(e) {
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = 'none';
});

$(window).on('drop', function(e) {
	e.preventDefault();
});

$(window).on("keydown", function(e) {
	var list = ["input", "textarea"];
	var key = e.which; //e.which是按键的值
	var ctrl = e.ctrlKey;
	var cli = null ;
	if(gui && gui.Clipboard){
		cli = gui.Clipboard.get();
	}
	var shift = e.shiftKey;

	//console.log(e);
	if (ctrl) {
		window.ctrlpress = true;
	}

	if (key == 8) {
		var tag = e.target.tagName.toLowerCase();
		if (tag) {
			if (jQuery.inArray(tag, list) < 0) {
				e.preventDefault();
				e.stopPropagation();
			}
		}
	}
	if (iswin) {
		if (e.ctrlKey && key == 86) {
			var copyinfo = "";
			var text = '';
			if(cli){
				text = cli.get("text");
			}
			if (text) {
				copyinfo = text;

			} else {
				copyinfo = cli.get();

			}

			if($(e.target).is('input[type="text"]') || $(e.target).is('textarea') || $(e.target).is('input[type="password"]')){
				$(e.target).val($(e.target).val().trim() + copyinfo);
			}
			if (e.target.id == "IMChat_msg_cont") {
				// jQuery('#IMChat_msg_cont').val(jQuery('#IMChat_msg_cont').val().trim() + copyinfo);
				e.preventDefault();
				e.stopPropagation();
			}
		}
		if (e.ctrlKey && key == 67) {
			var selecttext = document.getSelection().toString();
			cli.set(selecttext, "text");
		}
		if (e.ctrlKey && key == 65) {
			document.execCommand("SelectAll",null,null);
		}
	} else if (ismac) {
		if (e.metaKey && key == 86) {
			var copyinfo = "";
			var text = '';
			if(cli){
				text = cli.get("text");
			}
			if (text) {
				copyinfo = text;

			} else {
				copyinfo = cli.get();

			}
			//add by liucyu 解决不能粘贴bug
			if($(e.target).is('input[type="text"]') || $(e.target).is('textarea') || $(e.target).is('input[type="password"]')){
					$(e.target).val($(e.target).val().trim() + copyinfo);
			}
			if (e.target.id == "IMChat_msg_cont") {
				// jQuery('#IMChat_msg_cont').val(jQuery('#IMChat_msg_cont').val().trim() + copyinfo);
				e.preventDefault();
				e.stopPropagation();
			}
		}
		if (e.metaKey && key == 67) {
			var selecttext = document.getSelection().toString();
			cli.set(selecttext, "text");
		}
		if (e.metaKey && key == 65) {
			document.execCommand("SelectAll",null,null);
		}
	}

});

$(document).on('click', '.screenshot-tool span', function(e) {
	e.preventDefault();
	e.stopPropagation();
	jQuery(e.target).siblings('ul').toggleClass('hidden');
});
