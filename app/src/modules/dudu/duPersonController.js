define(['./module'], function(module) {

  module.factory('personService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService', function(CacheList, $http, $q, httpService, BasicCacheService) {

    // console.log("personService");
    // $scope.isBindDuDu = false;
    function personService() {
      this.init();
    }

    personService.prototype.init = function() {
      this.ticket = new BasicCacheService({
        url: "w"
      });
      //FIXME 先重写getCacheData 取得默认数据
      this.ticket.getCacheData = function() {
          return [1, 2, 3,4,5,6,7,8]
        }
        //FIXME 分页查询再处理
      this.phone = new PhoneListManager({
        url: "ww"
      });
      this.isBindDuDu = true;
    }

    personService.prototype.getTicket = function() {
      return this.ticket;
    }

    personService.prototype.getPhone = function() {
      return this.phone;
    }
    personService.prototype.getIsBindDuDu = function() {
      return this.isBindDuDu;
    }
    personService.prototype.setIsBindDuDu = function(param) {
       this.isBindDuDu = param;
      //  console.log(param);
    }
    //通话列表 继承于BasicCacheService 重写getCacheData
    var PhoneListManager = BasicCacheService.extend({
      getCacheData: function() {
        var arr = [{
          id: 1,
          time: "2015-08-08 9:00",
          name: "张三",
          time0: "40分钟"
        }];
        return arr;
      }
    })

    return new personService();

  }])

  module.controller("duPersonController", ["$scope", "PhoneHistoryManager", "ngDialog", "personService","httpService", function($scope, PhoneHistoryManager, ngDialog, personService,httpService) {

    //是否绑定嘟嘟业务
    $scope.isBindDuDu = personService.getIsBindDuDu();
    //通话纪录列表 分页查询 缓存第一页的数据
    $scope.phone_history = personService.getPhone().getCacheData();

    personService.getPhone().fetch()
      .then(function(data) {
        $scope.phone_history = data;
      })
      .catch(function(error) {
        // console.error(error);
      })



    //通话券数据
    $scope.tickets = personService.getTicket().getCacheData();

    personService.getTicket().fetch()
      .then(function(data) {
        $scope.tickets = data;
      })
      .catch(function(error) {
        // console.error(error);
      })

    //打开绑定手机dialog
    $scope.phoneBind = function(e) {
      //如果已经打开了右侧框 则阻止事件冒泡
      if ($(".dudu-right-dialog-w").length > 0) {
        e.stopPropagation();
        return;
      }
      // console.log(personService.getIsBindDuDu());
      ngDialog.open({
        template: 'src/modules/dudu/phonebind.html',
        controller: 'duduDialogController',
        className: 'dudu-right-dialog-w',
        showClose: false,
        scope:$scope,
        // controller:['$scope',function($scope){
        //      $scope.isBindDuDu=true;
        // }],
        overlay: false,
        data: {
          chatinfo: []
        }
      });
    }

    //打开充值dialog
    $scope.charge = function(e) {
      ngDialog.open({
        template: 'src/modules/dudu/charge.html',
        controller: 'duduDialogController',
        className: 'dudu-right-dialog-w',
        showClose: false,
        overlay: false,
        data: {
          chatinfo: []
        }
      });
    }


    // /version/:device/:online/:fromType


          // httpService.dataServiceQ('get', "/version/3/2/8")
          //   .then(function(data) {
          //     console.log(data);
          //   }.bind(this))
          //
          // .catch(function(error) {
          //   console.log(error);
          //
          // }.bind(this))


  }])


  module.controller("duduDialogController", ["$scope", "ngDialog", "personService",function($scope, ngDialog,personService) {
    $scope.validate = {
      phone : "",
      phoneResult : false,
      code : "",
      codeResult : false
    }
    $scope.bind_step = 1;

    //嘟嘟充值业务
    $scope.Charge = new Charge();

    //绑定手机号业务
    $scope.PhoneBind = new PhoneBind();



    //嘟嘟充值业务
    function Charge() {}

    Charge.prototype.charge = function() {
      alert("success");
      $scope.closeDiag();
    }

    Charge.prototype.updateVCode = function() {
      alert("换一张");
    }


    //绑定手机号业务
    function PhoneBind() {
      this.vcode_text = "重新发送";
      this.vcode_status = 0;
    }


    PhoneBind.prototype.next = function() {
      $scope.bind_step = 2;
    }

    PhoneBind.prototype.reSendCode = function() {
      if (this.vcode_status == 0) {
        var self = this;
        this.vcode_status = 1; // 正在发送状态
        this.vcode_text = "60 S";

        var num = 60;

        this.t = setInterval(function() {
          if (num == 0) {
            window.clearInterval(self.t);
            $scope.$apply(function() {
              self.vcode_status = 0;
              self.vcode_text = "重新发送"
            });
            return;
          };
          num--;
          $scope.$apply(function() {
            self.vcode_text = num + " S";
          });
        }, 1000)
      }

    }

    PhoneBind.prototype.phoneBindComplete = function(){
      $scope.closeDiag();
      personService.setIsBindDuDu(true);
      $scope.$parent.isBindDuDu = true;
    }
    //检测手机号码是否输入正确
    $scope.$watch('validate.phone', function(newVal, oldVal) {

        if (!!newVal) {
          var validate = validatemobile(newVal);
          $scope.validate.phoneResult = validate;
        }else{
          $scope.validate.phoneResult = false
        }
    }, true);
    //检测验证码是否输入正确
    $scope.$watch('validate.code', function(newVal, oldVal) {

        if (!!newVal) {
          if(newVal == '1234'){
            $scope.validate.codeResult = true;
          }
          else {
            $scope.validate.codeResult = false;
          }
        }else{
          $scope.validate.codeResult = false;
        }
    }, true);

    var validatemobile = function (mobile)
    {
        if(mobile.length==0)
        {
           return false;
        }
        if(mobile.length!=11)
        {
            return false;
        }
        var reg = /^(1[0-9]{10})$/;
        return reg.test(mobile);
   }
    //关闭右侧弹框
    $scope.closeDiag = function() {
      $(".esn-right-dialog").addClass("esn-right-dialog-out");
      setTimeout(function() {
          ngDialog.close();
        }, 420)
        // ngDialog.close();
    }
  }])
})
