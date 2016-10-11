define(['./module'], function(module) {

  module.factory('contactsService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService', '$rootScope',function(CacheList, $http, $q, httpService, BasicCacheService,$rootScope) {

    var ContactsManager = BasicCacheService.extend({
      initialize: function() {
        this.selectedList = [];
      },

      initSelectedList: function() {
        this.selectedList = [];
        return this.selectedList;
      },
      getSelectedList: function () {
        //$rootScope.$broadcast("getSelectedList", this.selectedList, this.getNgDialogId());
        return this.selectedList;
      },
      addOnePerson: function(e, id) {

        var index = _.findIndex(this.selectedList, {id: id});

        if ($(e.target).hasClass("active")) {
          $(e.target).removeClass("active");
          if (index != -1) this.selectedList.splice(index, 1);
        } else {

          // if (this.selectedList.length >= 9) return;

          $(e.target).addClass("active");
          if(index == -1) {
            var p = _.find(this.commonContactsList, function (each) { return each.id == id});
            this.selectedList.push(p);
          };
        }

      },
      removeOnePerson: function (index) {
        this.selectedList.splice(index, 1)
      },
      addPersonById: function (id) {
        var p = _.find(this.commonContactsList, function (each) { return each.id == id});
        // console.log("-=-=-=-=-=-=");
        // console.log(p);
        this.selectedList.push(p);
      },
      addOnePersonByOther: function (p) {
        this.selectedList.push(p);
      },
      getSelectingList: function () {
        return this.selectedList;
      },
      concatSelectedList: function (data) {
        this.selectedList = this.selectedList.concat(data);
        this.selectedList = _.uniq(this.selectedList);
        return this.selectedList;
      },
      //获取常用联系人结构
      getCommonContactsList: function() {
        var recentList = YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getRecentManager().getRecentList();;
        this.commonContactsList = _.filter(recentList, function(each){ return each.type == "chat"; });
        return this.commonContactsList;
      },

      getNgDialogId: function () {
        return this.get("ngDialogId");
      }




    })





    return {
      contactsManager: new ContactsManager()

    }

  }])

  module.controller("contactsController", ['$rootScope','$scope', 'ngDialog', 'contactsService','httpService','contactService', function($rootScope,$scope, ngDialog, contactsService, httpService,contactService) {


    var ngDialogData = $scope.ngDialogData;
    var chatinfo;
    var groupInfo;
    var groupSetCheckedMembers;
    if(ngDialogData){
      chatinfo = ngDialogData.chatinfo;
      groupInfo = ngDialogData.groupInfo;
      $scope.groupSetCheckedMembers = ngDialogData.groupSetCheckedMembers;//群设置里面已选择的群成员
    }


    $scope.addPersonIntoSelectArray = function(e,person){
      var selectingList = contactsService.contactsManager.getSelectingList();

      var index;
      index = _.findIndex(selectingList, {'id': person.muid});
      if (index == -1) {
        index = _.findIndex(selectingList, {'userid': person.muid});
      }
      if (index == -1) {
        index = _.findIndex(selectingList, {'member_id': person.muid});
      }

      if(e.currentTarget.checked){

          if (index == -1) {
            selectingList.push({
              id:person.muid,
              name:person.uname,
              vcard:{
                avatar:person.other_avatar
              }
            })
          }
      }else{
        if (index != -1) {
          contactsService.contactsManager.removeOnePerson(index);
        }

      }
    }



    $scope.init = function () {
      var ngDialogId = $scope.ngDialogId;
      $scope.forwarmsg = $scope.ngDialogData;
      contactsService.contactsManager.set("ngDialogId", ngDialogId);

      $scope.contactsManager = contactsService.contactsManager;


      $scope.selectedList = $scope.contactsManager.initSelectedList();

      $scope.search_keyword = "";
      //set 常用联系人数据
      setCommonContactsList();
      if(chatinfo){
        contactsService.contactsManager.addPersonById(chatinfo.id);
      }
    }




    $scope.$on("personListSelected", function (e,data) {
        // console.log(data);
        $scope.selectedList = $scope.contactsManager.concatSelectedList(data);

        // $scope.$apply(function () {
        //   $scope.selectedList =  $scope.contactsManager.getSelectedList();
        // })

    });



    $scope.go_to_detail = function(id) {

      $scope.detail_show = true;


      setTimeout(function () {
        $(".contacts_body_detail").removeClass("contacts_body_detail_out");
        $(".contacts_body_detail").addClass("contacts_body_detail_in");


        $scope.selected_num = id; //1 组织 2 团队 3 关注


      },100)


    }
    //返回
  	var ngDialogId = $scope.ngDialogId;
    $scope.goBack = function(){
        $(".contacts_body_detail").addClass("contacts_body_detail_out");
        ngDialog.close(ngDialogId);
    }

    $scope.back_index = function() {
      $(".contacts_body_detail").removeClass("contacts_body_detail_in");
      $(".contacts_body_detail").addClass("contacts_body_detail_out");
      setTimeout(function () {
        $scope.detail_show = false;
      }, 420)
    }

    $scope.go_to_detail_sub = function (routeParams) {
      $scope.detail_sub_show = true;

      $scope.routeParams = routeParams;

      setTimeout(function () {
        $(".contacts_body_detail_sub").removeClass("contacts_body_detail_out");
        $(".contacts_body_detail_sub").addClass("contacts_body_detail_in");
      },100)


    }

    $scope.back_detail = function() {
      $(".contacts_body_detail_sub").removeClass("contacts_body_detail_in");
      $(".contacts_body_detail_sub").addClass("contacts_body_detail_out");
      setTimeout(function () {
        $scope.detail_sub_show = false;
      }, 420)

    }


    //关闭右侧弹框
    var ngDialogId = $scope.ngDialogId;
    // console.log($scope);
    $scope.closeDiag = function() {
      $(".esn-right-dialog").addClass("esn-right-dialog-out");
      setTimeout(function() {
          ngDialog.close(ngDialogId);
        }, 420)
        // ngDialog.close();
    }

    $scope.getSelectedList=function () {
        if ($scope.forwarmsg && $scope.forwarmsg.type == "FORWARD"){
            var mid = $scope.forwarmsg.mid;
            $scope.forwarmsg = null;
            var selectedList = $scope.contactsManager.getSelectedList();
            if (selectedList){
               for(i=0;i<selectedList.length;i++){
                 YYIMCacheSpaceManager.updateCache({id:currentSpaceId}).getMessageManager().forwardMessage({"mid":mid,'to':selectedList[i]['id'],success: function(data){
                    $rootScope.$broadcast("chatlistmessage");
                 }});
               }

            }

        }else{
            var selectedList = $scope.contactsManager.getSelectedList();
            // getSelectedListModule
            if($scope.forwarmsg && !!$scope.forwarmsg.getSelectedListModule){
              $rootScope.$broadcast("getSelectedList."+$scope.forwarmsg.getSelectedListModule, selectedList, $scope.contactsManager.getNgDialogId());
            }else{
              $rootScope.$broadcast("getSelectedList", selectedList, $scope.contactsManager.getNgDialogId());
            }


            return selectedList;
        }
        $scope.closeDiag();
      }




    //set 常用联系人数据
    function setCommonContactsList() {
      $scope.commonContactsList = $scope.contactsManager && $scope.contactsManager.getCommonContactsList();

    }
    //add by liucyu
    $scope.searchDelIcon = false;
    $scope.searchDelMask = false;
    $scope.showloading = false;
    $scope.showDataPrompt = false;
    $scope.delSearch = function(type){
        if('icon' === type){
          $scope.search_keyword = '';
          $scope.searchDelMask = false;
        }else if('mask' === type){
          $scope.searchDelMask = true;
          if(!$scope.search_keyword){
            $scope.searchDelMask = false;
          }
        }
        $scope.showDelIcon = false;
        $scope.showDataPrompt = false;
    }
    //搜索联系人
    $scope.$watch("search_keyword",function(keyword,oldValue){
      if(!!keyword){
          $scope.showDelIcon = true;
          $scope.showloading = true;
          contactSearchModule.memberPage = 1;
          contactSearchModule.searchResult = {};
          contactSearchModule.moreMemberTemp = [];
          contactService.findContact({
              keyWord:keyword,
              success:function(data){
                $scope.contactSearchModule.addResult(data);
                $scope.showloading = false;
                // console.log(data);
                if(!data.contacts_list){
                  data.contacts_list = [];
                }
                if(data.contacts_list.length == 0){
                    $scope.showDataPrompt = true;//没有找到对应数据
                }
                if(contactSearchModule.searchResult.contacts_list.length > 0){
                    $scope.showDataPrompt = false;
                    //首次加载之后调用获取更多联系人的接口
                    contactSearchModule.moreMember(keyword);
                }
              },
              error:function(err){
                $scope.showloading = false;
              }

          });

      }else{
          $scope.showDelIcon = false;
          $scope.searchDelMask = false;
      }
    })

    var contactSearchModule = (function(){
      var Search = function(){
         this.searchResult = {};
         this.memberPage = 1;
         this.showMemberMoreDiv = false;
         this.moreMemberTemp = [];
      };
      Search.prototype={
        addResult:function(data){
            if(!!data){
              this.searchResult = data;
              var contactsList = this.searchResult.contacts_list;
              var checkedList = $scope.groupSetCheckedMembers;
              if(contactsList && checkedList){
                  for (var i = 0; i < contactsList.length; i++) {
                      for (var j = 0; j < checkedList.length; j++) {
                          if(contactsList[i].muid == checkedList[j]){
                              contactsList[i].checked = true;
                              break;
                          }
                      }
                  }
                }
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
                      var checkedList = $scope.groupSetCheckedMembers;
                      var flag = false;
                      if(checkedList){
                          for (var j = 0; j < checkedList.length; j++) {
                              if(checkedList[j] == des_obj.id){
                                  flag = true;
                                  break;
                              }
                          }
                        }
                        src.push({
                            muid:des_obj.id,
                            other_avatar:des_obj.avatar,
                            uname:des_obj.name,
                            checked:flag
                        });
                    }
                }
            }
        }
      }
      var search = new Search();
      return search;
    })();
    $scope.contactSearchModule = contactSearchModule;



  }])
})
