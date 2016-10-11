var guiHandler = (function(jQuery,arg) {
	/**
	 * 阻止文件拖拽进窗口
	 */
	// jQuery(window).on('dragover', function(e) {
	// 	e.preventDefault();
	// 	e.originalEvent.dataTransfer.dropEffect = 'none';
	// });

	// jQuery(window).on('drop', function(e) {
	// 	e.preventDefault();
	// });

	// jQuery(document).on('dragstart', 'a', function (e) {
	//     e.preventDefault();
	// });

	var useragent = window.navigator.userAgent;
	var ismac = window.navigator.userAgent.indexOf('Mac') > -1 ? true : false;
	var iswin = window.navigator.userAgent.indexOf('Windows') > -1 ? true : false;
	var islinux = window.navigator.userAgent.toLowerCase().indexOf('linux') > -1 ? true : false;

	var isNWModle = false;
	try {
		if (require('nw.gui')) {
			var gui = require('nw.gui');
			gui.App.clearCache();
			var win = gui.Window.get();
			var isShowWindow = true;
			isNWModle = true;

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
					title: arg.macTrayTitle//,
					//icon: arg.macTrayIcon
				});
			}
			if (iswin) {
				var tray = new gui.Tray({
					title: arg.winTrayTitle,
					//icon: arg.winTrayIcon
				});
			}
			tray.tooltip = '点此打开';

			/* 系统托盘图标 */
			var menu = new gui.Menu();
			var openmenu = new gui.MenuItem({
				label: arg.openmenu
			});
			var closemenu = new gui.MenuItem({
				label: arg.closemenu
			});
			menu.append(openmenu);
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
			};
			tray.menu = menu;

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

			function closeWin() {
				if (ismac) {
					win.minimize();
					win.setShowInTaskbar(true);
				}

				if (iswin) {
					var notification = new window.Notification("应用提示", {
						body: "应用已经最小化，点击此处打开",
						icon: "login_logo.png"
					});
					win.minimize();
					isShowWindow = false;
					win.setShowInTaskbar(false);
				}
			}

			function minWin() {
				win.setShowInTaskbar(true);
				win.minimize();
				isShowWindow = false;
			}

			var ismaxmac, ismax;
			function maxWin() {
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

		}
	} catch (e) {
		isNWModle = false;
	}

	if(isNWModle){
		return {
	 		isNWModle:isNWModle,
	 		closeWin:closeWin,
	 		minWin:minWin,
	 		maxWin:maxWin
	 	};
	}else{
	 	return {
	 		isNWModle:isNWModle
	 	};
	}
})(jQuery,{
	macTrayTitle:'企业空间',
	macTrayIcon:'esn.ico',
	winTrayTitle:'企业空间',
	winTrayIcon:'esn.ico',
	openmenu:'打开桌面端',
	closemenu:'关闭桌面端'
});
