define(['./module',"jquery"], function(module,$) {
    module.controller("followersController", ["$scope", 'followersService','ngDialog','$rootScope',function($scope,followersService,ngDialog,$rootScope) {
        var FollowerModule = (function(){
            var Follower = function(){
                this.FollowGroup = [];
                this.unfollowData = [];//未分组成员数据
                this.init();

            };
            Follower.prototype = {
                clearCache:function(){
                  this.FollowGroup = [];
                  this.unfollowData = [];//未分组成员数据
                  followersService.dataSouce = [];
                  followersService.unfollowData = [];
                  this.init();
                },
                init:function(fn){
                  var _this = this;
                  if (followersService.dataSouce.length >0){//首先从缓存里面取数据
                      _this.FollowGroup = followersService.dataSouce;
                      _this.FollowGroup.sort(_this.sortFollowGroup);
                      _this.unfollowData = followersService.unfollowData;
                      // $scope.$apply(function(){
                      // });
                      $scope.FollowGroup = _this.FollowGroup;
                      $scope.unfollowData = _this.unfollowData;
                  }
                  _this.getFollowGroup(fn);

                },
                addFollowGroup:function(data){
                  var self = this;
                  for(var i=0;i<self.FollowGroup.length;i++){
                    if(self.FollowGroup[i].id === data.id){
                       return;
                    }
                  }
                  self.FollowGroup.push(data);

                },
                getFollowGroup:function(fn){
                    var _this = this;
                    followersService.getFollowGroup({
                        success:function(data) {
                           if(!!data){
                              data.forEach(function (item) {

                                  followersService.getFollowGroupById({
                                        followId:item.id,
                                        success:function(FollowGroupdata) {
                                          // console.log(FollowGroupdata);
                                            item.dataList = FollowGroupdata;
                                            if (FollowGroupdata.data){
                                               for (var k=0;k<FollowGroupdata.data.length;k++){
                                              FollowGroupdata.data[k].avatar += '.thumb.jpg';
                                              }
                                            }
                                           
                                            if (item.id == 0){//未分组
                                                _this.unfollowData = FollowGroupdata.data;
                                                $scope.$apply(function(){
                                                    $scope.unfollowData = _this.unfollowData;
                                                });
                                                followersService.unfollowData = _this.unfollowData;
                                                // alert(JSON.stringify($scope.unfollowData));
                                            }
                                            _this.addFollowGroup(item);
                                            _this.FollowGroup.sort(_this.sortFollowGroup);
                                            followersService.dataSouce =  _this.FollowGroup;
                                            $scope.$apply(function(){
                                                $scope.FollowGroup = _this.FollowGroup;
                                            });
                                        },
                                        error:function(data) {  }
                                      }
                                  );
                              });
                           }
                        },
                        error:function(err) {
                            // body...
                        }
                    });
                },
                sortFollowGroup:function(obj1,obj2){
                    if(obj1 && obj2 && !isNaN(obj1.id) && !isNaN(obj2.id)){
                        return (parseInt(obj1.id)-parseInt(obj2.id))> 0 ? 1 : -1;
                    }
                }
            };
            var follower = new Follower();
            return follower;
        })();

        //响应切换空间事件
        $scope.$on("switchSpace", function () {
           FollowerModule.clearCache();
        })

        //响应关注/取消关注事件
        $rootScope.$on("initFollowList", function (event) {
          // console.log('-------initFollowList--------');
           FollowerModule.clearCache();
        })

        $scope.followgroup = function(){
           ngDialog.open({
               template: 'src/modules/contacts/follower-group.html',
               showClose:false,
               overlay:true,
               scope:$scope,
               disableAnimation:true
           });
        }
        $scope.rowsClick = function (event) {
            $(event.target).parent().find("li").removeClass("active");
            $(event.target).addClass("active");
        };

        $scope.followId = 0;
        $scope.followClick = function (followid) {
            $scope.followId = followid;
        };

        var FollowerMemberArray =(function(){
            var MemberArray = function(){
              this.dataArray = [];
              this.showImgDataArray = [];
            };
            MemberArray.prototype = {
                addData:function(data){
                  var self = this;
                  for(var i=0;i<self.dataArray.length;i++){
                    if(self.dataArray[i].id === data.id){
                       self.removeData(data);
                       return;
                    }
                  }
                  self.dataArray.push(data);

                },
                removeData:function(data){
                   var self = this;
                   for (var i=0;i<self.dataArray.length;i++){
                         if (self.dataArray[i].id === data.id){
                             self.dataArray.splice(i, 1);
                             break;
                         }
                     }
                   },
                   getShowImgDataArray:function(){
                      var _this = this;
                      if(_this.dataArray.length <= 10){
                         _this.showImgDataArray = _this.dataArray;
                      }else if(_this.dataArray.length > 10){
                         _this.showImgDataArray = [];
                         for(var i = 0;i<5;i++){
                           _this.showImgDataArray.push(_this.dataArray[i]);
                         }
                         _this.showImgDataArray.push('...');
                         for(var j = _this.dataArray.length-5;j<_this.dataArray.length;j++){
                           _this.showImgDataArray.push(_this.dataArray[j]);
                         }
                        //  console.info(_this.showImgDataArray);

                      }
                   }

              };
              var memberArray = new MemberArray();
              return memberArray;
        })();

        $scope.addFollowerMember = function (e,obj) {
          if($(e.currentTarget).hasClass('active')){
             $(e.currentTarget).removeClass('active')
          }else{
             $(e.currentTarget).addClass('active')
          }
          FollowerMemberArray.addData(obj);
          FollowerMemberArray.getShowImgDataArray();
          $scope.memberArray = FollowerMemberArray.dataArray;
          $scope.showImgDataArray = FollowerMemberArray.showImgDataArray;
        };
        $scope.searchFollowMember = function (e) {
          if(!!$(e.currentTarget).val()){
             $(e.currentTarget).parent().removeClass('active')
          }else{
             $(e.currentTarget).parent().addClass('active')
          }
        };


        $scope.addMember = function () {
            var followId = $scope.followId;//组ID
            var memberData = $scope.memberArray;//选中的member
            var member_Id = [];
            for(var i=0;i<memberData.length;i++){
                member_Id.push(memberData[i].id);
            }
            followersService.addFollowerMember({
                gid:followId,
                member_Id:member_Id,
                success:function(data){
                    // console.log(data);
                },error:function(data){
                  // console.log(data);
                }
            });
        };

        $scope.addfollow = function(){
          //  console.info($scope);
           ngDialog.open({ template: 'src/modules/contacts/follower-add.html',
               showClose:false,
               overlay:true,
               disableAnimation:true,
               scope: $scope,
               controller:['$scope',function($scope){
                    $scope.memberArray = [];
                    $scope.showImgDataArray = [];
                    // console.info($scope);
               }]
           });
        };
        $scope.addgroup = function (event) {
            $(event.target).hide();
            $(".newgroup").show();
        };
        $scope.delGroup = function () {
            singleConfirm.getInstance({
                msg:"您确定要删除分组吗?",
                confirm:function () {
                    followersService.delFollowGroup({
                        gid:$scope.followId,
                        success:function(rep) {
                            // console.log(rep);
                            if(rep.code == 0 ){
                                toast("删除分组成功");
                                for(var i=0,len=$scope.FollowGroup.length;i<len;i++){
                                    if($scope.FollowGroup[i].id===$scope.followId){

                                        $scope.$apply(function() {
                                            $scope.followId = 0;
                                            $scope.FollowGroup.splice(i, 1);
                                        });
                                        len--;
                                    }
                                }
                            }
                        },
                        error:function(data) {}
                    });
                },
                cancle:function(){

                }
            });
        };
        $scope.saveGroup = function() {
            if($scope.group.name.trim().length == 0){
              toast("分组名称不能为空!",2000);
            } else {
                followersService.addFollowGroup({
                    param:{
                        name:$scope.group.name.trim()
                    },
                    success:function(rep) {
                        var item ={id:rep.data.id,name:$scope.group.name.trim()};
                        $scope.$apply(function() {
                            $scope.FollowGroup.push(item);
                            $scope.FollowGroup.sort();
                        });
                    },
                    error:function(data) {}
                })
                $(".newgroup").hide();
                $(".addgroup").show();
            }
        };
        $scope.delfollow = function (member_id) {
            singleConfirm.getInstance({
                msg:"您确定要删除该成员吗?",
                confirm:function () {
                    followersService.delFollow({
                        gid:$scope.followId,
                        memberId:member_id,
                        success:function(rep) {
                            // console.log(rep);
                            if(rep.code == 0 ){
                                 toast("删除成员成功");
                                 for(var i=0,len=$scope.FollowGroup.length;i<len;i++){
                                     if($scope.FollowGroup[i].id===$scope.followId){
                                         for(var x=0,xlen=$scope.FollowGroup[i].dataList.data.length;x<xlen;x++){
                                            if ($scope.FollowGroup[i].dataList.data[x].member_id === member_id){
                                                $scope.$apply(function() {
                                                    $scope.FollowGroup[i].dataList.data.splice(x, 1);
                                                });
                                                xlen--;
                                            }
                                         }
                                    }
                                 }
                            }
                        },
                        error:function(data) {}
                    });
                },
                cancle:function(){

                }
            });
        }

    }]);

});
