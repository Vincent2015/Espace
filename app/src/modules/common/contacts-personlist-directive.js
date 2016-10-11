define(['./module'], function(module) {


  module.factory('PersonListService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService','teamService',function(CacheList, $http, $q, httpService, BasicCacheService,teamService) {



    var PersonListService = BasicCacheService.extend({
      initialize: function() {

      },

      //获取分组成员列表by id
      getFollowGroupById: function (params) {

        var deferred = $q.defer();

        var url = "/user/followGroup/" + params.id;

        this.fetch(url, "")
        .then(function (data) {
          deferred.resolve(data);
        })
        .catch(function (error) {
          deferred.reject(error);
        })

        return deferred.promise;

      },
      getTeamGroupById: function (params) {

        var deferred = $q.defer();

        teamService.loadData(params["id"])
        .then(function (data) {
          var concat_array = data.adminList.concat(data.memberList);
          deferred.resolve(concat_array);
        })
        .catch(function (error) {
          deferred.reject(error);
        })

        return deferred.promise;

      },
      getOrgGroupList: function (params) {

        var deferred = $q.defer();

        //获取组织成员列表 每页加载18个
        var url = "/user/dept/"+ params.id +"/"+ params.page + "/" + params.limit;
        this.fetch(url, "")
        .then(function (data) {

          var resultArr;
          if (_.isArray(data)) {
            resultArr = data;

          } else {
            resultArr = [];
            resultArr.push(data);
          }
          deferred.resolve(resultArr);

        })
        .catch(function (error) {
          deferred.reject(error);

        })

        return deferred.promise;

      },







    });



    return new PersonListService();

  }])

module.directive('personlist',["httpService", "PersonListService","$rootScope","contactsService",function(httpService, PersonListService, $rootScope, contactsService){
  return {
    restrict: 'AECM',
    templateUrl: 'src/modules/common/contacts-personlist-directive.html',
    repalce: true,
    scope:{
      'routeParams':"=routeParams"
    },
    link: function ($scope, element, attrs) {

        console.log($scope.routeParams);


        // $scope.PersonListService = PersonListService;

        $scope.PersonListManager = {};
        $scope.search_keyword_p = "";

        $scope.PersonListManager.addOnePerson = function (e, options) {


          var selectingList = contactsService.contactsManager.getSelectingList();
          var index;



          if ($scope.routeParams.type == "org") {
            index = _.findIndex(selectingList, {'userid': options.id});
          } else if ($scope.routeParams.type == "team") {
            index = _.findIndex(selectingList, {member_id: options.id});
          } else {
            index = _.findIndex(selectingList, {id: options.id});
          }

          if ($(e.target).hasClass("active")) {
            $(e.target).removeClass("active");
            if (index != -1){
               contactsService.contactsManager.removeOnePerson(index);
            };
          } else {
            // if (selectingList.length >= 9) return;
            $(e.target).addClass("active");
            if(index == -1) {
              var p = _.find($scope.personList, function (each) {

                var id_type = "id";

                if ($scope.routeParams.type == "org") {
                  id_type = "userid";
                } else if ($scope.routeParams.type == "team") {
                  id_type = "member_id";
                }

                return  each[id_type] == options.id

              });
              contactsService.contactsManager.addOnePersonByOther(p);
            };
          }

          // $rootScope.$broadcast("personListSelected", PersonListService.getSelectedList());


        }

        switch ($scope.routeParams.type) {
          case "follower":
            getFollowGroupById($scope.routeParams);
            break;
          case "team":
            getTeamGroupById($scope.routeParams);
            break;
          case "org":
            initScroll();
            getOrgGroupList($scope.routeParams);
            break;
          default:

        }



        //获取某个关注分组成员
        function getFollowGroupById(params) {
          PersonListService.getFollowGroupById(params)
          .then(function (data) {
            console.log(data);
            $scope.personList = data;
          })
          .catch(function (error) {
            console.log(error);
          })
        }

        //获取某个团队成员
        function getTeamGroupById(params) {
          PersonListService.getTeamGroupById(params)
          .then(function (data) {
            console.log(data);
            $scope.personList = data;
          })
          .catch(function (error) {
            console.log(error);
          })
        }

        //获取某个组织成员
        function getOrgGroupList(params) {

          $scope.personList = params.orgContactsList;

        }


        // 初始化分页
        function initScroll() {

          $scope.limit = 18;
          $scope.page = 1;
          $scope.loadingStep = 0; //0 表示可以加载 1 表示正在加载

          $(".contacts_body_detail_sub .c-p-container").scroll(function() {

            //保险一点控制 只有org下才有瀑布流滑动加载
            if ($scope.routeParams.type != "org") {
              return;
            }

            var viewH = $(this).height(); //可见高度
            var contentH = $(this).get(0).scrollHeight; //内容高度

            $scope.scrollTopPre = $scope.scrollTop;
            $scope.scrollTop = $(this).scrollTop(); //滚动高度

            if ($scope.scrollTopPre) {
              $scope.delta = $scope.scrollTop - $scope.scrollTopPre;

            }

            if ($scope.loadingStep == 0) {
              if (contentH - viewH - $scope.scrollTop <= 20 && $scope.delta > 0) {
                $scope.loadingStep = 1;
                //page + 1
                $scope.page++;
                scrollEndOrg();
              }
            }

          });
        }

        //分页加载组织人员列表
        function scrollEndOrg() {
          $scope.routeParams.limit = $scope.limit;
          $scope.routeParams.page = $scope.page;
          PersonListService.getOrgGroupList($scope.routeParams)
          .then(function (data) {
            console.log(data);
            $scope.loadingStep = 0;
            var array = $scope.personList || [];
            $scope.personList = array.concat(data);
          })
          .catch(function (error) {
            $scope.loadingStep = 0;
            //page -1
            $scope.page--;
            console.log("error");
            console.error(error);
          })
        }

        //本地搜索
        $scope.$watch("search_keyword_p",function(keyword,oldValue){
          if (!keyword) {
            return;
          }

          console.log(keyword);
          window.clearTimeout($scope.serachT);

          $scope.serachT = setTimeout(function () {
            $scope.personListSearch =  _.filter($scope.personList, function (each) {
                return each.name.match(keyword);
             });
          }, 300)



        })

      }
    }

}])
})
