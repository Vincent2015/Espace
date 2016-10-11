define(['./module'], function(module) {
  module.controller("personController", ["$scope", "PhoneHistoryManager", function($scope, PhoneHistoryManager) {




    //请求最新数据 失败则取本地数据
    PhoneHistoryManager.loadData()
      .then(function(data) {
         $scope.phone_history = data;
      })
      .catch(function(pre_data) {
        console.log("数据请求失败");
        $scope.phone_history = pre_data;
      })


  }])

})
