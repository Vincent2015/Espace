define(['./module','jquery'], function(module,$) {
  module.controller("contactController", ["$scope",'ngDialog','httpService', '$state','contactService','$rootScope','contactService','jsonService','$timeout',function($scope,ngDialog,httpService, $state,contactService,$rootScope,contactService,jsonService,  $timeout) {

    // $rootScope.deptArray = [{id:0,name:'未加入任何组织'}];
    //电话会议
    $scope.isActive = true;
    $scope.isNotSelf = true;

    $scope.isShowSearchResult = false;


    var contactSearchModule = (function(_scope){
      var Search = function(){
         this.search = '';//绑定搜索输入框
         this.showDelIcon = false;
         this.showMenu = true;
         this.showloading = false;
         this.showDataPrompt = false;
         this.searchResult = {};
         this.memberPage = 1;
         this.groupPage = 1;
         this.showMemberMoreDiv = false;
         this.moreMemberTemp = [];
         this.moreGroupTemp = [];
      };
      Search.prototype={
        delsearch:function(event,id) {
            this.search="";
            this.showDelIcon = false;
            _scope.isShowSearchResult = false;
            this.showMenu = true;
            this.showDataPrompt = false;
            this.searchResult = {};
        },
        addResult:function(data){
            if(!!data){
              this.searchResult = data;
            }
        },
        activeLi:function(e,gid){
           $(e.currentTarget).parent().find('li').removeClass('active');
           $(e.currentTarget).addClass('active');
           if(!!gid){
             $scope.createTeamGroupChat(gid);
           }
        },
        moreMember:function(newVal){
            var self = this;
            this.putMemberData(this.moreMemberTemp);
            contactService.getMoreMember({
                keyWord:newVal,
                page:self.memberPage,
                count:10,
                success:function(des){
                    self.moreMemberTemp = des;
                    self.memberPage += 1;
                    // console.log(des);
                    // contactSearchModule.putMemberData(des);
                    // console.log(contactSearchModule.searchResult);
                }
            });
        },
        moreGroup:function(newVal){
            var self = this;
            this.putGroupData(this.moreGroupTemp);
            contactService.getMoreGroup({
                keyWord:newVal,
                page:self.groupPage,
                count:10,
                success:function(des){
                    self.moreGroupTemp = des;
                    self.groupPage += 1;
                    // console.log(des);
                }
            });
        },
        putMemberData:function(des){
            var src = this.searchResult.contacts_list;
            if(src && src.length > 0 && des && des.length > 0){
                var temp = des.length < 6 ? des.length : 6;
                for(var j in des){
                    var des_obj = des[j];
                    for(var i=0;i<temp;i++){//比对前六个
                        var src_obj = src[i];
                        if(src_obj && des_obj && src_obj.muid == des_obj.id){
                            des_obj = null;
                            break;
                        }
                    }
                    if(des_obj){
                        src.push({
                            muid:des_obj.id,
                            other_avatar:des_obj.avatar,
                            uname:des_obj.name
                        });
                    }
                }
            }
        },
        putGroupData:function(des){
            var src = this.searchResult.team_list;
            if(src && src.length > 0 && des && des.length > 0){
                var temp = des.length < 6 ? des.length : 6;
                for(var j in des){
                    var des_obj = des[j];
                    for(var i=0;i<temp;i++){//比对前几个
                        var src_obj = src[i];
                        if(src_obj && des_obj && src_obj.gid == des_obj.gid){
                            des_obj = null;
                            break;
                        }
                    }
                    if(des_obj){
                        src.push({
                            gid:des_obj.gid,
                            avatar:des_obj.avatar,
                            group_name:des_obj.group_name
                        });
                    }
                }
            }
        }
      }
      var search = new Search();
      return search;
    })($scope);
    $scope.contactSearchModule = contactSearchModule;
    $scope.createTeamGroupChat = function (gid) {

      var id = 'group_' + currentSpaceId + '_' + gid;

      $state.go("main.imhomeplus.message", {
        personId: id,
        personName: '',
        chatType: 'groupchat',
      });

    }
    $scope.chooseItem = function(e){
        //TODO
    }
    $scope.$watch('contactSearchModule.search', function(newVal, oldVal) {
        if (!!newVal) {
            contactSearchModule.showDelIcon = true
            $scope.isShowSearchResult = true;



            contactSearchModule.showMenu = false;
            contactSearchModule.showloading = true;
            contactSearchModule.showDataPrompt = false;
            contactSearchModule.searchResult = {};
            contactSearchModule.memberPage = 1;
            contactSearchModule.moreMemberTemp = [];
            contactSearchModule.groupPage = 1;
            contactSearchModule.moreGroupTemp = [];
            $timeout(function(){
              $scope.$apply();
            });

            contactService.findContact({
                keyWord:newVal,
                success:function(data){
                  $scope.contactSearchModule.addResult(data);
                  contactSearchModule.showloading = false;
                  // console.log(data);
                  if(!data.contacts_list){
                    data.contacts_list = [];
                  }
                  if(data.contacts_list.length == 0 && data.team_list.length == 0){
                      contactSearchModule.showDataPrompt = true;//没有找到对应数据
                  }
                  if(contactSearchModule.searchResult.contacts_list.length > 0){
                      contactSearchModule.showDataPrompt = false;
                      //首次加载之后调用获取更多联系人的接口
                      contactSearchModule.moreMember(newVal);
                  }
                  if(contactSearchModule.searchResult.team_list.length > 0){
                      contactSearchModule.showDataPrompt = false;
                      //首次加载之后调用获取更多联系人的接口
                      contactSearchModule.moreGroup(newVal);
                  }
                  $timeout(function(){
                    $scope.$apply();
                  });

                },
                error:function(err){
                  contactSearchModule.showloading = false;
                }

            });
        }else{
            contactSearchModule.showDelIcon = false;

            $scope.isShowSearchResult = false;
            contactSearchModule.showMenu = true;
            contactSearchModule.showloading = false;
        }
    }, true);


    $scope.personMananger = {
      meeting_numbers: [{
        "id": 0,
        active: false
      }, {
        "id": 1,
        active: false
      }, {
        "id": 2,
        active: false
      }, {
        "id": 3,
        active: false
      }, {
        "id": 4,
        active: false
      },
      {
        "id": 5,
        active: false
      }, {
        "id": 6,
        active: false
      }, {
        "id": 7,
        active: false
      }, {
        "id": 8,
        active: false
      }, {
        "id": 9,
        active: false
      }],
      add_person: function(model) {
        if (this.meeting_numbers.length > 9) {
          return;
        }
        this.meeting_numbers.push({});
      },
      remove_person: function(index) {

        this.meeting_numbers.splice(index, 1);

      }
    };


     $rootScope.openMsgDialog=function(user){
     if(user.member_id !== YYIMChat.getUserID()){
        YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().updateCache({
          id: user.member_id,
          name: user.name,
          type: 'chat',
          sort: true
        });
      }

      jQuery('.IMChat-search .dropdown-menu').scrollTop(0);
      $state.go("main.imhomeplus.message", {
        personId: user.member_id,
        personName: user.name,
        chatType:'chat'
      });

     // $scope.$emit("chatHistoryListChange_toparent", item);
    }

    $rootScope.go2msg = function(user){
      try{
        $scope.closeThisDialog();
      }catch(e){}
    	//var id = 1631;
      //$state.go("main.imhome.person", {id: id});
      $('.esn-im-nav-row').removeClass('active');
      document.getElementById("message_mod").classList.add("active");
      $rootScope.openMsgDialog(user);
    }
    $rootScope.go2dudu = function(){
    	alert('嘟嘟系统尚未对接');
    }
    $rootScope.go2weimail = function(){
    	alert('微邮系统尚未对接');
    }

     //小箭头样式
     $scope.toggleDisplayClass = function (e) {
          var $this = $(e.currentTarget);
          var children = $this.find(".triangle");
          if(children.hasClass("triangle-down")){
             children.removeClass("triangle-down").addClass("triangle-up");
             $this.next().hide();
          }else if(children.hasClass("triangle-up")){
             children.removeClass("triangle-up").addClass("triangle-down");
             $this.next().show();
          }
     }
  }])

})
