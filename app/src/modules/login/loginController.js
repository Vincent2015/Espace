define(['./module',"jquery",''], function(module,$) {
  module.controller("loginController", ["$scope","httpService","$timeout","loginService","$state","yimService","ngDialog","audioPlayService", function($scope,httpService,$timeout,loginService,$state,yimService,ngDialog,audioPlayService) {

    var storage = window.localStorage;
    //检测版本更新 如果已经自动登录 则在里面进行检查版本更新
    // if (NWModule && storage.getItem("esn_login") != "true") {
    //  versionManager.checkedUpdate(function (data) {
    //    ngDialog.open({
    //      template: 'src/modules/main/sysUpdate.html',
    //      showClose:false,
    //      overlay:true,
    //      disableAnimation:true,
    //      scope:$scope,
    //      data:data,
    //      controller: ['$scope',  function($scope) {
    //        $scope.update_text = "下载";
    //        $scope.update = function () {

    //          $scope.update_text = "下载中...";
    //          $scope.isLoding = true;

    //          $scope.update_style = "background: #7fc9ff;width:160px;";
    //          $scope.update_text = "下载中...";
    //          versionManager.update(function (data) {
    //          }, function (error) {
    //           //  console.log(error);
    //          });
    //        }
    //      }]

    //    });

    //  }, function (error) {
    //   //  console.log(error);
    //  });
    // }
    // add by liucyu 2016-06-15 用户鼠标移入关闭按钮出现图标
       var LoginModule = (function(){
             var Login = function(){
               if (storage.getItem("esn_login_name") == null) {
                 storage.setItem("esn_login_name","");
               }
               this.username = storage.getItem("esn_login_name");
               this.password = '';
               this.savepwd = true;
               this.passwordType = 'password';
               this.showDelUserNameIcon = false
               this.init();
             };
             Login.prototype = {
               constructor:Login,
               init:function(){
                 var _this = this;
                 this.loadNw();
                 storage.removeItem("esn_qrcode");//初始化页面的时候从缓存里面移除二维码
                 if(storage.getItem("esn_login") == "true"){
                     _this.savepwd = true;
                     _this.username = storage.getItem("esn_login_name");
                     _this.password = storage.getItem("esn_login_pwd");
                     //add by liucyu 2016-06-15
                     _this.login(function(response){
                       //response {code: 100010008, level: "2", msg: "用户名或密码错误"}
                       if(response && response.code == 100010008){
                             singleConfirm.getInstance({
                                 confirm:function(){
                                   _this.password = '';//重置密码
                                   stoploading();
                                 }
                             });
                             return false;
                       }else{
                           return true;
                       }
                     });
                 } else {
                     _this.savepwd = false;
                 }
               },
               loadNw:function(){
                 if (typeof require != "undefined") {
                     try {
                       if (!!require('nw.gui')) {
                         this.gui = require('nw.gui');
                       }
                     }
                     catch (err){}

                 }
               },
               goto:function(url){
                 this.gui.Shell.openExternal(url);
               },
               login: function(){//登录函数

     						audioPlayService.play();
                   var _this = this;
                   _this.uri = '/login';
                   if(!this.username){
                     toast('请填写手机号/邮箱',1000);
                     return;
                   }
                   if(!this.password){
                     toast('请填写密码',1000);
                     return;
                   }
                   showloading(10000,false);

                   httpService.postLoginService('post',_this.uri,{user_name:this.username,password:this.password,client_id:'pc',secret:'8d65994548abd032617f2219c737fda3'},_this.loginsuc.bind(_this),_this.loginfail.bind(_this));
               },
               loginsuc: function (response,flag) {//登录成功回调函数
                   var _this = this;
                   if (response.code == 0) {
                       var esn = response.data;
                       if (esn.avatar_middle.indexOf("default_avatar.middle.jpg")>-1||esn.avatar_middle.indexOf("default_avatar.jpg")>-1){
                         esn.avatar_middle = "";
                       }
                       /*进入上一次进入的空间，不进入后台默认空间*/
                       storage.setItem("esn_user", JSON.stringify(esn));
                       storage.setItem("esn_login",_this.savepwd);
                       storage.setItem("esn_login_name",_this.username);
                       if(_this.savepwd){//如果选中
                           storage.setItem("esn_login_pwd",_this.password);
                       }
                       window.currentSpaceId = response.data.qz_id.toString();
                       /*进入上一次进入的空间*/
                      // window.currentSpaceId = JSON.parse(storage.getItem("esn_user")).qz_id;
                       var data ={
                          'account':response.data.muid,
                          'pass':_this.password
                        }
                        //yimService.inityIM(data);
                        yimService.loginyxIM(data);
                        YYIMCacheSpaceManager.setBaseUrl(httpService.getHost(),imgHost);
                       window.setTimeout(function () {
                           stoploading();
                          //  window.location = '#main/imhome';
                          $state.go('main.imhomeplus', { 'spectacle': 'MESSAGE' });

                       },1500);
                   } else {
                       if(!flag){
                         stoploading();
                         storage.setItem("esn_login",false);
                         toast(response.msg);
                         return;
                       }
                   }
               },
               loginfail: function (data) {//登录失败回调函数
                   toast(data.statusText);
                   stoploading();
                   return;
                },
                loadqrcode: function(flush){//下载二维码
                    // var $uri = '/login/code';
                    // var $strParams ='timestamp='+(new Date).valueOf()+'&v=1.0';
                    // var $salt = 'BAN/+GGzUBtMW';//固定字符串
                    var _this = this;
                    httpService.dataLoginService("get","/login/code", function (resp) {
                        var tmpCode = resp.data.tmpCode;
                        // var $uriQr = '/login/code';
                        // var $strParamsQr ='timestamp='+(new Date).valueOf()+'&v=1.0';
                        // var $saltQr = 'BAN/+GGzUBtMW';//固定字符串
                        // var $signQr = md5.createHash($uriQr+$strParamsQr+$saltQr);
                        var respText = httpService.getQr("/login/qrcode/"+tmpCode);
                        $('#esn-qrcode').empty();
                        var qrcodeimg = '<img style="width: 192px; height: 192px;" src="'+respText+'"/>';
                        _this.putQrcodetoStorage(qrcodeimg,flush);

                        //每隔五秒刷新一次
                        var checkCodeInterval = window.setInterval(
                              function() {
                                  loginService.checkCode({
                                      code:tmpCode,
                                      success:function(json){
                                        if (json.code == 0) {
                                          window.clearInterval(checkCodeInterval);
                                          _this.loginsuc(json,true);
                                        }
                                      }
                                  })
                        },5000);
                    },function (err) {});
                },
                putQrcodetoStorage:function(qrcode,flush){
                    //add by liucyu 2016-06-16 二维码相关数据结构，放置在缓存中
                    var esn_qrcode = storage.getItem("esn_qrcode")
                    $(".esn-qrcode-mask").remove();
                    // flush = false || flush;
                    if(!esn_qrcode || (false || flush)){//如果不存在，或者点击了刷新按钮则创建并且备份到缓存
                        esn_qrcode = {
                            code:qrcode,
                            expire:180000,//过期时间 3分钟
                            createTime: +new Date()
                        }
                        storage.setItem("esn_qrcode", JSON.stringify(esn_qrcode));
                        $('#esn-qrcode').html(esn_qrcode.code);
                    }else{//如果存在，则检验时间是否过期
                        esn_qrcode = JSON.parse(esn_qrcode);
                        var expire = esn_qrcode.expire;
                        var createTime = esn_qrcode.createTime;
                        $('#esn-qrcode').html(esn_qrcode.code);
                        if(+new Date() - createTime > expire){//如果二维码过期,弹出遮蔽层，提示刷新二维码，但是旧的二维码依旧显示
                            $('#esn-qrcode').append('<div class="esn-qrcode-mask">长时间未登录，二维码已失效。点击下面刷新按钮刷新</div>');
                        }
                    }
                },
                //刷新二维码
                flushqrcode:function(){
                   this.loadqrcode(true);
                },
                lookPwd:function(event,id) {
                  var _this = this;
                  if(_this.passwordType === 'password'){
                     _this.passwordType ='text';
                  }else if(_this.passwordType === 'text'){
                     _this.passwordType ='password';
                  }
                },
                delUsername:function(event,id) {
                    this.username="";
                    this.showDelUserNameIcon = false;
                }
             };
             var login = new Login();
             return login;
       })();


    $scope.LoginModule = LoginModule;
    // login();
    //默认自动登录代码段



    //监控是否显示删除用户名ICON
    $scope.$watch('LoginModule.username', function(newVal, oldVal) {
        if (!!newVal) {
            LoginModule.showDelUserNameIcon = false
        }else{
            LoginModule.showDelUserNameIcon = true
        }
    }, true);

    window.location = '#login';

    //FIXME 不规范，可以单独抽取出来写成一个标签
    $scope.onTab =  function (event) {
        if(!$(event.target).hasClass('active')) {
            $('.esn-tab-btn-lable').removeClass('active');
            $(event.target).addClass('active');
            $(".esn-login-box-account").toggle();
            $(".esn-qrcode-mask").remove();
            if ($(".esn-login-box-Qr").css("display") == "none"){
                $(".esn-login-box-Qr").css({"display":"flex","flex-direction": "column"});
            }else{
                $(".esn-login-box-Qr").css("display","none");
            }
           if ($(".esn-login-box-Qr").css("display") == "flex"){
                LoginModule.loadqrcode();
            }
        }
  }
  }])

})
