define(['./module'], function(module) {
  module.service('pushService',['$http',"httpService","$timeout","imService", function($http,httpService,$timeout,imService) {
      var pushService = {};
      pushService.curScope=null;
      var socket,timoutSeed,heartbeatInterval;

      function clientHeartbeat(){

        sendcPing();
        heartbeatInterval = window.setInterval(function(){
          if(timoutSeed>=2){
            // connect();
            return;
          }
          timoutSeed+=1;
          sendcPing();
        },5000);
      }

      function connect(){
        if(heartbeatInterval){
          window.clearInterval(heartbeatInterval);
          heartbeatInterval = null;
        }

        timoutSeed = 0;
        // if(socket){
        //   socket.onclose = function () {};
        //   socket.close();
        //   socket = null;
        // }
        socket = new WebSocket('ws://123.103.9.204:7272');
        // socket = new WebSocket('ws://ws-pub.esn.ren:7272');
        // socket = new WebSocket('ws://imws.upesn.com:7272');
        // 打开Socket
        clientHeartbeat();
        socket.onopen = function(event) {
          // 发送一个初始化消息
          console.log("亲爱的服务器！我连上你啦！");
          loginPush();

          socket.onmessage = function(event) {
            // console.log('Client received a message',event.data);
            var data = JSON.parse(event.data);
            if ((data.type=="login")&&(data.success == 1)){

            }
            if (data.type=="ping"){
              sendPong();
            }else if(data.type=="msg"){
              RecieveMsg(data);
            }else if(data.type=="cping"){
              timoutSeed = 0;
            }
          };
          // 监听Socket的关闭
          socket.onclose = function(event) {
            window.setTimeout(function(){
              console.log("reconnect");
              connect();
            },100);
            // console.log('Client notified socket has closed',event);
          };

          socket.onerror = function(event){
            // console.log('error occur',event);
            socket.close()
          }
        };
      }

      connect();

      function  loginPush() {
        var user_id = imService.getUserInfo().muid;
        var token = imService.getUserInfo().access_token;
        var logincmd = {
          "type":"login",
          "u":user_id,
          "access_token":token,
          "repush":"0",
          "codever":"EsnLimbo"
        }
        socket.send(JSON.stringify(logincmd));
      }

      function  sendcPing() {
        try{
          var pingmsg ={"type":"cping"};
          socket.send(JSON.stringify(pingmsg));
        }catch(e){

        }
      }

      function  sendPong() {
        try {
          var pingmsg ={"type":"pong","vercode":"1.0"};
          socket.send(JSON.stringify(pingmsg));
        } catch (e) {

        } finally {

        }
      }


      function updateContactList(NewData,needUpdateMsgCount){
        var listData = imService.imControllerScope.contactList;
        if(listData&&listData.length>0){
          for(var i=0,j=listData.length;i<j;i++){
            var item = listData[i];
            var item_fid =item.id;
            if(item.obj_type=="0"){

            }else if(item.obj_type=="1"){
              item_fid = "t_"+item_fid;
            }else if(item.obj_type=="2"){
              item_fid = "tg_"+item_fid;
            }
            if(item_fid == NewData.fid){
              imService.imControllerScope.$apply(function(){
                if(needUpdateMsgCount){
                  item.newMsgCount = (item.newMsgCount||0)+1;
                }
                item.msg = NewData.msg;
              });
            }
          }
        }else{
          //增加一条
        }
        // imService.imControllerScope.$apply(function(){
        //   imService.imControllerScope.contactList = listData;
        // });
      }

      function RecieveMsg(data) {
        var dataList =imService.dataSouce[data.u]||[];
        //todo 完善字段。。。。
        var ftype = 0;
        var u_array = data.u.split("_");
        if(u_array.length==2){
          if(u_array[1]=="g"){
            ftype=1;
          }else if(u_array[1]=="tg"){
            ftype=2;
          }
        }
        var NewData ={
          fid:data.u,
          ftype:ftype,
          qz_id:data.qzid,
          msg:data.c,
          mtype:data.mt,
          uid:data.qzid,
          sendtime:data.st,//
          readtime:"",
          avatar:"",
          name:data.oname
        }
        try{
          if(dataList==0){
            NewData.formatsendtime = pushService.curScope.formartImTime(parseInt(data.st));
          }else{
            var lastTime = parseInt(dataList[dataList.length-1].sendtime);
            var now = (new Date()).valueOf();
            var diff_min = Math.abs(lastTime-now)/60;
            if(diff_min>4){
               NewData.formatsendtime = pushService.curScope.formartImTime(parseInt(data.st));
            }else{
                NewData.formatsendtime = "";
            }
          }
        }catch(e){
          NewData.formatsendtime = "";
        }

        dataList.push(NewData);
        imService.dataSouce[data.u] = dataList;

        if(data.u == pushService.curScope.id){
          //如果当前推送的消息窗口打开了 通知更新UI
          pushService.curScope.$apply(function(){
            pushService.curScope.list = imService.dataSouce[data.u];
            pushService.curScope.listScrollToBottom();
          });
        }
        updateContactList(NewData,(data.u != pushService.curScope.id));
      }

      function SendMsgWithSocket(msg) {
        alert(msg);

      }
      return pushService;
  }])
});
