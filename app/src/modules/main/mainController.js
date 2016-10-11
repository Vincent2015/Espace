define(['./module','jquery'], function(module,$) {
  module.controller("mainController", ["$scope", "jsonService", "httpService", "mainService", "$state", "ngDialog","$rootScope",'frendListService','teamListService','teamService','organizationService','FollowerListService','OrgListService','PersonListService','TeamListService',function($scope, jsonService, httpService, mainService, $state,ngDialog,$rootScope,frendListService, teamListService, teamService, organizationService, FollowerListService, OrgListService, PersonListService, TeamListService) {



    var storage = window.localStorage;
    //检测版本更新 如果已经自动登录 则在里面进行检查版本更新
    // if (!NWModule && storage.getItem("esn_login") == "true") {
    //  versionManager.checkedUpdate(function (data) {
    //    ngDialog.open({
    //      template: 'src/modules/main/sysUpdate.html',
    //      showClose:false,
    //      overlay:true,
    //      disableAnimation:true,
    //      scope:$scope,
    //      data:data,
    //      controller: ['$scope',  function($scope) {
    //        $scope.update_text = "下载";
    //        $scope.update = function () {

    //          $scope.update_text = "下载中...";
    //          $scope.isLoding = true;

    //          $scope.update_style = "background: #7fc9ff;width:160px;";
    //          $scope.update_text = "下载中...";
    //          versionManager.update(function (data) {
    //          }, function (error) {
    //          });
    //        }
    //      }]

    //    });

    //  }, function (error) {
    //   //  console.log(error);
    //  });
    // }
    $scope.init = function() {
      $scope.isShow = false;
      $scope.q_name = jsonService.getJson("esn_user").qzname;
      $scope.qz_user_type = jsonService.getJson("esn_user").qz_user_type;
      $scope.c_qz_id = jsonService.getJson("esn_user").qz_id;//当前用户空间
      $rootScope.deptArray = [{deptId:0, name:$scope.q_name}];//add by liucyu 组织架构
      $rootScope.qz_user_type = jsonService.getJson("esn_user").qz_user_type;
      //获取空间列表
      $scope.get_q_list();
    }



    $scope.icon = {};
    $scope.esnUser = jsonService.getJson("esn_user");

    $scope.uncultivated = function() {
      toast('功能未上线，敬请期待',1000);
    }


    $scope.promotion = false;
    $scope.promotionitem = (function(){
      var promItem = function(){
        this.init();
        this.style = {};
      };
      promItem.prototype = {
        init:function(){
          this.setting = false;
          this.add = false;
        },
        getMod:function(mod){
          this.init();
          this[mod] = true;
          this.position(mod);
          return this;
        },
        position:function(mod){
          var bottom = '70px';
          var width = '65px'
          if(mod === 'add'){
            bottom = '146px';
            if($scope.qz_user_type != 0){
              width = '92px'
            }
          }else if(mod === 'setting'){
            bottom = '70px';
          }
          this.style ={
            bottom:bottom,
            width:width
          }
        }
      }
      var item = new promItem();
      return item;
    })()

    $scope.trogglePromotion = function(mod){
      $scope.promotion = !$scope.promotion;
      if(mod){
        $scope.promotionitem.getMod(mod);
      }
      //FIXME 此处待优化
      if(!$scope.promotion){
        $('.esn-setting-icon').removeClass('active');
      }
    }


    $scope.createDealerChatGroup = function(event) {
       $scope.trogglePromotion();
       ngDialog.open({
         template: 'src/modules/common/contacts.html',
         controller: 'contactsController',
         className: 'dudu-right-dialog-w',
         closeByDocument:true,
         showClose: false,
         overlay: false,
         data: {
           getSelectedListModule: 'createDealerChatGroup'
         }
       });
   }


     $scope.$on("getSelectedList.createDealerChatGroup", function (e,data,ngDialogId) {
         var member_id_array = [];
         var useForCach = [];
         if(data){
             for(var i in data){
                 useForCach.push(data[i].name);
                if(!!data[i].id){
                   member_id_array.push(data[i].id);
                }else if(!!data[i].member_id){
                   member_id_array.push(data[i].member_id);
                }
             }
             YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().createDealerChatGroup({
               name:useForCach.toString(),
               members:member_id_array,
               success:function(group){
                 if(!!group){
                   ngDialog.close();
                   toast('群组创建成功！');
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

         }

     });

    $scope.createNomalGroup = function(event) {
       $scope.trogglePromotion();
       ngDialog.open({
         template: 'src/modules/common/contacts.html',
         controller: 'contactsController',
         className: 'dudu-right-dialog-w',
         closeByDocument:true,
         showClose: false,
         overlay: false,
         data: {
           getSelectedListModule: 'createNomalGroup'
         }
       });
   }


   $rootScope.userCard = function(member,useritem){
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
            controller:'userCardController',
            data: {
     					id: id,
              useritem:useritem
     			  }
       });
   }
  $scope.$on("getSelectedList.createNomalGroup", function (e,data,ngDialogId) {
      var member_id_array = [];
      var useForCach = [];
      if(data){
          for(var i in data){
              useForCach.push(data[i].name);
             if(!!data[i].id){
                member_id_array.push(data[i].id);
             }else if(!!data[i].member_id){
                member_id_array.push(data[i].member_id);
             }
          }
          YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getGroupManager().createChatGroup({
            name:useForCach.toString(),
            members:member_id_array,
            success:function(group){
              if(!!group){
                ngDialog.close();
                toast('群组创建成功！');
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

      }

  });


    $scope.aboutUs = function(){
        $scope.trogglePromotion();
        ngDialog.open({
          template: 'src/modules/main/aboutUs.html',
          showClose:false,
          overlay:true,
          scope:$scope,
          disableAnimation:true
        });
    };
    $scope.logout = function(e) {
      showloading(10000, false);
      $scope.trogglePromotion();
      /*记住当前空间*/
      storage.removeItem("esn_user");
      storage.setItem("esn_login", false);
      stoploading();
      if (YYIMChat) {
        YYIMChat.logout();
        YYIMCacheSpaceManager.destory();
      }
      $state.go("login");
    };

    //切换空间 click
    $scope.q_click_action = function(event) {
        $scope.isShow = !$scope.isShow;
        $scope.get_q_list();
        event.stopPropagation();
      }
      //获取空间列表
    $scope.get_q_list = function() {
      httpService.dataServiceQ("get", "/qz")
        .then(function(result) {
          // console.log(result.data);
          if (result.code == 0) {
            // $scope.q_list_inner = _.filter(result.data, function(each) {
            //   return each.qz_type == 0;
            // });
            // $scope.q_list_outer = _.filter(result.data, function(each) {
            //   return each.qz_type == 1;
            // });
            $scope.q_list = result.data;
          }
        })
        .catch(function(error) {
          // console.log(error);
        })
    }

    //切换空间 by id
    $scope.switch_q = function(id) {
      $scope.isShow = false;
      // toast("正在切换空间...", 35000);
      showloading();
      // console.log(id);
      httpService.dataServiceQ("get", "/user/switchSpace/"+id)
        .then(function(result) {
          if (result.code == 0) {
            // quitTost();
            stoploading();
            // toast("切换成功");
            $scope.q_name = result.data.qzname;
            $scope.c_qz_id = result.data.qz_id;

            var esn_user_new = jsonService.getJson("esn_user");
            esn_user_new["dept_id"] = result.data.dept_id;
            esn_user_new["qz_id"] = result.data.qz_id;
            esn_user_new["qzname"] = result.data.qzname;
            esn_user_new["qz_user_type"] = result.data.qz_user_type;//qz_user_type  = 0 不是经销商空间  ；qz_user_type = 2  非管理员   ；qz_user_type = 1 管理员
            jsonService.setJson("esn_user", JSON.stringify(esn_user_new));
            $scope.qz_user_type = result.data.qz_user_type;
            window.currentSpaceId = result.data.qz_id;
            $rootScope.deptArray = [{deptId:0,name:result.data.qzname}];//add by liucyu 组织架构
            $rootScope.zoneArray = {deptId:0,name:result.data.qzname};//add by liucyu 组织架构
            // console.log('*********************');
            // console.log(result.data);
            // console.log(jsonService.getJson("esn_user"));
            // console.log('*********************');
            $rootScope.qz_user_type = result.data.qz_user_type;
            //广播切换空间成功事件
            $scope.clearCacheOnSwitch();
            $rootScope.$broadcast("switchSpace");
          }
        })
        .catch(function(error) {
          quitTost();
          toast("切换失败");
          // console.log(error);
        })
    }
    //切换空间 清空各种缓存 －－ ！
    $scope.clearCacheOnSwitch = function () {
      frendListService.set("user_daily", {});
      teamListService.set("page1_data", {});
      teamService.clear();
      organizationService.deptMemberList = null;

      FollowerListService.clear();
      OrgListService.clear();
      PersonListService.clear();
      TeamListService.clear();
    }

    /*****************************************************主界面控制器jquery事件绑定start*******************************************************************************/
    //left 图标样式切换
    $('.esn-im-nav-row').on('click', function() {

      $('.esn-im-nav-row').removeClass('active');
      $('.esn-setting-icon').removeClass('active');

      // $(".esn-im-nav-row").find(".esn-im-icon").each(function() {
      //   var icon_selected = $(this).attr("class");
      //   var icon_normal = icon_selected.replace("selected", "normal");
      //   $(this).attr("class", icon_normal);
      // });


      var icon_normal = $(this).find(".esn-im-icon").attr("class");
      var icon_selected = icon_normal.replace("normal", "selected");
      $(this).find(".esn-im-icon").attr("class", icon_selected);
      $(this).addClass('active');

    })

    $(".esn-setting-icon").click(function() {
      $('.esn-im-nav-row').removeClass('active');
      $('.esn-setting-icon').removeClass('active');
      $(this).addClass('active');

      var icon_normal = $(this).attr("class");
      var icon_selected = icon_normal.replace("normal", "selected");
      $(this).attr("class", icon_selected);

    });


    $("body").bind("click", function(e) {
      $scope.$apply(function() {
        $scope.isShow = false;
      });
      // 给body绑定事件
      var ngdialog = $('.ngdialog').get().reverse();
      if(ngdialog.length <1){
        return;
      }
      if(!$(ngdialog[0]).hasClass('ngdialog-no-overlay')){//如果最上面一层是有遮罩的则有ngdialog自行处理
          return;
      }
      var ngdialogIdArray = ngDialog.getOpenDialogs();
      if(ngdialogIdArray.length > 0){
        if(window.needHideAllDialog){
          window.needHideAllDialog = false;
          for(var i=ngdialogIdArray.length-1;i>=0;i--){
            $scope.closeRightDiag(ngdialogIdArray[i]);
          }
        }else{
          $scope.closeRightDiag(ngdialogIdArray[ngdialogIdArray.length-1]);
        }
      }
    })
    // $scope.$on('ngDialog.closing', function($dialog, value){
    //   if(value.hasClass('dudu-right-dialog-w')){
    //     value.find('.esn-right-dialog').addClass("esn-right-dialog-out");
    //   }
    // });
    //
    $("body,document").on("click", ".dudu-right-dialog-w", function (e) {
      e.stopPropagation();
      // e.preventDefault();
    })

    //.esn-im-c-ul 样式切换
    $("body").on("click", ".esn-im-c-ul li", function (e) {
      $('.esn-im-c-ul li').removeClass('active');
      $(this).addClass('active');
    })





    /*****************************************************主界面控制器jquery事件绑定end*******************************************************************************/


    //关闭closeRightDiag 右侧Diag  修改默认的渐隐
    $scope.closeRightDiag =function (id) {
      if($('#'+id).hasClass('dudu-right-dialog-w')){
          $('#'+id).find('.esn-right-dialog').addClass("esn-right-dialog-out");
          setTimeout(function () {
            ngDialog.close(id);
          },420);
      }else{
          ngDialog.close(id);//ngdialog-no-overlay
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

    $scope.systemSetting = function(){
      $scope.trogglePromotion();
      ngDialog.open({
        template: 'src/modules/main/settings.html',
        showClose:false,
        overlay:true,
        scope:$scope,
        disableAnimation:true,
        controller: ['$scope',"jsonService",  function($scope,jsonService) {

          $scope.isSounds = true;
          $scope.isRemind = true;
          $scope.activation = "";
          $scope.screenshot = "";
          $scope.sendmsg = "";
          $scope.isChoose = true;
          $scope.choose_e = "esn-set-radio on";
          $scope.choose_ce = "esn-set-radio";
          var key = jsonService.getJson("esn_user").user_id;
          var obj = jsonService.getJson(key);

          $scope.setChoose = function(v){
            $scope.isChoose = v;
            if(v){
              $scope.choose_e = "esn-set-radio on";
              $scope.choose_ce = "esn-set-radio";
            } else {
              $scope.choose_e = "esn-set-radio";
              $scope.choose_ce = "esn-set-radio on";
            }
          };
          if (obj){
            $scope.isSounds = obj.isSounds;
            $scope.isRemind = obj.isRemind;
            $scope.activation = obj.activation;
            $scope.screenshot = obj.screenshot;
            $scope.sendmsg = obj.sendmsg;
            $scope.isChoose = obj.isChoose;
            $scope.setChoose(obj.isChoose);
          }
          $scope.activation_keydown = function(e) {
            $scope.activation = keyDown(e);
          };
          $scope.screenshot_keydown = function(e) {
            $scope.screenshot = keyDown(e);
          };
          $scope.sendmsg_keydown = function(e) {
            $scope.sendmsg = keyDown(e);
          };
          var keyDown = function(e){
            var keyCode = e.keyCode || e.which || e.charCode;
            var ctrlKey = e.ctrlKey;
            var metaKey = e.metaKey;
            var altKey = e.altKey;
            var shiftKey = e.shiftKey;
            if ((e.keyCode >= 37 && e.keyCode <=40 ||e.keyCode >= 48 && e.keyCode <=57 || e.keyCode >= 65 && e.keyCode <=90 || e.keyCode == 13)&& (ctrlKey||metaKey||altKey||shiftKey)) {
              return (ctrlKey ? "Control + " : "") + (altKey ? "Alt + " : "")+ (metaKey ? "Command + " : "") + (shiftKey ? "Shift + " : "") + e.originalEvent.code.replace('Key','').replace('Digit','');
            }
            return "";
          }
          $scope.confirm = function(){
            jsonService.setJson(key,'{"isChoose":'+$scope.isChoose+',"isSounds":'+$scope.isSounds+',"isRemind":'+$scope.isRemind
            +',"activation":"'+$scope.activation+'","screenshot":"'+$scope.screenshot+'","sendmsg":"'+$scope.sendmsg+'"}');
            $scope.closeThisDialog();
          }
          if (NWModule) {
            $scope.version = versionManager.getVersion();
          }
          $scope.checkUpdate = function(){
            var storage = window.localStorage;
            //检测版本更新 如果已经自动登录 则在里面进行检查版本更新
            if (NWModule) {
             versionManager.checkedUpdate(function (data) {
               ngDialog.open({
                 template: 'src/modules/main/sysUpdate.html',
                 showClose:false,
                 overlay:true,
                 disableAnimation:true,
                 scope:$scope,
                 data:data,
                 controller: ['$scope',  function($scope) {
                   $scope.update_text = "下载";
                   $scope.update = function () {
                     $scope.update_text = "下载中...";
                     versionManager.update(function (data) {
                     }, function (error) {
                      //  console.log(error);
                     });
                   }
                 }]

               });

             }, function (error) {
              //  console.log(error);
             });
            }
          }
        }]
      });
    };

     $scope.getunUnReadmessageOtherTotalCounts = function() {
     	return  YYIMCacheSpaceManager.updateCache({
            id:currentSpaceId
          }).unReadedOtherTotalNum;
     }
     
     $scope.getunUnReadmessageTotalCounts = function() {
      var length = 0;
      if (!localStorage.getItem('esn_user')){return 0;}
      var spacename = JSON.parse(localStorage.getItem('esn_user')).qzname;
      if (YYIMCacheSpaceManager.get(currentSpaceId)){
        length = YYIMCacheSpaceManager.get(currentSpaceId).unReadedTotalNum;
      }
      else{
         YYIMCacheSpaceManager.updateCache({
           id:currentSpaceId,
           name:spacename
         });
      }
      return length;// > 99 ? "99" : length;
    }

    $scope.getunReadedSpaceNum = function(item) {
      if(!item) return;
      var length = 0;
      if (!localStorage.getItem('esn_user')){return 0;}
      var spacename = JSON.parse(localStorage.getItem('esn_user')).qzname;
      if (YYIMCacheSpaceManager.get(item.qz_id)){
        length = YYIMCacheSpaceManager.get(item.qz_id).unReadedNum;
      }
      else{
         YYIMCacheSpaceManager.updateCache({
           id:item.qz_id,
           name:spacename
         });
      }

      return length;
    }

    //用户反馈业务
    $scope.feedback = function () {
      ngDialog.open({
        template: 'src/modules/main/user-feedback.html',
        showClose:false,
        overlay:true,
        disableAnimation:true,
        scope:$scope,
        data:"",
        controller: ['$scope',  function($scope) {
          $scope.feed_content = "";

          var limitation = 500; // 假设文本长度为 500
          // $scope.$watch('feed_content', function(newVal, oldVal) {
          //     if (newVal && newVal != oldVal) {
          //         if (newVal.length >= limitation) {
          //             $scope.feed_content = newVal.substr(0, limitation); // 这里截取有效的500个字符
          //         }
          //     }
          // })

          var FeedModule = {};
          FeedModule.handleInputMsg = function (e) {
            // console.log(e);
            $scope.feed_content = e.currentTarget.value;
          }
          FeedModule.cancel = function () {
            ngDialog.close();
          }
          FeedModule.post = function () {
            if ($scope.feed_content.length == 0) {
              toast('反馈意见不能为空',1000);
              return;
            }

            if ($scope.feed_content.length > 500) {
              toast('字数不能超过500字',1000);
              return;
            }

            var name =  jsonService.getJson("esn_user").uname;
            var email =  jsonService.getJson("esn_user").email;
            var mobile =  jsonService.getJson("esn_user").mobile;
            var contact = email || mobile;

            $.ajax({
              type: "POST",
              url: "http://ce.upesn.com/fedback/addFedBack?timestamp=_"+Math.random() ,
              data: {
                content: $scope.feed_content,
                name:name,
                contact:contact
              },
              dataType: "json",
              timeout: 10000 //10s超时
            })
            .done(function(data){
              if (data.success) {
                toast("感谢反馈");
                setTimeout(function () {
                  ngDialog.close();
                }, 1500);
              } else {
                toast("反馈失败");
              }
            })
            .fail(function(data){
              toast("反馈失败");
              setTimeout(function () {
                ngDialog.close();
              }, 1500);
            });

            // alert($scope.feed_content);
          }
          $scope.FeedModule = FeedModule;
        }]

      });
    }

window.selectMember = function(arg) {
        // body...
        ngDialog.open({
            template: 'src/modules/common/contacts.html',
            controller: 'contactsController',
            className: 'dudu-right-dialog-w',
            showClose: false,
            overlay: false,
            data:{"type":"FORWARD",'mid':arg.mid}
          });
      }

  }])

})
