define(['./module'], function(module) {
    module.service('followersService', ['$http', "httpService", function ($http, httpService) {
        var followersService = {};
        followersService.dataSouce = [];
        followersService.unfollowData = [];
        followersService.getFollowGroup = function (params) {
            httpService.dataService("get","/user/followGroup",function (data) {
                params.success(data.data);
            },function (data) {},false,false);
        }

        followersService.getFollowGroupById = function (params) {
            var url = "/user/followGroup/"+params.followId;
            httpService.dataService("get",url,function (data) {
                params.success(data);
            },function (data) {},false,false);
        }

        followersService.addFollowGroup = function (params) {
            var url = "/user/followGroup";
            httpService.postData(url,params.param,function (data) {
                params.success(data);
            },function (data) {
                params.error(data);
            });
        }
        followersService.delFollowGroup = function (params) {
            var url = "/user/followGroup/"+params.gid;
            httpService.dataService("DELETE",url,function (data) {
                params.success(data);
            },function (data) {
                params.error(data);
            });
        }
        followersService.delFollow = function (params) {
            var url = "/user/follow/"+params.gid;
            httpService.DeleteData(url,{member_id : params.memberId},function (data) {
                params.success(data);
            },function (data) {
                params.error(data);
            });
        }
        followersService.addFollowerMember = function (params) {
            var url = "/user/follow/"+params.gid;
            httpService.postData(url,params.member_Id,function (data) {
                params.success(data);
            },function (data) {
                params.error(data);
            });
            // httpService.dataService('post',url,function (data) {
            //     params.success(data);
            // },function (data) {
            //     params.error(data);
            // });
        }
        return followersService;
    }]);
});
