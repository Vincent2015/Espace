var ScriptUtil = (function() {
	return {
		'localstorage':(function(){
			var enable = false;
			var store = getLocalStorage();
			
			function getLocalStorage(){ 
				if(typeof localStorage == 'object'){
					enable = true;
					return localStorage;
				}else if(typeof globalStorage == 'object'){
					enable = true;
					return globalStorage[location.host];
				}else{
					throw new Error('LocalStorage not available.');
				}
			}
			
			
			function clear(){
				if(store){
					store.clear();
				}
			}
			
			function setItem(name,value){
				if(store){
					store.setItem(name,value);
				}
			}
			
			function getItem(name){
				if(store){
					return store.getItem(name);
				}
			}
			
			function removeItem(name){
				if(store){
					store.removeItem(name);
				}
			}
			
			return {
				enable: enable,
				getLocalStorage: getLocalStorage,
				setItem: setItem,
				getItem: getItem,
				removeItem: removeItem,
				clear: clear
			};
		})(),
		'event': {
			addHandler: function(element, event, handler) {
				if(element.addEventListener) {
					element.addEventListener(event, handler, false);
				} else if(element.attachEvent) {
					element.attachEvent("on" + event, handler);
				} else {
					element["on" + event] = handler;
				}
			},
			removeHandler: function(element, event, handler) {
				if(element.removeEventListener) {
					element.removeEventListener(event, handler, false);
				} else if(element.detachEvent) {
					element.detachEvent("on" + event, handler);
				} else {
					element["on" + event] = null;
				}
			}
		},
		'cookie': {
			'get': function(name) { //获取cookie
				if(name) {
					var str_cookies = document.cookie;
					var arr_cookies = str_cookies.split(';');
					var num_cookies = arr_cookies.length;
					for(var i = 0; i < num_cookies; i++) {
						var arr = arr_cookies[i].split("=");
						if(decodeURIComponent(arr[0].replace(/(^\s+)|(\s+$)/g, "")) == name){
							return decodeURIComponent(arr[1]);
						}
					}
				}
				return null;
			},
			'set': function(name, value, expires, path, domain, secure) { //设置cookie
				var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
				if(expires) {
					var expiration = new Date((new Date()).getTime() + expires);
					cookie += ';expires=' + expiration.toGMTString();
				}
				if(path) {
					cookie += ';path=' + path;
				}
				if(domain) {
					cookie += ';domain=' + domain;
				}
				if(secure) {
					cookie += ';secure';
				}
				document.cookie = cookie;
			},
			'delete': function(name, path, domain, secure) { //删除cookie
				ScriptUtil['cookie']['set'](name, '', new Date(0), path, domain, secure);
			}
		},
		'array': {
			'isArray': function(arr) {
				return ScriptUtil.isWhateType(arr, 'Array');
			},
			'comparisonAsc': function(propertyName) { //用于给对象升序排序
				return function(object1, object2) {
					return object1[propertyName] - object2[propertyName];
				};
			},
			'comparisonDesc': function(propertyName) { //用于给对象降序排序
				return function(object1, object2) {
					return object2[propertyName] - object1[propertyName];
				};
			}
		},
		'isWhateType': function(obj, type) {
			return(type === "Null" && obj === null) ||
				(type === "Undefined" && obj === void 0) ||
				(type === "Number" && isFinite(obj)) ||
				Object.prototype.toString.call(obj).slice(8, -1) === type;
		},
		'dom': {
			convertToArray: function(nodes) {
				var array = null;
				try {
					array = Array.prototype.slice.call(nodes, 0); //针对非 ie 浏览器
				} catch(e) {
					array = [];
					for(var i = 0, len = nodes.length; i < len; i++) {
						array.push(nodes[i]);
					}
				}
				return array;
			}
		}
	};
})();
