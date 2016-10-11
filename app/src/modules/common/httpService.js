define(['./module'], function(module) {
  module.service('httpService', ['$http',"$q", function($http, $q) {

    /*网络服务地址配置*/
    var httpService = {
      'Ip': '',
      'Port': '',
      'serverUrl': ""
    };

    this.getData = function(url, param, sucFun, failFun) {
       var host = this.getHost();
         var strParams = this.getParams(url);
      var obj = {
        method: 'GET',
        data: param,
        url: host+url+'?'+strParams,
        timeout: 25000 //设置为10s后超时
      };
      // console.log(obj);
      $http(obj).success(function(data) {
        sucFun(data);
      }).error(function(error) {
        failFun(error);
      });
    }
    this.DeleteData = function(url, param, sucFun, failFun) {
      var host = this.getHost();
      var strParams = this.getParams(url,param);
      var obj = {
        type: 'DELETE',
        // dataType: "json",
        data: param,
        url: host+url+'?'+strParams,
        timeout: 25000 //设置为10s后超时
      };
      // console.log(obj);
      $.ajax(obj).success(function(data) {
        sucFun(data);
      }).error(function(error) {
        failFun(error);
      });
    }

    this.postData = function(url, param, sucFun, failFun) {
      var host = this.getHost();
      var strParams = this.getParams(url,param);
      $.ajax({
        type: 'POST',
        url: host+url+'?'+strParams,
        data: param,
        success: function(data) {
          console.log(data);
          var json = data;
          (sucFun && typeof(sucFun) === 'function') && sucFun(json);
        },
        error: function(data) {
          // console.log(data);
          (failFun && typeof(failFun) === 'function') && failFun(data);
        }
      });
    }

    this.putData = function(url, param, sucFun, failFun) {
      var host = this.getHost();
      var strParams = this.getParams(url,param);
      var obj = {
        type: 'PUT',
        // dataType: "json",
        data: param,
        url: host+url+'?'+strParams,
        timeout: 25000 //设置为10s后超时
      };
      // console.log(obj);
      $.ajax(obj).success(function(data) {
        sucFun(data);
      }).error(function(error) {
        failFun(error);
      });
    }

    this.dataService = function(type, url, suc, fail,params,async) {
      var host = this.getHost();
      var strParams = this.getParams(url);
      var isasync = async?false:true;
      $.ajax({
        type: type,
        url: host+url+'?'+strParams,
        async:isasync,
        success: function(data) {
          // console.log(data);
          var json = data;
          (suc && typeof(suc) === 'function') && suc(json);
        },
        error: function(data) {
          // console.log(data);
          (fail && typeof(fail) === 'function') && suc(data);
        }
        // ,
        // timeout: 15000
      });
    };
    this.dataLoginService = function(type, url, suc, fail) {

      var host = this.getHost();
      var strParams = this.getLoginParams(url);
      $.ajax({
        type: type,
        url: host+url+'?'+strParams,

        success: function(data) {
          // console.log(data);
          var json = data;
          (suc && typeof(suc) === 'function') && suc(json);
        },
        error: function(data) {
          // console.log(data);
          (fail && typeof(fail) === 'function') && suc(data);
        }
        // ,
        // timeout: 15000
      });
    };

    this.postLoginService = function(type, url, params, suc, fail) {

      var host = this.getHost();
      var strParams = this.getParams(url,params,true);
      $.ajax({
        type: type,
        url: host+url+'?'+strParams,
        data: params,
        success: function(data) {
          // console.log(data);
          var json = data;
          (suc && typeof(suc) === 'function') && suc(json);
        },
        error: function(data) {
          // console.log(data);
          (fail && typeof(fail) === 'function') && suc(data);
        }
        // ,
        // timeout: 15000
      });
    };
    this.dataServiceQ = function(type, url) {

      var host = this.getHost();

      var strParams = this.getParams(url);

      var deferred = $q.defer();

      var obj = {
        method: type,
        url: host+url+'?'+strParams,
        timeout: 2000 //设置为10s后超时
      };

      $http(obj)
        .success(function(data) {
          deferred.resolve(data);
        }.bind(this))
        .error(function(error) {
          deferred.reject(error);
        }.bind(this));

      return deferred.promise;
    };
    this.getParams=function(url,params,type) {
      var strParams = '';
      if (type) {
        var timestamp = (new Date()).valueOf();
        $strParams = 'timestamp='+ timestamp +'&v=1.0.1';

        $sign = this.getSign(url,$strParams,true);
        if (params && url != "/upload") {
          params['timestamp'] = timestamp;
          if (!params.v){
            params['v'] = '1.0';
          }
          var paramsString='';
          var keys = Object.keys(params);
          keys.sort();
          keys.forEach(function(it,index){
            if (index == keys.length - 1) {
              paramsString+=it+'='+params[it];
            } else {
              paramsString += it + '=' + params[it]+'&';
            }
          });
         //$strParams = 'timestamp='+ timestamp +'&token='+info.access_token;
          $sign = this.getSign(url,paramsString,true);
        }
        strParams = $strParams+'&sign='+$sign;
      } else {
        var esn = window.localStorage.getItem("esn_user");
        if (esn){
          var info = JSON.parse(esn);
          var timestamp = (new Date()).valueOf();
          $strParams = 'timestamp='+ timestamp +'&token='+info.access_token+'&v=1.0.1';

          $sign = this.getSign(url,$strParams,false);
          if (params && url != "/upload") {
            params['timestamp'] = timestamp;
            params['token'] = info.access_token;
            if (!params.v){
              params['v'] = '1.0';
            }
            var paramsString='';
            var keys = Object.keys(params);
            keys.sort();
            keys.forEach(function(it,index){
              if (index == keys.length - 1) {
                paramsString+=it+'='+params[it];
              } else {
                paramsString += it + '=' + params[it]+'&';
              }
            });
           //$strParams = 'timestamp='+ timestamp +'&token='+info.access_token;
            $sign = this.getSign(url,paramsString,false);
          }
          strParams = $strParams+'&sign='+$sign;
        } else {
          var  $strParams = 'timestamp='+(new Date()).valueOf()+'&v=1.0.1';
          var $sign = this.getSign(url,$strParams,true);
          strParams = $strParams+'&sign='+$sign;
        }
      }
      return strParams;
    }
    this.getLoginParams=function(url) {
      //登录接口增加随机码
      var rcode = Math.floor(Math.random()*1000000+100000);
      var $strParams = 'rcode='+rcode+'&timestamp='+(new Date()).valueOf()+'&v=1.0.1';
      var $sign = this.getSign(url,$strParams,true);
      var strParams = $strParams+'&sign='+$sign;
      return strParams;
    }
    this.getSign = function (uri,strParams,type) {
      var $sn = "";
      if(!type){
        var esn = window.localStorage.getItem("esn_user");
        var info = JSON.parse(esn);
        $sn = info.sn;
      }
      var $uri = uri;
      var $strParams = strParams;
      var $salt = 'BAN/+GGzUBtMW';//固定字符串
      // console.log($sn+$uri+$strParams+$salt);

      var $sign = $.md5($sn+$uri+$strParams+$salt);
      return $sign;
    }
    this.getQr = function (url) {
      var host = this.getHost();
      var strParams = this.getLoginParams(url);
      // console.log(host+url+'?'+strParams)
      return host+url+'?'+strParams;
    }

    this.getHost = function () {
      // return require.version ? "" : "https://pc-api.upesn.com";
        // return require.version ? "" : "https://pc-api.esn.ren";
        // return require.version ? "" : "http://pc.api.esn.ren:6062";
         return require.version ? "" :webUrl.qzInfo.host ;
    }

  }]);
});
