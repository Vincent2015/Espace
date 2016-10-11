/**
 * 配置文件
 */
var YYIMAngularConfig = {
	SPECTACLE:{
		'MESSAGE':{
			'RECENTLIST': true,
			'DIALOGTITLE': true,
			'DIALOGCONTENT': true
		},
		'DYNAMIC':{
			'RECENTLIST': false,
			'DIALOGTITLE': false,
			'DIALOGCONTENT': true
		},
		'SIDEBAR':{
			'RECENTLIST': false,
			'DIALOGTITLE': false,
			'DIALOGCONTENT': true
		}
	}
};


var YYIMAngularConstant = {
	MESSAGE_CONTENT_TYPE : {//消息内容类型
		MIXED : 1,
		TEXT : 2,
		FILE : 4,
		IMAGE : 8,
		SYSTEM : 16,
		PUBLIC: 32,
		AUDO : 64,
		LOCATION : 128,
		SHARE : 256
	},
	CHAT_TYPE : {
		CHAT: "chat",
		GROUP_CHAT: "groupchat",
		DEVICE: "device",
		PUB_ACCOUNT: "pubaccount",
		SHENPI:"shenpi",
		TIXING:"tixing"
	}
};

var WEBRESOURSE = {
	TEAMSETURL: 'http://123.103.9.204:91/group/lists/mylist/VISITID/1'
}
var httpHost = 'http://123.103.9.204:91';
 //var httpHost = 'http://pub.esn.ren';
// var httpHost = 'http://upesn.com';
var imgHost = 'http://test.staticoss.upesn.com/';

var webUrl = {
	vmailUrl :'/message/wmail/index/VISITID/',/*微邮*/
	feedUrl :'/space/home/detail/feedid/',/*回复动态*/
	teamUrl :'/group/index/index/gid/', /*团队*/
	redpacketUrl :'/redpacket/index/index/VISITID/',/*红包应用*/
	announceUrl :'/announce/index/announce/aid/',/*公告应用*/
	scheduleUrl :'/schedule/detail/index/sid/',/*日程应用*/
	taskUrl :'/task/task/index/tid/',/*任务应用*/
	spaceUrl :'/space/home/index/VISITID/',
	qzInfo:{
		host:"http://pc.api.esn.ren:6062"
	},
	yxim:{
		appId:"esntest",
		etpId: "upesn",
		address: 'im01.upesn.com',
      	wsport: 5222,
      	hbport: 7070,
      	servlet: 'https://im01.upesn.com/',
      	safeServlet: 'https://im01.upesn.com/'
	}

}
