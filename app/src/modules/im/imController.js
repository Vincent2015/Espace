define(['./module'], function(module) {
  module.controller("imController", ["$scope","$state","imService",'pushService', function($scope,$state,imService,pushService) {
      //重置缓存变量
      imService.dataSouce = {};
      imService.initWinResultMapping={};
      imService.imControllerScope = $scope;
      $scope.selectedId = "";

      $scope.contactList=[{
        atFlag:0,
        avatar:[""],
        id:"gg999",
        isNoRemindWin:0,
        isTop:0,
        msg:"消息公告",
        name:"公告",
        newMsgCount:0,
        obj_type:"9",
        online:true,
        sendid:"17517",
        sendname:"",
        sendtime:1466993392
      }];
      imService.InitIm({
        success:function(data) {
            $scope.contactList = $scope.contactList.concat(data);

            if (window.allUnMsgCount>0){
              jQuery('#message_mod span').css('display','block');
            }
        },
        error:function(err) {
          // body...
        }
      });



      $scope.itemClickP=function(data){
        // alert(0);
        imService.winInfo = data;
        imService.winInfo.name = data.uname;
        $scope.selectedId = data.muid;

        add2Recentlist(data.uid,data.uname,data.other_avatar);

        $state.go('main.imhome.person', { id: data.muid });
        jQuery('#contact_2').css('display','none');
        jQuery('.esn-input-search').val('');


      }
      $scope.itemClickG=function(data){
        // alert(0);
        imService.winInfo = data;
        imService.winInfo.name = data.group_name;
        $scope.selectedId = data.muid;
        add2Recentlist(data.uid,data.group_name,data.avatar);
        $state.go('main.imhome.group', { id: data.muid });
        jQuery('#contact_2').css('display','none');
        jQuery('.esn-input-search').val('');

      }
      $scope.itemClickTG=function(data){
        // alert(0);
        imService.winInfo = data;
        //imService.winInfo.name = data.company;

        $scope.selectedId = data.muid;
         add2Recentlist(data.id,data.name,data.avatar);
        $state.go('main.imhome.discussiongroup', { id: data.muid });
          jQuery('#contact_2').css('display','none');
          jQuery('.esn-input-search').val('');

      }
      function add2Recentlist(id,name,avatars){
        var tempavas=[];
        for(var i=0;i<avatars.length;i++){
          tempavas[i] = avatars[i];
        };
        var item = {
           id:id,
           name:name,
           avatars:tempavas
        }
        $scope.contactList.unshift(item);

      }

      $scope.itemClick=function(data){
        // alert(0);
        data.newMsgCount = 0;
        imService.winInfo = data;
        $scope.selectedId = data.id;
        if(data.obj_type=="0"){
          $state.go('main.imhome.person', { id: data.id,newMsgCount:data.newMsgCount });
        }else if(data.obj_type=="1"){
          $state.go('main.imhome.group', { id: data.id,newMsgCount:data.newMsgCount });
        }else if(data.obj_type=="2"){
          $state.go('main.imhome.discussiongroup', { id: data.id,newMsgCount:data.newMsgCount });
        }else if(data.id=="gg999"){
          $state.go('main.imhome.affiche');
        }
      }
      $scope.keydown=function(e){
        // console.log(e.currentTarget.value);
         if(!e.currentTarget.value){
                imService.InitIm({
              success:function(data) {
                  $scope.contactList = data;
                  // jQuery('#contact_1').css('display','block');
                  jQuery('#contact_2').css('display','none');
              },
              error:function(err) {
                // body...
              }
            });
         }else{
          imService.findImU(e.currentTarget.value,({
                          success:function(data) {
                           $scope.clist = data;
                            jQuery('#contact_2').css('display','block');
                            // jQuery('#contact_1').css('display','none');
                         },
                          error:function(err) {
                            // body...
                          }
                        })
          )
         }

      }

      $scope.fileNameChanged = function(e){
        var file = jQuery('#imfile')[0].files[0];
        imService.upLoadfile(file);

      }
  }])

})
