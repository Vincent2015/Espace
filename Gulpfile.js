var NwBuilder = require('nw-builder');
var gulp = require('gulp');
var gutil = require('gulp-util');

var env = process.argv[3] || 'development';
//console.log(__dirname);
gulp.task('config',function(){
   if(env == 'development'){
    gulp.src('app/src/config/development/config.js')
       .pipe(gulp.dest('app/src/config'));
    }else if(env == 'production'){
        gulp.src('app/src/config/production/config.js')
       .pipe(gulp.dest('app/src/config'));
    }else{
         throw new Error('gulp param error,please use "gulp" or "gulp --env production"');
    }
});


gulp.task('nw', function () {
    var nw = new NwBuilder({
        version: '0.12.3',
        flavor:'Normal flavor',
        files: './app/**',
        macIcns: './app/esn.icns',
        macPlist: {mac_bundle_id: 'ESN_Chat'}, //  mac  应用的名称
        platforms: ['win32', 'win64', 'osx32', 'osx64','linux','linux64'], //  支持的应用平台
        appVersion:'1.0.3',
        appName:'企业空间',
        buildType:'versioned'
    });

    // Log stuff you want
    nw.on('log', function (msg) {
        gutil.log('nw-builder', msg);
    });

    // Build returns a promise, return it so the task isn't called in parallel
    return nw.build().catch(function (err) {
        gutil.log('nw-builder', err);
    });
});

gulp.task('default', ['config','nw']);
