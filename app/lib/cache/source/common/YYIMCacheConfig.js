var BusinessInterfaceConfig = {
	ADDRESS:'http://pc.api.esn.ren:6062',
	// ADDRESS:'https://pc-api.esn.ren',
	// ADDRESS:'https://pc-api.upesn.com',
	STATICADDRESS:'http://test.staticoss.upesn.com/',
	VCARDURL: '/user/info/'
};

var YYIMCacheBusinessConfig = {
	SPACETYPE: {
		NORMAL: 'normal',
		DEALER: 'dealer'
	},
	REVOCATIONMESSAGE: {
		DELAY: 2*60*1000 
	},
	GROUPTYPE: {
		TEAM: {
			flag: 'group',
			name: 'team'
		}, //团队群
		APP: {
			flag: 'app',
			name: 'app'
		},
		DEALER:{
			flag: 'jgroup',
			name: 'dealer'
		}
	},
	PUBACCOUNTTYPE: {
		PUBACCOUNT: {
			name: 'pubaccount',
			type: {
				app:{
					photo: 'static/images/ico-appnotify.png',
				},
				feed:{
					photo: '',
				},
				groupnew:{
					photo: 'static/images/ico-teamnotify.png',
				},
				system:{
					photo: '',
				},
				qz:{
					photo: 'static/images/ico-esnnotify.png',
				}
			}
		},
		MSGACCOUNT: {
			name: 'msgaccount'
		},
		APPACCOUNT: {
			name: 'appaccount'
		}
	}
};

var YYIMCacheConfig = {
	/**
	 * IM 系统通用配置 
	 * rongqb 20160412
	 */
	IMCHATVERSION: 'local_3.0.1',
	PRE_HISTORY_LENGTH:	10,
	PRE_SHOW_TIMEINTERVAL: 5*60*1000,
	LOCATION_SHOWPIC_SIZE: '320*200',
	CHAT_TYPE : {
		CHAT: 'chat',
		GROUP_CHAT: 'groupchat',
		PUB_ACCOUNT: 'pubaccount'
	},
	SEND_STATE:{
		NONE:'none',
		UNREADED:'unreaded',
		READED:'readed'
	},
	ROSTER_TYPE:{
		MYSELF:'myself',
		FRIEND:'friend',
		ASK:'ask',
		RECV:'recv',
		NONE:'none'
	},
	ROSTER_SUBSCRIPTION_TYPE:{
		BOTH:'both',
		NONE:'none'
	},
	PUBACCOUNT_TYPE:{
		SUBSCRIBED:{
			TYPE: 1,
			NAME: 'subscribed' //同意订阅
		},
		SUBSCRIBE:{
			TYPE: 1,
			NAME: 'subscribe' //订阅号
		},
		BROADCASE:{
			TYPE: 2,
			NAME: 'broadcase' //广播号
		}
	},
	MESSAGE_CONTENT_TYPE:{
		MIXED : 'mixed',
		SIMPLE : 'simple',
		TEXT : 2,
		FILE : 4,
		IMAGE : 8,
		SMALLVIDEO: 10,
		REVOCATION : 13,
		SYSTEM : 16,
		PUBLIC : 32,
		AUDO : 64,
		LOCATION : 128,
		SHARE : 256,
		WHITEBOARD : 1024,
		NETMEETING : 2048
	},
	DEFAULT_PHOTO:{
		DEFAULT:'',
		ROSTER: 'default_avatar.jpg',
		GROUP:'',
		GROUPMEMEBER:'',
		PUBACCOUNT:''
	},
	PRESENCE_SHOW:{
		CHAT : "chat",
		AWAY : "away",
		XA : "xa",
		DND : "dnd",
		UNAVAILABLE : "unavailable"
	},
	TERMINAL_TYPE:{
		WEB:'web',
		ANDROID:'android',
		IOS:'ios',
		PC:'pc'
	},
	MESSAGE_READ_TYPE:{
		READED:'readed',
		UNREADED:'unreaded',
		ALL:'all'
	},
	TRAMSPARENT_TYPE:{
		ATTACHMENTCONVERTED: 'attachmentConverted', //附件缩略图通知
		REVOKE: 'revoke',
		SETMUTE: 'setMute',
		CANCELMUTE: 'cancelMute',
		SETSTICK: 'setStick',
		CANCELSTICK: 'cancelStick'
	},
	RECENT_TYPE:{
		UNFOLDED: 'unfolded',
		FOLDED: 'folded'
	}
};
