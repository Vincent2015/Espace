
var _require = window.requirejs;

_require.config({
  paths: {
    'angular': '../lib/angular/angular',
    "ngOnce":'../lib/angular/bindonce',
    'jquery': '../lib/jquery/jquery-1.11.2.min',
    "YYIMSDK": "../lib/YYIMSDK/YYIMSDK",
    "YYIMCache":"../lib/cache/YYIMCache", //后续再引进
    "ESNUtil":"../lib/cache/ESNUtil", //后续再引进
    "mixture": "../lib/mixture/mixture",
    "angular-ui-router": "../lib/angular-ui-router/angular-ui-router",
    "expression": "../lib/expression/ExpressionData",
    "purl": "../lib/purl/purl",
    "angular-sanitize": "../lib/angular-sanitize/angular-sanitize",
    "videogular": "../lib/angular-videogular/videogular",
    "angular-cookies": "../lib/angular-cookies/angular-cookies",
    "ngDialog": "../lib/ng-dialog/ng-dialog",

    "getFirstLetter": "../lib/get-first-letter/getFirstLetter",
    "infinite-scroll": "../lib/infinite-scroll/infinite-scroll",
    "taffy": "../lib/taffy/taffy-min",
    "config": "./config/config", //app配置文件
    "ngStorage": "../lib/ng-storage/ngStorage.min",
    "angular-animate": "../lib/angular-animate/angular-animate.min",
    "jquery-qrcode": "../lib/jquery-qrcode/jquery.qrcode.min",
    "jquery-md5": "../lib/jquery-md5/jQuery.md5",
    "toaster": "../lib/toaster/toaster.min",
    "Underscore": "../lib/underscore/Underscore.min",
    "angularui-select": "../lib/angularui-select/select.min",
    "angular-image-cropper-ImageView": "../lib/angular-image-cropper/ImageView",
    "angular-image-cropper-module": "../lib/angular-image-cropper/module",
    "angular-image-cropper-directive": "../lib/angular-image-cropper/directives/directive",
    "jq-datetimepicker": "../lib/jquery-datetimepick/jquery.datetimepicker.full.min",
  },

  shim: {
    'ngDialog': {
      exports: "ngDialog",
      deps: ['angular']
    },
    'ngOnce':{
      deps: ['angular'],
      exports:'ngOnce'
    },
    'angular-ui-router': {
      deps: ['angular']
    },
    'angular-cookies': {
      deps: ['angular']
    },
    'videogular': {
      exports: "videogular",
      deps: ['angular']
    },
    'angular-sanitize': {
      deps: ['angular']
    },
    'infinite-scroll': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'toaster': {
      deps: ['angular']
    },
    'angularui-select': {
      deps: ['angular']
    },
    'angular-image-cropper-ImageView': {
      deps: ['angular']
    },
    'angular-image-cropper-module': {
      deps: ['angular']
    },
    'angular-image-cropper-directive': {
      deps: ['angular']
    },
    'angular': {
      deps: ['YYIMSDK','jquery']
    },
    'jquery-qrcode':{
      deps: ['jquery']
    },
    'jquery-md5':{
      deps: ['jquery']
    },
    'underscore':{
      export:"_"
    }
    // ,
    // 'toaster':{
    //   export:"toaster"
    // }

    // 'jq-datetimepicker': {
    //   deps: ['jquery']
    // }
  }
})


_require([
  "YYIMSDK",
  "angular",
  "ngDialog",
  "jquery",
   "ngOnce",
   "YYIMCache",
   'ESNUtil',
   "mixture",
  "angular-ui-router",
  "expression",
  "purl",
  "angular-sanitize",
  "angular-cookies",
  "getFirstLetter",
  "infinite-scroll",
  "taffy",
  "config",
  "ngStorage",
  "angular-animate",
  "jquery-qrcode",
  "jquery-md5",
  "toaster",
  'Underscore',
  'angularui-select',
  'angular-image-cropper-ImageView',
  'angular-image-cropper-module',
  'videogular',
  // 'angular-image-cropper-directive',
  // "jq-datetimepicker",
  './app',
  './NWAU',
  'library-custom'
], function() {
  //angular启动
  angular.bootstrap(document, ['app']);
  	window.location = '#/login';
});
