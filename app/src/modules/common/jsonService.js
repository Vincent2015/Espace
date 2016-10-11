define(['./module'], function(module) {
    module.service('jsonService', [function () {
        var jsonService = {};
        /**
         * 传入localStorage 的key 返回json对象
         * @param params 保存在localStorage的key
         * @returns 返回json对象,localStorage无找到时返回{undefined}
         */
        jsonService.getJson = function (params) {
            var json = window.localStorage.getItem(params);
            if (json){
                return JSON.parse(json);
            }
            return undefined;
        }

        jsonService.setJson = function (key, value) {
            window.localStorage.setItem(key, value);
        }

        return jsonService;
    }]);
});
