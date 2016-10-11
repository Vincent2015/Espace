define(['./module','jquery'], function(module,$) {

  module.directive('deptmemberlist', ["organizationService",function(organizationService) {
     return {
           restrict:'AE',
           replace:true,
           templateUrl:"deptmemberlist.html",
           link: function($scope, element, attrs) {
               var _this = this;
               _this.page = 1;
               _this.count = 18;//每次加载18个
               $scope.deptmemberlist = [];
               $(element).find(".loadingmore").hide();
               var deptId = $scope.deptId;
               var firstPageData = null;
               if(deptId === 0){
                 firstPageData = organizationService.deptMemberList;//先从缓存里面取第一页
               }
               if(!!firstPageData){
                   if(firstPageData.length == 18){
                      $(element).find(".loadingmore").show();
                   }
                  $scope.deptmemberlist = $scope.deptmemberlist.concat(firstPageData) ;
               }
               organizationService.getDeptMemberList({
                   deptId:deptId,
                   page:_this.page,
                   count:_this.count,
                   success:function(data){
                       for (var k=0;k<data.length;k++){
                           data[k].avatar += '.thumb.jpg';
                         }
                       if(data && data.length == 18){
                          $(element).find(".loadingmore").show();
                       }
                       if(deptId === 0){
                         $scope.deptmemberlist = [];
                        }
                        $scope.$apply(function(){
                           $scope.deptmemberlist = $scope.deptmemberlist.concat(data) ;
                        });
                   }
               });

                $(element).find(".loadingmore").on("click",function(){
                     var $this = $(this);
                     $this.html("加载中，请稍后...");
                      _this.page += 1;
                      organizationService.getDeptMemberList({
                          deptId:deptId,
                          page:_this.page,
                          count:_this.count,
                          success:function(data){
                            $this.html("点击加载更多组织成员");
                             if(data && data.length > 0){
                                $scope.$apply(function(){
                                   $scope.deptmemberlist = $scope.deptmemberlist.concat(data) ;
                                });
                             }else{
                                $this.hide();
                             }
                          },
                          fail:function(json){
                            if (json.code && json.code != 0) {
                              $this.html("");
                            } else {
                              $this.html("加载失败，请重试...");
                            }
                          }
                      });
                });


           }
        }

  }])
  .directive('deptlist',['organizationService',function(organizationService){
      return {
        restrict:'AE',
        replace:true,
        templateUrl:"deptlist.html",
        link: function($scope, element, attrs) {
          organizationService.getDeptList({
              parentId:$scope.deptId,
              success:function(data){
                  $scope.$apply(function(){
                      $scope.sub_organization = data;
                  });
              }
          });
        }
      }

  }])
  .directive('deptadmin',['organizationService',function(organizationService){
      return {
        restrict:'AE',
        replace:true,
        templateUrl:"deptadmin.html",
        link: function($scope, element, attrs) {
          var deptadmin = organizationService.deptadmin;
          if(!!deptadmin){
              $scope.deptadmin = deptadmin;
              $(element).find(".content-group-org").show();
          }
          organizationService.getDeptAdmin({
              deptId:$scope.deptId,
              success:function(data){
                   for (var k=0;k<data.length;k++){
                           data[k].avatar += '.thumb.jpg';
                         }
                  $scope.$apply(function(){
                      $scope.deptadmin = data;
                  });
                  $(element).find(".content-group-org").show();
              }
          });
        }
      }

  }])
  .directive('contenthead',function(){
      return {
        restrict:'AE',
        replace:true,
        templateUrl:'contenthead.html',
        link: function($scope, element, attrs) {
        }
      }

  })




});
