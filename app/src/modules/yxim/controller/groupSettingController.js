define(['../module','jquery',"Underscore"], function(module,$,_) {
		module.controller('groupSettingController', ['$rootScope', '$scope', 'urlParseService', '_', '$stateParams', '$state', 'ngDialog', "toaster", function($rootScope, $scope, urlParseService, _, $stateParams, $state, ngDialog, toaster) {
			var data = $scope.ngDialogData;
			var ngDialogId = $scope.ngDialogId;
			var param = $.extend(true, {}, data);
			var isOwner = false;
			$scope.param = param;
			var grpset = {
				showloading:false,
				showMask:false,
				showremoveGrpMemberLogo:false,
				troggleLoad:function(){
					this.showloading = !this.showloading;
					this.showMask = !this.showMask;
				}
			}

			$scope.grpset = grpset;

			var initGroupInfo = function(){
					$scope.group = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().get($stateParams.personId);
					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().getGroupMembers({
				   	  to: $stateParams.personId
				   });

			}
			var initRecentInfo = function(){
					//当前聊天窗口
					$scope.recent = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().get($scope.group.id);

			}
			var initMyselfInfo = function(){
				//当前群组聊天窗口
				$scope.myself = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRosterManager().getRostersList("myself")[0];
			}
			var initOwner = function(){
				if($scope.group.owner && $scope.group.owner.id == $scope.myself.id){
					 isOwner = true;
				}else{
					isOwner = false;
				}
				$scope.isOwner = isOwner;
			}
			initMyselfInfo();
			initGroupInfo();
			initOwner();
			initRecentInfo();


			//撤销所有操作
			$scope.revoke = function(e){
				//撤销编辑群组名称界面
				e.stopPropagation();
				e.preventDefault();
				var edit = $(e.currentTarget).find('.esn-grpset-sign');
				$scope.param.name = data.name;
				edit.html('编辑');
				edit.siblings('input').removeClass('esn-grpset-name-on').addClass('esn-grpset-name').attr('readonly',true);
				edit.removeClass('esn-grpset-edit-on').addClass('esn-grpset-edit')

				if(grpset.showremoveGrpMemberLogo && !$(e.target).hasClass('esn-grpset-remove-logo')){
						grpset.showremoveGrpMemberLogo= !grpset.showremoveGrpMemberLogo;
				}
			}

			$scope.stopPop = function(e){
				e.stopPropagation();
				e.preventDefault();
			}

			// 编辑群组名称
			$scope.editGroupName = function(e){
					var _this = $(e.currentTarget);
					e.stopPropagation();
					e.preventDefault();
					if(_this.hasClass('esn-grpset-edit')){
							_this.siblings('input').removeClass('esn-grpset-name').addClass('esn-grpset-name-on').attr('readonly',false);
							_this.siblings('input').select();
							_this.removeClass('esn-grpset-edit').addClass('esn-grpset-edit-on');
							_this.html("完成")
					}else if(_this.hasClass('esn-grpset-edit-on')){
							if(!$scope.param.name){//验证
									_this.siblings('input').addClass('esn-grpset-name-error');
									return;
							}else{
								_this.siblings('input').removeClass('esn-grpset-name-error');
							}
							grpset.troggleLoad();
							YYIMChat.modifyChatGroupInfo({
									to:param.id,
									name:$scope.param.name,
									success:function(result){
											$scope.group.name = $scope.param.name;
											$scope.recent.name = $scope.param.name;
									},
									error:function(result){},
									complete:function(){
										 grpset.troggleLoad();
										_this.html("编辑")
										_this.siblings('input').removeClass('esn-grpset-name-on').addClass('esn-grpset-name').attr('readonly',true);
										_this.removeClass('esn-grpset-edit-on').addClass('esn-grpset-edit')
									}
							});

					}
			}

			/*
			 * 消息置顶
			 */
			$scope.goStick = function(e){
					if(!$scope.param.stick){
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().stick({
								to:$scope.param.id,
								type:'groupchat',
								success:function(data){
									// console.log(data);
									$rootScope.$broadcast("chatlistmessage");
								}
							});
					}else{
							YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().cancelStick({
								to:$scope.param.id,
								type:'groupchat',
								success:function(data){
										$rootScope.$broadcast("chatlistmessage");
								}

							});
					}
			}

			/*
			 * 消息免打扰
			 */
			$scope.goRing = function(e){
					// YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
					// 	id:$scope.group.id,
					// 	mute: !$scope.recent.mute
					// });
					if(!$scope.param.mute){
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().mute({to:$scope.param.id,type:'groupchat'});
					}else{
						YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getProfileManager().cancelMute({to:$scope.param.id,type:'groupchat'});
					}
					$rootScope.$broadcast("chatlistmessage");
				// console.log($scope.recent);
			}

			//关闭右侧弹框
			$scope.closeDiag = function() {
				$(".esn-right-dialog").addClass("esn-right-dialog-out");
				setTimeout(function() {
						ngDialog.close(ngDialogId);
					}, 420)
			}

			/*
			 * 退出当前群聊
			 */
			$scope.exitChatGroup = function(e){
				// e.stopPropagation();
				// e.preventDefault();
				singleConfirm.getInstance({
						msg:"退出后，将不在接收此群的消息",
						confirm:function () {
							 YYIMChat.exitChatGroup({
									 to:param.id,
									 success:function(){
											$scope.closeDiag();
											$rootScope.$broadcast("removeGrp",param.id);
											if($scope.isOwner){
													// 更换群主
													var members = param.members;
													if(members && members.length > 0){
															for(var i=0;i<member.length;i++){
																if(member[i].id != myself.id){
																		YYIMChat.transferChatGroup({
																				to:param.id,
																				newOwner:member[i].id,
																				success:function(result){},
																				error:function(result){},
																				complete:function(result){}
																		})
																		return;
																}
															}
													}

											}
									 },
									 error:function(){},
									 complete: function(){

									 }
							 });

						}
				});
			}
			/***解散群组**/
			$scope.dismissChatGroup = function(e){
				// e.stopPropagation();
				// e.preventDefault();
				singleConfirm.getInstance({
						msg:"解散后，其他成员自动退群",
						confirm:function () {
							 YYIMChat.dismissChatGroup({
									 to:param.id,
									 success:function(){
											$scope.closeDiag();
											$rootScope.$broadcast("removeGrp",param.id);
									 },
									 error:function(){},
									 complete: function(){

									 }
							 });

						}
				});
			}
			/***转让群主**/
			$scope.changeOnwer = function(e){
					ngDialog.open({
							template: 'src/modules/yxim/template/groupChangeOnwer.html',
							showClose:false,
							overlay:true,
							disableAnimation:false,
							closeByDocument:true,
							scope: $scope,
							controller:'groupSettingChangeOnwerController',
							data:$scope.group
					});
			}

			$scope.$on('changeOnwer', function(event,obj,ngDialogId) {
				// console.info(obj);
				// console.info(ngDialogId);
		    	grpset.troggleLoad();
					YYIMChat.transferChatGroup({
							to:param.id,
							newOwner:obj.id,
							success:function(result){
								// console.log(result);
								$scope.$apply(function(){
									$scope.group.owner = obj;
									initOwner();
								});
							},
							error:function(result){
								// console.log(result);
							},
							complete:function(result){
								grpset.troggleLoad();
								ngDialog.close(ngDialogId);
							}
					})
		  });

			function resetHeaderPhotoWhenDelete(members){
				var imgs = [];
				for(var i=0,j=members.length;i<j;i++){
					imgs.push(members[i].avatar);
				}
				setHeaderPhoto(imgs);
			}
			/**踢人***/
			$scope.removeGrpMember = function(e,item){
				e.stopPropagation();
				singleConfirm.getInstance({
						msg:"是否确认把 "+item.name+" 移出群组？",
						confirm:function () {
								grpset.troggleLoad();
								YYIMChat.kickGroupMember({
										to:param.id,
										member:item.id,
										success: function(result){
												var mid = item.id;
												for(var i=0;i<$scope.group.members.length;i++){
														if(mid == $scope.group.members[i].id){
																$scope.group.members.splice(i, 1);
																resetHeaderPhotoWhenDelete($scope.group.members);
																delete $scope.group.list.mid;
																break;
														}
												}
												$scope.group.numberOfMembers = $scope.param.members.length;
												grpset.showremoveGrpMemberLogo= !grpset.showremoveGrpMemberLogo;
												$rootScope.$broadcast("chatlistmessage");
										},
										complete:function(){
												grpset.troggleLoad();
										}
								});

						}
				});
			}
			$scope.showremoveGrpMemberLogo = function(e){
					e.stopPropagation();
					e.preventDefault();
					grpset.showremoveGrpMemberLogo= !grpset.showremoveGrpMemberLogo;
			}

			var membersIdArray = _.map($scope.group.members,function(m){
					return m.id;
			});
			/**添加群聊人员**/
			$scope.addMember = function(e){
					//打开选择联系人dialog

          window.needHideAllDialog = true;
					ngDialog.open({
						template: 'src/modules/common/contacts.html',
						controller: 'contactsController',
						className: 'dudu-right-dialog-w',
						closeByDocument:true,
						showClose: false,
						overlay: false,
						data: {
							getSelectedListModule: 'addMember',
							groupInfo:$scope.group,
							groupSetCheckedMembers:membersIdArray
						}
					});
			}
			function getAvatar(item){
				if(!item){
					return null;
				}
				if(item.from){
					return item.from.avatar;
				}
				return item.avatar;
			}
			function resetHeaderPhoto(data){
				var imgs = [];
				if($scope.group.members.length>=4){
					return;
				}
				for(var i=0,j=$scope.group.members.length;i<j;i++){
					imgs.push(getAvatar($scope.group.members[i]));
				}
				var len = 4-$scope.group.members.length;
				len = data.length>len?len:data.length;
				for(var i=0;i<len;i++){
					var p = getAvatar(data[i]);
					if(imgs.indexOf(p)<0){
						imgs.push(p);
					}
				}
				setHeaderPhoto(imgs);
			}
			function setHeaderPhoto(imgs){
				var size = {
					"size1":{width:38,height:38},
					"size2":{width:29,height:29},
					"size3":{width:24,height:24},
					"size4":{width:22,height:22}
				};
				var pos ={
							"pos1":[{left:"0px",top:"0px"}],
							"pos2":[{left:"14px",top:"0px"},{left:"0px",top:"14px"}],
							"pos3":[{left:"0px",top:"18px"},{left:"9px",top:"0px"},{left:"18px",top:"18px"}],
							"pos4":[
								{left:"2px",top:"20px"},
								{left:"2px",top:"0px"},
								{left:"20px",top:"0px"},
								{left:"20px",top:"20px"}
							]
						};

					var pw = $($rootScope.curRecentItemEvent.currentTarget).find(".avt-s-l");
					pw.empty();
					var pcount = imgs.length;
					for(var i=0,j=imgs.length;i<j;i++){
						var src = imgs[i];
						var img =  new Image();
						img.onerror = function() {
							img.src ="./src/style/images/avt_default.png";
						};
						src = (src =="")?"./src/style/css/images/default_photo.jpg":src;
						img.src = src;
						img.width = size["size"+pcount].width;
						img.height = size["size"+pcount].height;
						img.style.position = "absolute";
						img.style.borderRadius = "100%";
						if(pcount>1){
							img.style.border = "2px solid #fff";
						}
						img.style.top = pos["pos"+pcount][i].top;
						img.style.left = pos["pos"+pcount][i].left;
						pw.append(img);
					}
			}
			/***监听添加人员事件**/
			$scope.$on("getSelectedList.addMember", function (e,data,ngDialogId) {

					var member_id_array = [];

					resetHeaderPhoto(data);
					var useForCach = [];//由于返回回来的数据没有统一格式，所以要自己构造
					if(data){
						for(var i in data){
							 if(!!data[i].id){
									member_id_array.push(data[i].id);
									useForCach.push({
										id:data[i].id,
										name:data[i].name,
										vcard:{
											avatar:data[i].from ? data[i].from.vcard.avatar : data[i].avatar
										}
									});
							 }else if(!!data[i].member_id){
									member_id_array.push(data[i].member_id);
									useForCach.push({
										id:data[i].member_id,
										name:data[i].name,
										vcard:{
											avatar:data[i].avatar
										}
									});
							 }
						}
						$rootScope.$broadcast("chatlistmessage");
					}

				//TODO	$rootScope.$broadcast("groupAddMemberRemind");

					YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().inviteGroupMember({
						to: $scope.group.id,
						members:member_id_array,
						success:function(result){
								$scope.param.members.concat(useForCach);
								$scope.param.numberOfMembers = result.numberOfMembers;

								$scope.param.members.concat(useForCach);
								$scope.group.numberOfMembers = result.numberOfMembers;
								ngDialog.close(ngDialogId);
								//发送消息提醒

						}
					});
			});

		}])
		module.controller('groupSettingChangeOnwerController', ['$rootScope','$scope','ngDialog', function($rootScope,$scope,ngDialog) {
			var ngDialogId = $scope.ngDialogId;
			var data = $scope.ngDialogData;

			var param = $.extend(true, {}, data);//深度拷贝
			var owner = param.owner;
			var member = [];
			for(var i=0;i<param.members.length;i++ ){
				if(param.members[i].id != owner.id){
					param.members[i].checked = false;
					member.push(param.members[i]);
				}
			}

			$scope.member = member;

			$scope.member_checkedId = '';

			$scope.search_keyword_g = "";

			$scope.checkMember = function(id){
				for(var i in member){
					member[i].checked = false;
					if(member[i].id==id){
							member[i].checked = true;
					}
				}
			}
			$scope.inputfocus = function(event){
				jQuery(event.currentTarget.parentNode).addClass("esn-focus");
			}
			$scope.confirmChecked = function(){
				for(var i in member){
					if(member[i].checked){
							$scope.$emit("changeOnwer",member[i],ngDialogId);
							return;
					}
				}
			}

			$scope.closeDialog = function() {
				ngDialog.close(ngDialogId);
			}


      //本地搜索
      $scope.$watch("search_keyword_g",function(keyword,oldValue){
        if (!keyword) {
					$scope.member = member;
          return;
        }

        // console.log(keyword);
        window.clearTimeout($scope.serachT);

        $scope.serachT = setTimeout(function () {
          $scope.member =  _.filter($scope.member, function (each) {
              return each.name.match(keyword);
           });
        }, 300)



      })

		}]);
})
