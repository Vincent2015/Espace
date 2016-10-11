define(['../module'], function(module) {
  module.service('yimService', ['$http',"httpService","$timeout", function($http,httpService,$timeout){

       var yimService = {};

       function inityIM(data){
   			var account = 'yangjz0';
				var pass = '123456';
				account = data.account;
				pass = data.pass;
				var param = {
		        "username":account,
		        "clientId":"5911a723a183df6d6da4773bfac15de3",
		        "clientSecret":"478EE4EFCEF1FB75C29972A18CBB63EF"
		        };

         		jQuery.ajax({


							//url:'http://im.yyuap.com/sysadmin/rest/demo/token?username='+account+'.udn.yonyou&password=' + pass + '&app=udn&etp=yonyou',
							url:'http://im.yyuap.com/sysadmin/rest/yyui1/yonspace/token',
							type:'post',
							data: JSON.stringify(param),
							beforeSend:function(xhr){
								 xhr.setRequestHeader("Content-Type", "application/json");
							},
							// ContentType:"application/json",
							success:function(data){
								//登陆
								YYIMChat.initSDK("yonspace", "yyui1");
								YYIMChat.login(account+'.udn.yonyou', data.token);
							},
							error:function(){
								islogining = false;

							}
						});
       }

       yimService.inityIM = inityIM;
       //yimService.inityIM();
       function loginyxIM(data){
       	var account = data.account;
        var pass = data.pass;
       	var url = '/im/getUserToken';
       	httpService.getData(url,null,function(data) {
       		  if (data.code == 0){
              YYIMChat.initSDK(webUrl.yxim.appId, webUrl.yxim.etpId,{
              // YYIMChat.initSDK("esn", "upesn",{
      				address: webUrl.yxim.address,
      				wsport: webUrl.yxim.wsport,
      				hbport: webUrl.yxim.hbport,
      				servlet: webUrl.yxim.servlet,
      				safeServlet: webUrl.yxim.safeServlet
      			},false);
				      YYIMChat.login(account, data.data.token);
       		  }else{


       		  }

       		// body...
       	},function(error) {
       		// body...
       	})

       }
        yimService.loginyxIM = loginyxIM;

        function getUserinfo(memberid,params){

         var url = '/user/info/'+memberid;
       	 httpService.getData(url,null,function(data) {
       		  if (data.code == 0){
                //  console.log(data);
                 params.success(data.data.name);
       		  }else{

       		  }

       		// body...
       	},function(error) {
       		// body...
       		params.error(error);
       	})
        }
       yimService.getUserinfo =getUserinfo;
       return yimService;
  }]);
});
