define(['./module'], function(module) {
    module.service('contactService', ['$http', "httpService", function ($http, httpService) {
        var ContactService = function(){

        };
        ContactService.prototype = {
            constructor:ContactService,
            getUserInfo : function (params) {
                httpService.dataService("get","/user/info/"+params.memberId,function (json) {
                    if(json){
                        params.success(json);
                    }
                },function (fail) {
                   (params.errors && typeof(params.errors) ==='function') && param.errors(fail);
                });
            },
            findContact:function(params) {
                var url ='/user/search';
                 httpService.postData(url,{keyWord:params.keyWord},function(data) {
                   console.log(data);
                  if (data.code == 0){
                      params.success(data.data);
                  }
               },function(error) {
                    params.error(error);
               })
            },
            getMoreMember:function(params) {
                var url ='/user/searchMember/'+params.page+"/"+params.count;
                 httpService.postData(url,{keyWord:params.keyWord},function(data) {
                  if (data.code == 0){
                      params.success(data.data);
                  }
               },function(error) {
                    params.error(error);
               })
            },
            getMoreGroup:function(params) {
                var url ='/group/search';
                 httpService.postData(url,{keyWord:params.keyWord},function(data) {
                  if (data.code == 0){
                      params.success(data.data);
                  }
               },function(error) {
                    params.error(error);
               })
            },
            follow:function(params){
                var url ='/user/follow/'+params.memberId+'/'+params.status;
                 httpService.getData(url,null,function(data) {
                //  console.log(data);
                  if (data.code == 0){
                      params.success(data.data);
                  }
               },function(error) {
                    params.error(error);
               })
            },
            getOwnInfo:function(params) {
              var url ='/user/ownInfo';
              httpService.dataService("get",url,function (json) {
                  if(json){
                    params.success(json);
                  }
              },function (fail) {
                 (params.errors && typeof(params.errors) ==='function') && param.errors(fail);
              });
            }
        }
        var contactService = new ContactService();
        return contactService;
    }]);
});
