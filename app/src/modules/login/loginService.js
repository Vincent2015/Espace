define(['./module'], function(module) {
    module.service('loginService', ['$http', "httpService", function ($http, httpService) {
        var LoginService = function(){

        };
        LoginService.prototype = {
            constructor:LoginService,
            checkCode : function (params) {
                httpService.dataLoginService("get","/login/code/"+params.code,function (json) {
                    params.success(json);
                },function (fail) {});
            }

        }
        var loginService = new LoginService();
        return loginService;
    }]);
});
