define(['../module'], function(module) {
  module.service('messageService', ['$http',"httpService", function($http,httpService){
    var MessageService = function(){

    };
    MessageService.prototype = {
        constructor:MessageService,
        getClientCode:function(param){
          httpService.dataService("get","/user/code",function (json) {
            // console.log(json);
              if(json && json.data){
                param.success(json.data);
              }
          },function (fail) {});
          // return "";
        },
        getCode:function(params){
          var url = 'https://im.upesn.com/sysadmin/rest/stellar/upesn/' + YYIMChat.getTenancy().ETP_KEY + '/' + YYIMChat.getTenancy().APP_KEY + '/' +  YYIMChat.getUserID() + '/' + currentSpaceId + '/token';
          var obj = {
            method: 'GET',
            url: url,
            timeout: 10000 //设置为10s后超时
          };
          $http(obj).success(function(data) {
            params.success(data.data.code);
          }).error(function(error) {
            params.error(error);
          });
        }
    };

    var messageService = new MessageService();
    return messageService;
  }]);
});
