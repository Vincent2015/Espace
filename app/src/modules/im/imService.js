define(['./module'], function(module) {
  module.service('imService', ['$http',"httpService","$timeout", function($http,httpService,$timeout) {
       this.winInfo = {};

       var imService = {};
       imService.dataSouce = {};
       imService.initWinResultMapping={};
       function getEsnUser(){
            return JSON.parse(localStorage.getItem('esn_user'));
       }

       imService.getUserInfo = getEsnUser;

       function  InitIm(params) {
       	// body...
        var spaceId = getEsnUser().qz_id;
       	var url = '/im/iminit/'+spaceId;
       	httpService.getData(url,null,function(data) {
       	// 	console.log('初始化IM成功');
       	// 	console.log(data);
           if (data.code == 0){
             window.allUnMsgCount = data.data.allMsgCount;
       		   params.success(data.data.recentlyList);
          }else{
               toast(data.msg,1000);
           }

       	},function(error) {

       		params.error(error);
       	})
       }

       imService.InitIm = InitIm;

       function  InitWin(id,params) {
       	// body...
            var spaceId = getEsnUser().qz_id;
       	var url = '/im/initwin/'+spaceId+'/'+id;
       	httpService.getData(url,null,function(data) {
       	// 	console.log('打开聊天窗口');
       	// 	console.log(data);
           if (data.code == 0){
             params.success(data);
           }else{
               toast(data.msg,1000);
           }

       		// body...
       	},function(error) {
       		// body...
       		params.error(error);
       	})

       }

       imService.InitWin = InitWin;

       function updateRowStatusBySendTime(sendTime,rowStatus,$scopeId){
         var dataList = imService.dataSouce[$scopeId];
         if(dataList&&dataList.length>0){
           for(var i=dataList.length-1;i>=0;i--){
             if(dataList[i].row_time==sendTime){
               dataList[i].row_status = rowStatus;
               break;
             }
           }
         }
         return dataList;
       }

        function  SendMsg(msgContent,msgparam,params) {
       	// body...
          var $scopeId = params.$scopeId;
            var spaceId = getEsnUser().qz_id;
            var token = getEsnUser().access_token;
            var msg ={
                  fid:window.currentWin.sid,//窗口id
                  vc:window.currentWin.im_vc,//窗口校验块
                  v:msgContent,//消息内容
                  mtype:0
            };
       	var url = '/im/sendmsg/'+spaceId;
       	httpService.postData(url,msg,function(data) {
               	// 	console.log('----------------');
               	// 	console.log(data);
                  if(data.code!=0){
                    updateRowStatusBySendTime(msgparam.row_time,"0",$scopeId);
                  }else{
                    updateRowStatusBySendTime(msgparam.row_time,"1",$scopeId);
                  }
                  params.success(data);
       	},function(error) {
                  updateRowStatusBySendTime(msgparam.row_time,"0",$scopeId);
                  params.error(error);
       	})

       }

       imService.SendMsg = SendMsg;

       function  GetMsgList(params) {
            var spaceId = getEsnUser().qz_id;
            var token = getEsnUser().access_token;
            var ftype= window.currentWin.ftype;
            var fid= window.currentWin.fid;
            var endid = params.endid;
       	var url = '/im/getMsgList/'+spaceId+'/'+ftype+'/'+fid+'/30/0/'+endid;
       	httpService.getData(url,null,function(data) {
                      // console.log(data);
                  if (data.code == 0){
                    params.success(data.data.list.reverse());
                  }else{
                       toast(data.msg,1000);
                  }

       		// body...
       	},function(error) {
       		// body...
                  params.error(error);
       	})
       }

       imService.GetMsgList = GetMsgList;

       function upnoreadmsg(num){
        var spaceId = getEsnUser().qz_id;
        var url = '/im/upnoreadmsg/'+spaceId;
        var ftype= window.currentWin.ftype;
        var fid= window.currentWin.fid;
        var data = {
               // ids:'', 特定消息id列表
               fid:fid,
               ftype:ftype,
               appType:1
        };
        httpService.putData(url,data,function(data) {
          // console.log('设置消为已读');
           if (data.code == 0){
              // console.log(data);
              window.allUnMsgCount  = window.allUnMsgCount  - num;
           }else{
               toast(data.msg,1000);
           }

          // body...
        },function(error) {
          // body...

        })
       }
      imService.upnoreadmsg = upnoreadmsg;
       function  GetMsgDetail(spaceId,msgId){
       	// body...
       	// body...
       	var url = '/im/getMsg/1/126933?token=f9da1444c3da45ec2b12b0169006d69cd54c15a1';
       	httpService.getData(url,null,function(data) {
       	// 	console.log('设置消为已读');
       	// 	console.log(data);
       		return JSON.stringify(data);
       		// body...
       	},function(error) {
       		// body...
       	})
       }

       imService.GetMsgDetail = GetMsgDetail;

       imService.imListLoadMore=function(params){
           var data = [{id:"100",uid:"11",fid:"10001",ftype:"",qz_id:"",msg:"hellohellohellohellohellohellohellohellohellohello",mtype:0,sendtime:"",readtime:"",avatar:"http://ww1.sinaimg.cn/crop.3.45.1919.1919.1024/6b805731jw1em0hze051hj21hk1isn5k.jpg",mh:"JSON Hu"},
             {id:"100",uid:"11",fid:"1",ftype:"",qz_id:"",msg:"新增消息",mtype:0,sendtime:"",readtime:"",avatar:"src/style/images/dudu/image2.png",mh:"JSON Hu"},
             {id:"100",uid:"11",fid:"1",ftype:"",qz_id:"",msg:"http://pic.sc.chinaz.com/files/pic/pic9/201604/fpic536.jpg",mtype:1,sendtime:"",readtime:"",avatar:"src/style/images/dudu/image2.png",mh:"JSON Hu"},
             {id:"100",uid:"11",fid:"10001",ftype:"",qz_id:"",msg:"hello",mtype:0,sendtime:"",readtime:"",avatar:"http://ww1.sinaimg.cn/crop.3.45.1919.1919.1024/6b805731jw1em0hze051hj21hk1isn5k.jpg",mh:"JSON Hu"},
           ];
           if(params.success){
             //模拟http请求成功
             $timeout(function(){
               params.success(data);
             },300);
           }
         }

         function upLoadfile(file){
               // body...
               var file;
                var data = new FormData();
                data.append('file',file);
                var url="/upload";
                httpService.postData(
                         url,
                         data,
                         function(data) {
                                  // console.log('文件上传成功');
                                  // console.log(data);
                              },function(error) {

                              })


         }
         imService.upLoadfile = upLoadfile;
         function findImU(keyWord,params) {
           // body...
           var url ='/user/search';
            httpService.postData(url,{keyWord:keyWord},function(data) {
            // console.log('搜索信息');
            // console.log(data);
             if (data.code == 0){
               params.success(data.data);
             }else{
                 toast(data.msg,1000);
             }

            // body...
          },function(error) {
            // body...
            params.error(error);
          })

         }

       imService.findImU = findImU;
       return imService;
  }]);
});
