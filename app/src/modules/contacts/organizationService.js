define(['./module'], function(module) {
    module.service('organizationService', ['$http', "httpService", function ($http, httpService) {
        var OrganizationService = function(){

        };
        OrganizationService.prototype = {
            constructor:OrganizationService,
            // 获取组织结构
            getDeptList : function (params) {
                var _this = this;
                httpService.dataService("get","/dept/"+params.parentId,function (json) {
                    if(json && json.data){
                      //  if(params.parentId === 0){//缓存第一级
                      //    _this.deptlist = json.data;
                      //  }
                        params.success(json.data);
                    }
                },function (fail) {});
            },
            // 获取用户列表
            getDeptMemberList:function(params){
                var _this = this;
                httpService.dataService("get","/user/dept/"+params.deptId+"/"+params.page+"/"+params.count,function (json) {
                    if(json && json.data){
                        params.success(json.data);
                         for (var k=0;k<json.data.length;k++){
                           json.data[k].avatar += '.thumb.jpg';
                         }
                        if(params.page === 1){
                           _this.deptMemberList = json.data;//缓存第一页
                          //  console.info(json.data);
                        }
                    } else {
                      params.fail(json);
                    }
                },function (fail) {
                    (params.fail && typeof(params.fail) ==='function') && params.fail(fail);
                });
            },
            // 获取组织管理员
            getDeptAdmin:function(params){
                var _this = this;
                httpService.dataService("get","/dept/admin/"+params.deptId,function (json) {
                    if(json && json.data){
                      var list;
                      if (_.isArray(json.data)) {
                        list = json.data;
                      } else {
                        list = [];
                        list.push(json.data);
                      }
                        if(params.deptId ===0){
                          _this.deptadmin = list;
                        }
                        params.success(list);
                    }
                },function (fail) {
                    (params.fail && typeof(params.fail) ==='function') && params.fail(fail);
                });
            }

        }
        var organizationService = new OrganizationService();
        return organizationService;
    }]);
});
