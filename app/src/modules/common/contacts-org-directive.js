define(['./module'], function(module) {


  module.factory('OrgListService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService',function(CacheList, $http, $q, httpService, BasicCacheService) {



    var OrgListService = BasicCacheService.extend({
      initialize: function() {

      },
      //获取分组列表
      getFollowGroup: function () {

        var deferred = $q.defer();

        var url = "/user/followGroup";

        this.fetch(url, "FollowGroup")
        .then(function (data) {
          deferred.resolve(data);
        })
        .catch(function (error) {
          deferred.reject(error);
        })

        return deferred.promise;

      },
      //获取组织结构
      getDeptList: function () {
        return this.getCacheData("DeptList") || [];
      },
      // 获取用户列表
      getDeptMemberList: function () {
        return this.getCacheData("DeptMemberList") || [];
      },
      // 获取组织管理员
      getDeptAdmin: function () {
        return this.getCacheData("DeptAdmin") || [];
      },
      getDeptMemberListAll: function () {
        return this.getDeptAdmin().concat(this.getDeptMemberList());
      },


    });



    return new OrgListService();

  }])

module.directive('org',["httpService", "OrgListService","contactsService", "jsonService",function(httpService, OrgListService, contactsService, jsonService){
  return {
    restrict: 'AECM',
    templateUrl: 'src/modules/common/contacts-org-directive.html',
    repalce: true,
    link: function ($scope, element, attrs) {

        console.log("org===========directive");

        // 0 表示取得当前空间的全部组织数据 全部成员
        var esn_user_new = jsonService.getJson("esn_user");

        $scope.cur_org_id = 0;

        $scope.limit = 18;
        $scope.page = 1;
        $scope.loadingStep = 0; //0 表示可以加载 1 表示正在加载

        setOrgList($scope.cur_org_id);

        //导航头
        $scope.navHeadHandler = new navHeadHandler();


        //导航头
        function navHeadHandler() {

          $scope.q_name = jsonService.getJson("esn_user").qzname;
          // $scope.c_qz_id = jsonService.getJson("esn_user").qz_id;

          this.navHeadArray =[{id:0,name:$scope.q_name}];

        }

        navHeadHandler.prototype.handleNav = function (each) {
          var index = _.findIndex(this.navHeadArray, {id: each.id});
          if (index == -1) {
            this.navHeadArray.push(each);
          } else {
            this.navHeadArray = this.navHeadArray.slice(0,index+1);
            // this.navHeadArray.splice(index+1, this.navHeadArray.length - index -1);
          }
        }






        //set 我的组织数据
        function setOrgList(id) {
          //0 代表获取当前空间下信息
          if (id == 0) {
            //获取组织成员和管理员列表
            $scope.orgContactsList = OrgListService.getDeptMemberListAll();
            fetchOrgList(id);

            //获取下属组织
            $scope.sub_organization = OrgListService.getDeptList();
            fetchSubOrganization(id);
          } else {

            fetchOrgList(id, 'nocache');
            fetchSubOrganization(id, 'nocache');
          }

        }
        //刷新我的组织成员数据
        function fetchOrgList(id, nocache) {
          if (nocache) {
            //获取组织成员列表 每页加载18个
            var url = "/user/dept/"+ id +"/1/18";
            OrgListService.fetch(url, "")
            .then(function (data) {

              if (_.isArray(data)) {
                $scope.DeptMemberList = data;

              } else {
                $scope.DeptMemberList = [];
                $scope.DeptMemberList.push(data);
              }

              concatContactsList()
            })
            .catch(function (error) {
              //nocache下 清空 DeptMemberList
              $scope.DeptMemberList = [];
              concatContactsList()
              console.log("error");
            })

            //获取组织管理员列表
            var url = "/dept/admin/"+ id;
            OrgListService.fetch(url, "")
            .then(function (data) {
              if (_.isArray(data)) {
                $scope.DeptAdmin = data;
              } else {
                $scope.DeptAdmin = [];
                $scope.DeptAdmin.push(data);
              }
              concatContactsList()
            })
            .catch(function (error) {
              //nocache下 清空 DeptAdmin
              $scope.DeptAdmin = [];
              concatContactsList()
              console.log("error");
            })
          } else {
            //获取组织成员列表 每页加载18个
            var url = "/user/dept/"+ id +"/1/18";
            OrgListService.fetch(url, "DeptMemberList")
            .then(function (data) {
              $scope.orgContactsList = OrgListService.getDeptMemberListAll();
            })
            .catch(function (error) {
              console.log("error");
            })

            //获取组织管理员列表
            var url = "/dept/admin/"+ id;
            OrgListService.fetch(url, "DeptAdmin")
            .then(function (data) {
              $scope.orgContactsList = OrgListService.getDeptMemberListAll();
            })
            .catch(function (error) {
              console.log(error);
            })
          }

        }

        function concatContactsList() {
          var DeptAdmin = $scope.DeptAdmin || [];
          var DeptMemberList = $scope.DeptMemberList || [];
          $scope.orgContactsList = DeptAdmin.concat(DeptMemberList);
        }

        //刷新我的下属组织数据
        function fetchSubOrganization(id, nocache) {
          if (nocache) {
            var url = "/dept/"+ id;
            OrgListService.fetch(url, "")
            .then(function (data) {
              $scope.sub_organization = data;
            })
            .catch(function (error) {
              //nocache 清空 $scope.sub_organization
              $scope.sub_organization = [];
              console.log("error");
            })
          } else {
            var url = "/dept/"+ id;
            OrgListService.fetch(url, "DeptList")
            .then(function (data) {
              $scope.sub_organization = data;
            })
            .catch(function (error) {
              console.log("error");
            })
          }

        }

        //刷新组织界面－下属组织by id
        $scope.refreshOrgById = function (each) {
          $scope.cur_org_id = each.id;
          setOrgList(each.id);
          $scope.navHeadHandler.handleNav(each);
        }

        $scope.OrgPersonListManager = {};

        $scope.OrgPersonListManager.addOnePerson = function (e, each) {

          var selectingList = contactsService.contactsManager.getSelectingList();
          var index = _.findIndex(selectingList, {'userid': each.userid});



          if ($(e.target).hasClass("active")) {
            $(e.target).removeClass("active");
            if (index != -1){
               contactsService.contactsManager.removeOnePerson(index);
            };
          } else {
            // if (selectingList.length >= 9) return;
            $(e.target).addClass("active");
            if(index == -1) {
              console.log(each);
              contactsService.contactsManager.addOnePersonByOther(each);
            };
          }


        }


      }
    }

}])
})
