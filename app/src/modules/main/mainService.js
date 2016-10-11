define(['./module'], function(module) {
    module.service('mainService', ['$http', "httpService", function ($http, httpService) {
        var MainService = function(){

        };
        MainService.prototype = {
            constructor:MainService,
            logout : function (params) {
                httpService.dataService("get","/user/logout",function (json) {
                    params.success(json);
                },function (fail) {
                });
            }

        }
        var mainService = new MainService();
        return mainService;
    }]);
});
