define(['./module'], function(module) {

  module.factory('phoneService', ['CacheList', '$http', '$q', 'httpService', 'BasicCacheService', function(CacheList, $http, $q, httpService, BasicCacheService) {

    // console.log("come in phoneService");
    // $scope.isBindDuDu = false;
    function phoneService() {
      this.init();
    }

    phoneService.prototype.init = function() {
      this.ticket = new BasicCacheService({
        url: "w"
      });
      //FIXME 先重写getCacheData 取得默认数据
      this.ticket.getCacheData = function() {
          return [1, 2, 3, 4, 5, 6, 7, 8]
        }
        //FIXME 分页查询再处理
      this.phone = new PhoneListManager({
        url: "ww"
      });
      this.isBindDuDu = true;
    }

    phoneService.prototype.getTicket = function() {
      return this.ticket;
    }

    phoneService.prototype.getPhone = function() {
      return this.phone;
    }
    phoneService.prototype.getIsBindDuDu = function() {
      return this.isBindDuDu;
    }
    phoneService.prototype.setIsBindDuDu = function(param) {
        this.isBindDuDu = param;
        // console.log(param);
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

    return new phoneService();

  }])


  module.controller("phoneController", ['$scope', 'ngDialog', '$rootScope',function($scope, ngDialog, $rootScope) {

    // console.log("come in phoneController");

    // $scope.$on("getSelectedList", function (e,data) {
    //     console.log(data);
    // });

    //电话会议
    $scope.isActive = false;
    $scope.meeting_text = "发起会议";


    $scope.personMananger = {
      meeting_numbers: [{
        "id": 0,
        active: false
      }, {
        "id": 1,
        active: false
      }, {
        "id": 2,
        active: false
      }, {
        "id": 3,
        active: false
      }, {
        "id": 4,
        active: false
      }],
      add_person: function(model) {
        if (this.meeting_numbers.length > 9) {
          return;
        }
        this.meeting_numbers.push({});
        $scope.openContactsDialog();

      },
      remove_person: function(index) {

        this.meeting_numbers.splice(index, 1);

      }
    };

    $scope.hoverIn = function(index) {
      if ($scope.isActive) {
        $scope.personMananger.meeting_numbers[index]["active"] = true;
      } else {
        $scope.personMananger.meeting_numbers[index]["unactive"] = true;
      }

    };

    $scope.hoverOut = function(index) {
      if ($scope.isActive) {
        $scope.personMananger.meeting_numbers[index]["active"] = false;
      } else {
        $scope.personMananger.meeting_numbers[index]["unactive"] = false;
      }
    };

    $scope.test = function(index) {
      alert(index)

    }

    //打开选择联系人dialog
    $scope.openContactsDialog = function(e) {
      ngDialog.open({
        template: 'src/modules/common/contacts.html',
        controller: 'contactsController',
        className: 'dudu-right-dialog-w',
        showClose: false,
        overlay: false,
        data: {
          chatinfo: []
        }
      });
    }


  }])




})
