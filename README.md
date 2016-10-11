对现有的WEB和移动端开发PC客户端。主要包含项消息，语音会议，邮件等。整个技术栈是基于NW,采用anguar+requirejs构建。

 **开发** 
使用node 启动web-server.js

开启了代理功能，解决调试的跨域问题


 **运行** 

1,首先进入upesn目录

   npm i
   
   或者
   
   cnpm i

2,进入app 目录，执行

 gulp //测试版本
 
 gulp --env production //正式版本
 
 
执行gulp时，如果当前的cache目录为空，会执行下载node-webkit的版本。具体的版本和构建配置见

gulpfile.js文件

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

4，构建成功后，会在build目录生成打包后的可执行程序
