define(['./module'], function(module) {
  module.controller("afficheController", ["$scope","$state","$stateParams","imService",'pushService', function($scope,$state,$stateParams,imService,pushService) {
    $scope.isShowDetailPanel = false;
    $scope.winInfo = imService.winInfo;
    $scope.curAffich = {};
    $scope.isShowReplyPanel = false;

    $scope.afficheList = [{title:"关于什么什么的标题",name:"人力资源部",msg:"1、公告入口在消息列表里<br/>2、点击公告，打开公告列表；<br/>3、公告列表包括标题、简介、查看详情入口",time:"2016-06-23"},{title:"标题题目",name:"人力资源部",msg:"asdasdasdasd",time:"2016-06-23"}];

    $scope.showReplyPanel = function(){
      $scope.isShowReplyPanel = true;
    }
    $scope.hideReplyPanel = function(){
      $scope.isShowReplyPanel = false;
    }
    $scope.showDetailPanel = function(item){
      $scope.isShowDetailPanel = true;
      item.commentList = [
        {}
      ];
      $scope.curAffich = item;
    }
    $scope.hideDetailPanel = function(item){
      $scope.isShowDetailPanel = false;
      $scope.isShowReplyPanel = false;
    }
  }])

})
