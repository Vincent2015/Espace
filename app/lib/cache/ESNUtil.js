function getSign(uri, strParams, type) {
	var $sn = "";
	if (!type) {
		var esn = window.localStorage.getItem("esn_user");
		var info = JSON.parse(esn);
		$sn = info.sn;
	}
	var $uri = uri;
	var $strParams = strParams;
	var $salt = 'BAN/+GGzUBtMW'; //固定字符串
	console.log($sn + $uri + $strParams + $salt);

	var $sign = $.md5($sn + $uri + $strParams + $salt);
	return $sign;
}

function getParams(url, params) {
	var strParams = '';
	var esn = window.localStorage.getItem("esn_user");
	if (esn) {
		var info = JSON.parse(esn);
		var timestamp = (new Date()).valueOf();
		$strParams = 'timestamp=' + timestamp + '&token=' + info.access_token + '&v=1.0';

		$sign = this.getSign(url, $strParams, false);
		if (params && url != "/upload") {
			params['timestamp'] = timestamp;
			params['token'] = info.access_token;
			if (!params.v) {
				params['v'] = '1.0';
			}
			var paramsString = '';
			var keys = Object.keys(params);
			keys.sort();
			keys.forEach(function(it, index) {
				if (index == keys.length - 1) {
					paramsString += it + '=' + params[it];
				} else {
					paramsString += it + '=' + params[it] + '&';
				}
			});
			//$strParams = 'timestamp='+ timestamp +'&token='+info.access_token;
			$sign = this.getSign(url, paramsString, false);
		}
		strParams = $strParams + '&sign=' + $sign;
	} else {
		var $strParams = 'timestamp=' + (new Date()).valueOf() + '&v=1.0';
		var $sign = this.getSign(url, $strParams, true);
		strParams = $strParams + '&sign=' + $sign;
	}
	return strParams;
}