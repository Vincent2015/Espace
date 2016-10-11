define(['../module'], function(module) {
module.controller('fileListController', ['$rootScope', 'ngDialog','$scope', "$state", function($rootScope,ngDialog, $scope, $state) {
  // console.log('comes in fileListController');
  // console.log($scope.ngDialogData);

  var FileMapping = {
    "PNG":"image@2x.png",
    "JPG":"image@2x.png",
    "JPEG":"image@2x.png",
    "GIF":"image@2x.png",
    "BMP":"image@2x.png",
    "PPT":"ppt@2x.png",
    "PPTX":"ppt@2x.png",
    "PDF":"pdf@2x.png",
    "DOCX":"word@2x.png",
    "DOC":"word@2x.png",
    "XLSX":"excel@2x.png",
    "XLS":"excel@2x.png",
    "ZIP":"zipfile@2x.png",
    "RAR":"zipfile@2x.png",
    "GZ":"zipfile@2x.png",
    "BZ2":"zipfile@2x.png",
    "7Z":"zipfile@2x.png",
    "CAB":"zipfile@2x.png",
    "ARJ":"zipfile@2x.png"
  };

  $scope.init = function () {
    $scope.limit = 12;
    $scope.index = 0;
    $scope.loadingStep = 0; //0 表示可以加载 1 表示正在加载

     $scope.chattype = "chat";
    if ($scope.ngDialogData.owner){
        $scope.chattype = "groupchat";
    }

    // $scope.loadFileList = loadFileList;

    initScroll();

    loadFileList({id: $scope.ngDialogData.id, start: $scope.index*$scope.limit, size: $scope.limit,chattype: $scope.chattype});
  }


  function loadFileList(param) {

    function success(result) {
      // console.log(result);
      $scope.loadingStep = 0;
      _.each(result.list, function (each) {
        each["img_filetype"] = FormatImgType(each.fileName);
        each["text_filesize"] = FormatSize(each.fileSize);
        each["format_filetime"] = FormatDate(each.ts);
      })
      $scope.fileList = $scope.fileList ? $scope.fileList.concat(result.list) : result.list;

    }

    function error() {
      $scope.loadingStep = 0;
      //index -1
      $scope.index--;
    }

    var arg = {
      id:param.id,
      fileType: "", //'file','image','microvideo' #57b8ff
      type:param.chattype ,//'chat','groupchat'
      start:param.start,
      size:param.size,
      success: success,
      error: error
    }

    YYIMChat.getSharedFiles(arg);
  }

  function FormatSize(fileSize){
    var arrUnit = ["B", "KB","MB", "G", "T", "P"];
    var powerIndex = Math.log2(fileSize) / 10;
    powerIndex = Math.floor(powerIndex);
    var len = arrUnit.length;
    powerIndex = powerIndex < len ? powerIndex : len - 1;
    var sizeFormatted = fileSize / Math.pow(2, powerIndex * 10);
    sizeFormatted = sizeFormatted.toFixed(2);
    return " " + sizeFormatted + " " + arrUnit[powerIndex];
  }

  function FormatImgType(fileName) {
    // var fileType = (fileName.split(".")[1]||"").toUpperCase();
    var index = fileName.lastIndexOf(".");
    var fileType = fileName.substr(index+1).toUpperCase();;
    return "./src/style/css/images/filetype/"+(FileMapping[fileType]||"other@2x.png");
  }

  function FormatDate(data) {
    var date = new Date(data);
    var dateFormat = {};
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hours = date.getHours();
    // if (hours < 8) {
    //   hours = hours + 24 - 8;
    // } else {
    //   hours = hours - 8;
    // }

    var minutes = date.getMinutes();
    var selectedData = year + "-";
    // var selectedData = "";
    if (month >= 10) {
      selectedData += month + "-";
    } else {
      selectedData += "0" + month + "-";
    }
    if (day >= 10) {
      selectedData += day + " ";
    } else {
      selectedData += "0" + day + " ";
    }
    if (hours >= 10) {
      selectedData += hours + ":";
    } else {
      selectedData += "0" + hours + ":";
    }
    if (minutes >= 10) {
      selectedData += minutes;
    } else {
      selectedData += "0" + minutes;
    }
    return selectedData;
  }



		$scope.imagefiletype = "/src/style/css/images/filetype/image@2x.png";


  function initScroll() {
    setTimeout(function () {
      $(".c-filelist-container").scroll(function() {

        var viewH = $(this).height(); //可见高度
        var contentH = $(this).get(0).scrollHeight; //内容高度

        $scope.scrollTopPre = $scope.scrollTop;
        $scope.scrollTop = $(this).scrollTop(); //滚动高度

        if ($scope.scrollTopPre) {
          $scope.delta = $scope.scrollTop - $scope.scrollTopPre;

        }

        if ($scope.loadingStep == 0) {
          if (contentH - viewH - $scope.scrollTop <= 20 && $scope.delta >0 ) {
            $scope.loadingStep = 1;
            $scope.index++;
            loadFileList({id: $scope.ngDialogData.id, start: $scope.index*$scope.limit, size: $scope.limit,chattype: $scope.chattype});
          }
        }

      });
    }, 700)

  }

$scope.closeDiag = function() {
    $(".esn-right-dialog").addClass("esn-right-dialog-out");
    setTimeout(function() {
        ngDialog.close();
      }, 420)
  }


}])
})
