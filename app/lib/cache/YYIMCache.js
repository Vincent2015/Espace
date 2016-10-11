var YYIMCacheSpaceManager = (function() {
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

function YYIMCacheList(){
	this.list = {};
}

YYIMCacheList.prototype.set = function(key,val){
	if(key && val){
		this.list[key] = val;
	}
};

YYIMCacheList.prototype.get = function(key){
	if(key){
		return this.list[key];
	}
	return this.list;
};

YYIMCacheList.prototype.remove = function(key){
	if(key){
		delete this.list[key];
	}
};

YYIMCacheList.prototype.update = function(key,val){
	this.set.apply(this,arguments);
};

YYIMCacheList.prototype.clear = function(){
	this.list = {};
};

YYIMCacheList.prototype.forEach = function(fun){
	if(YYIMUtil['isWhateType'](fun, 'Function')){
		var index = 0;
		for(var x in this.list){
			if(!!this.list[x].id){
				fun(index++,this.list[x],this.list);
			}
		}
	}
};

function YYIMCacheGroup(arg){
	this.members = [];
	this.list = {};
	this.loadedMembers = false;
	this.build(arg);
}

YYIMCacheGroup.prototype = new YYIMCacheList();

YYIMCacheGroup.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || this.name;
	this.numberOfMembers = arg.numberOfMembers || this.numberOfMembers;
	this.superLarge = arg.superLarge || this.superLarge;
	this.collected = (YYIMUtil['isWhateType'](arg.collected, 'Boolean') || YYIMUtil['isWhateType'](arg.collected, 'Number'))? !!arg.collected: !!this.collected;
	this.creater = arg.creater || this.creater;
	this.photo = arg.photo || this.photo;
	this.loadedInfo = YYIMUtil['isWhateType'](arg.loadedInfo, 'Boolean')? arg.loadedInfo: !!this.loadedInfo;;
	this.loadedMembers= YYIMUtil['isWhateType'](arg.loadedMembers, 'Boolean')? arg.loadedMembers: !!this.loadedMembers;
	
	this.tag = arg.tag || this.tag;
	this.mute = YYIMUtil['isWhateType'](arg.mute, 'Boolean')? arg.mute: !!this.mute;
	this.stick = YYIMUtil['isWhateType'](arg.stick, 'Boolean')? arg.stick: !!this.stick;
	
	this.updateMemberList(arg.members,arg.action);
	this.syncInfo();
};

YYIMCacheGroup.prototype.syncInfo = function(){
    if(!this.photo){
		this.photo = YYIMCacheConfig.DEFAULT_PHOTO.GROUP;
	}
    
    if(!this.name){
    	this.name = this.name || '';
    	var length = this.members.length <= 5?  this.members.length:5;
    	
    	if(length == 1){
    		this.name = '群组';
    	}else if(length == 2){
    		this.forEach(function(index,item,list){
    			if(item.id != YYIMChat.getUserID()){
    				this.name = item.name;
    			}
    		});
    	}else if(length > 2){
    		for(var x = 0;x < length;x++){
				if(this.members[x].id != YYIMChat.getUserID()){
	    			if(x < (length-1)){
	    				this.name += this.members[x].name + ',';
	    			}else if(x == (length-1)){
	    				this.name += this.members[x].name;
	    			}
    			}else{
    				if(this.members.length > length){
    					++length;
    				}
    			}
    		}
    	}
    }
    
	this.getAttributes();
};

YYIMCacheGroup.prototype.getAttributes = function(){
	if(!!this.id && !this.spaceId){
		var temps = this.id.split('_');
		if(temps.length > 1){
			if(!this.groupType){ //获取群组类型
				for(var x in YYIMCacheBusinessConfig.GROUPTYPE){
					if(YYIMCacheBusinessConfig.GROUPTYPE[x].flag == temps[0]){
						this.groupType = YYIMCacheBusinessConfig.GROUPTYPE[x].name;
						if(!!temps[2] && temps[0] == YYIMCacheBusinessConfig.GROUPTYPE.TEAM.flag){
							this.teamId = temps[2];
						}
						break;
					}
				}
			}
			if(!!this.groupType){
				this.spaceId = temps[1] || this.spaceId;
			}
		}
	}
};

YYIMCacheGroup.prototype.getPhotoUrl = function(){
	return this.photo;
};

YYIMCacheGroup.prototype.updateMemberList = function(members,action){
	if(!!members && members.length){
		if(action !== 'append'){
			this.clear();
			this.members.length = 0;
		}
		for(var x in members){
			if(!!members[x].id){
				var member = this.get(members[x].id);
				members[x].loadedInfo = true;
				if(!!member){
					member.vcard.build(members[x]);
					member.build(members[x]);
					YYIMCacheRosterManager.getInstance().set(member.id,member);
				}else{
					members[x].vcard = new YYIMCacheVCard(members[x])
					member = new YYIMCacheRoster(members[x]);
					this.set(member.id,member);
					this.members.push(member);
					YYIMCacheRosterManager.getInstance().set(member.id,member);
				}
				if(members[x].affiliation === 'owner'){
					this.owner = member;
				}
			}
		}
	}
};

YYIMCacheGroup.prototype.removeMember = function(key){
	var member = this.get(key);
	if(!!member){
		this.remove(key);
		var index = this.members.indexOf(member);
		if(index > -1){
			this.members.splice(index,1);
		}
		if(this.numberOfMembers >= 1){
			this.numberOfMembers -= 1;
		}
	}
};

YYIMCacheGroup.prototype.getGroupMembers = function(arg){
	var that = this;
	arg = arg || {};
	
	if(this.querying) return;
	
	this.querying = true;
	
	YYIMChat.getGroupMembers({
		to: this.id,
		success: function(membersList){
			that.build({
				members: JSON.parse(membersList),
				loadedMembers: true
			})
			that.querying = false;
			arg && arg.success && arg.success(that);
		},
		error: arg.error,
		complete: arg.complete
	});
};


YYIMCacheGroup.prototype.transferOwner = function(id){
	this.owner = this.get(id) || this.owner;
};

function YYIMCacheGroupManager(){
	this.init();
}

YYIMCacheGroupManager.prototype = new YYIMCacheList();

YYIMCacheGroupManager.getInstance = function(spaceId){
	if(!this._instance){
		this._instance = new YYIMCacheGroupManager();
	}
	this._instance.spaceId = spaceId;
	return this._instance;
};

YYIMCacheGroupManager.prototype.init = function(arg){
	var that = this;
	jQuery(window).on('unload',function() {
		that.save();
	});
};

/**
 * 更新群组缓存
 * @param {Object} 
 * arg {
 * 	id,name,numberOfMembers,superLarge,collected,creater,members,photo
 * }
 */
YYIMCacheGroupManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id){
		var group = this.get(arg.id);
		if(!!group){
			group.build(arg);
		}else{
			group = new YYIMCacheGroup(arg);
			this.set(group.id,group);	
			
		}
		return group;
	}
};

/**
 * 创建群组
 * @param arg {name:,members:[],success:function,complete:function}
 */
YYIMCacheGroupManager.prototype.createChatGroup = function(arg){
	var that = this;
	YYIMChat.createChatGroup({
		name:arg.name,
		members:arg.members || [],
		success:function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 创建经销商群组
 * @param arg {name:,members:[],success:function,complete:function}
 */
YYIMCacheGroupManager.prototype.createDealerChatGroup = function(arg){
	if(this.spaceId){
		var that = this;
		YYIMChat.createChatGroup({
			to: YYIMCacheBusinessConfig.GROUPTYPE.DEALER.flag + '_' + this.spaceId + '_' + new Date().getTime(),
			name:arg.name,
			members:arg.members || [],
			success:function(data){
				arg.success && arg.success(that.updateCache(data));
			},
			complete:function(){
				arg.complete && arg.complete();
			}
		});
	}
};

/**
 * 拉取群成员
 * @param {Object} 
 * arg {
 * 	  to: String,//群组
 *    success:function,
 *    error:function,
 *    complete:function
 * }
 */
YYIMCacheGroupManager.prototype.getGroupMembers = function(arg){
	var group = this.get(arg.to);
	if(!!group){
		group.getGroupMembers(arg);
	}
};

/**
 * 转让群主
 * @param {Object} arg 
 * {to:群组,newOwner:string,success:function,error:function,complete:function}
 */
YYIMCacheGroupManager.prototype.transferChatGroup = function(arg){
	var group = this.get(arg.to);
	if(group.owner && group.owner.id === YYIMChat.getUserID()){
		var newOwner = group.get(arg.newOwner);
		if(newOwner){
			var that = this;
			YYIMChat.transferChatGroup({
				to:	arg.to || arg.id,
				newOwner: arg.newOwner,
				success: function(data){
					data.action = 'append';
					arg.success && arg.success(that.updateCache(data));
				},
				complete:function(){
					arg.complete && arg.complete();
				}
			});
		}
	}
};

/**
 * 群主解散群
 * @param {Object} arg {
 * 	to: String,
 *  success:funciton
 * }
 */
YYIMCacheGroupManager.prototype.dismissChatGroup = function(arg){
	var group = this.get(arg.to);
	var that = this;
	if(!!group && group.owner.id == YYIMChat.getUserID()){
		YYIMChat.dismissChatGroup({
			to: arg.to,
			success: function(data){
				that.remove(data.from);
				arg.success && arg.success(data.from);
			},
			error: arg.error,
			complete: arg.complete
		});
	}
};
/**
 * 转换群组
 * @param {Object} arg
 * {to:群组,newOwner:string}
 */
YYIMCacheGroupManager.prototype.transferOwner = function(arg){
	if(arg.to){
		var group = this.get(arg.to);
		if(group && arg.newOwner){
			group.transferOwner(arg.newOwner); 
		}
	}
};

/**
 * 邀请群成员
 * @param {Object} arg 
 * {to:群组,members:[],success:function,error:function,complete:function}
 */
YYIMCacheGroupManager.prototype.inviteGroupMember = function(arg){
	var that = this;
	YYIMChat.inviteGroupMember({
		to:arg.to || arg.id,
		members:arg.members || [],
		success:function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 更改群名称
 * @param {Object} arg 
 * {to:群组,name:string, success: function,complete: function}
 */
YYIMCacheGroupManager.prototype.modifyChatGroupInfo = function(arg){
	if(this.get(arg.to).owner.id === YYIMChat.getUserID()){
		var that = this;
		YYIMChat.modifyChatGroupInfo({
			to:arg.to || arg.id,
			name:arg.name,
			success:function(data){
				arg.success && arg.success(that.updateCache(data));
			},
			complete:function(){
				arg.complete && arg.complete();
			}
		});
	}
};

/**
 * 群主踢人
 * @param {Object} arg
 */
YYIMCacheGroupManager.prototype.kickGroupMember = function(arg){
	var that = this;
	YYIMChat.kickGroupMember({
		to: arg.to,
		member: arg.member,
		success: function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		error: arg.error,
		complete: arg.complete
	});
};

/**
 * 被群组踢出
 * @param {Object} arg
 */
YYIMCacheGroupManager.prototype.KickedOutByGroup = function(arg){
	var group = this.get(arg.from);
	if(!!group){
		if(!arg.to || arg.to === YYIMChat.getUserID()){
			this.remove(arg.from);
		}else{
			group.removeMember(arg.to);
		}
	}
};

/**
 * 退出群组
 * {to:群组,success: function,complete: function}
 */
YYIMCacheGroupManager.prototype.exitChatGroup = function(arg){
	var that = this;
	YYIMChat.exitChatGroup({
		to:arg.to,
		success:function(data){
			that.remove(data.from);
			arg.success && arg.success(data.from);
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 收藏群组
 * @param {Object} arg
 *  {to:群组id, success: function, error: function,complete: function}
 */
YYIMCacheGroupManager.prototype.collectGroup = function(arg){
	var that = this;
	YYIMChat.collectGroup({
		to:arg.to,
		success:function(data){
			that.updateCache({id:data.from,collected:true});
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 取消收藏群组
 * @param {Object} arg
 *  {to:群组id, success: function, error: function,complete: function}
 */
YYIMCacheGroupManager.prototype.removeCollectGroup = function(arg){
	var that = this;
	YYIMChat.removeCollectGroup({
		to:arg.to,
		success:function(data){
			that.updateCache({id:data.from,collected:false});
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

YYIMCacheGroupManager.prototype.getGroupList = function(){
	var temp = [];
	for(var x in this.list){
		if(!!this.list[x].id){
			if(!this.list[x].spaceId || this.list[x].spaceId == this.spaceId){
				temp.push(this.list[x]);
			}
		}
	}
	return temp;
};

YYIMCacheGroupManager.prototype.initLocal = function(arg){
	arg = arg || {};
	
	var storaged = ScriptUtil['localstorage']['getItem']('GROUPDATA_' + YYIMChat.getUserNode());
	try{
		storaged = JSON.parse(storaged);
		for(var x in storaged){
			if(storaged[x].id){
				storaged[x].loadedInfo = true;
				this.updateCache(storaged[x]);
			}
		}
	}catch(e){
		ScriptUtil['localstorage']['setItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode(),0);
	}
	
	that = this;
	
	YYIMChat.getChatGroups({
		startDate: Number(ScriptUtil['localstorage']['getItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode())) || 0,
		success: function(data){
			ScriptUtil['localstorage']['setItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode(),data.ts);

			for(var x in data.roomItems){
				if(data.roomItems[x].id){
					data.roomItems[x].loadedInfo = true;
					that.updateCache(data.roomItems[x]);
				}
			}
			
			that.forEach(function(index,item,list){
				if(data.roomNames.indexOf(item.id) === -1){
					that.remove(item.id);
					
				}
			});
			
			arg.success && arg.success();
		}
	});
};

YYIMCacheGroupManager.prototype.save = function(){
	var target = {};
	this.forEach(function(index,item,list){
		var members = [];
		
		if(item.owner){
			members.push({
				id: item.owner.id,
				name: item.owner.name,
				photo: item.owner.photo,
				affiliation: 'owner' 
			});
		}
		
		for(var x = 0; x < 10 && x < item.members.length;x++){
			if(!item.owner || item.owner.id != item.members[x].id){
				members.push({
					id: item.members[x].id,
					name: item.members[x].name,
					photo: item.members[x].photo,
					affiliation: 'memeber' 
				});
			}
		}
		
		target[item.id] = {
			id: item.id,
			name: item.name,
			photo: item.photo,
			members: members,
			numberOfMembers: item.numberOfMembers
		};
	});
	ScriptUtil['localstorage']['setItem']('GROUPDATA_' + YYIMChat.getUserNode(),JSON.stringify(target));
};


YYIMCacheGroupManager.prototype.destory = function(){
	this.save();
	this.clear();
};





function YYIMCacheGroupMember(arg){
	this.build(arg);
}

YYIMCacheGroupMember.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || this.name || this.id;
	this.photo = arg.photo || this.photo;
	this.affiliation = arg.affiliation || this.affiliation;
	this.role = arg.role || this.role;
	
	this.syncInfo();
};

YYIMCacheGroupMember.prototype.syncInfo = function(){
    if(!this.photo){
		this.photo = YYIMCacheConfig.DEFAULT_PHOTO.GROUPMEMEBER;
	}else{
		this.photo = BusinessInterfaceConfig.STATICADDRESS + this.photo;
	}
	this.avatar = this.photo;
};

YYIMCacheGroupMember.prototype.getPhotoUrl = function(){
	return this.photo;
};

function YYIMCacheMessage(arg){
	this.build(arg);
}

YYIMCacheMessage.prototype.init = function(){
	this.syncInfo();
};

YYIMCacheMessage.prototype.build = function(arg){
	this.id = arg.msgId || arg.packetId || arg.id || this.id;
	this.type = arg.type || arg.chatType || this.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	this.data = arg.body || arg.data || this.data;
	this.resource = arg.resource || this.resource;
	this.dateline = arg.dateline || this.data.dateline; 
	this.revocation = arg.revocation || this.revocation;
	this.sessionVersion = arg.sessionVersion || this.sessionVersion;
	
	this.firstShow = YYIMUtil['isWhateType'](arg.firstShow, 'Boolean')? arg.firstShow: !!this.firstShow; //首条展示
	
	this.readed = YYIMUtil['isWhateType'](arg.readed, 'Boolean')? arg.readed: !!this.readed; //本人是否已读
	this.received = YYIMUtil['isWhateType'](arg.received, 'Boolean')? arg.received: !!this.received; //是否本人收到的消息
	this.showInterval = YYIMUtil['isWhateType'](arg.showInterval, 'Boolean')? arg.showInterval: !!this.showInterval;
	
	if(!this.received && this.sendState !== YYIMCacheConfig.SEND_STATE.READED && this.type === YYIMCacheConfig.CHAT_TYPE.CHAT){
		this.sendState = arg.sendState || this.sendState || YYIMCacheConfig.SEND_STATE.NONE;
	}

	if(!this.from){
		this.fromId = arg.from || arg.fromId;
	}
	
	if(!this.to){
		this.toId = arg.to || arg.toId;
	}
	
	this.init();
};

/**
 * 获取历史记录
 */
YYIMCacheMessage.prototype.syncInfo = function(){
	this.data.dateline = this.dateline;
	
	var fromManager,toManager,fromRosterManager;

	fromRosterManager = toManager = fromManager = YYIMCacheRosterManager.getInstance();
	
	if(this.toId === YYIMChat.getUserID()){ //收到的
		this.received = true;
	}

	if(this.type === YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
		if(this.received){
			fromManager = YYIMCachePubAccountManager.getInstance();
		}else{
			toManager = YYIMCachePubAccountManager.getInstance();
		}
	}else if(this.type === YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT){
		if(this.received){
			fromManager = YYIMCacheGroupManager.getInstance();
		}else{
			toManager = YYIMCacheGroupManager.getInstance();
		}
		
		if(!!this.fromId){
			this.fromRosterId = this.fromId.roster;
			var room = this.fromId.room;
			this.fromId = room;
			
			if(this.fromRosterId === YYIMChat.getUserID()){
				this.received = false;
			}
		}
		
		if(!!this.fromRoster && this.fromRoster.id === YYIMChat.getUserID()){
			this.received = false;
		}
		
	} 
	
	if(!!this.fromId){
		var from = (this.type != YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT )? fromManager.updateCache({id:this.fromId}): fromManager.get(this.fromId);
		if(from){
			this.from = from;
			delete this.fromId;
		}
	}
	
	if(!!this.toId){
		var to = (this.type != YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT )? toManager.updateCache({id:this.toId}): toManager.get(this.toId);
		if(to){
			this.to = to;
			delete this.toId;
		}
	}
	
	if(!!this.fromRosterId){
		var fromRoster = fromRosterManager.updateCache({id:this.fromRosterId});
		if(fromRoster){
			this.fromRoster = fromRoster;
			delete this.fromRosterId;
		}
	}
	
	this.opposite = this.fromId || this.from.id;
	var temp = this.toId || this.to.id;
	
	if(YYIMChat.getUserID() !== temp){
		this.opposite = temp;
	}
	
	if(this.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.REVOCATION){
		this.revocation = this.fromRoster || this.from;
	}
	
	this.getTemplateCode();
	this.analysisAtmsg();
//	this.getConvertedIds();
	this.analysisExtend();
	this.analysisLocation();
};

YYIMCacheMessage.prototype.getTemplateCode = function(){
	if(!this.templateCode && this.data){
		this.templateCode = this.data.contentType;
	}
};

YYIMCacheMessage.prototype.analysisLocation = function(){
	if(this.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.LOCATION){
		this.data.content.path = 'http://restapi.amap.com/v3/staticmap?location='+ this.data.content.longitude +','+ this.data.content.latitude +'&zoom=10&size='+ YYIMCacheConfig.LOCATION_SHOWPIC_SIZE +'&markers=mid,,A:'+ this.data.content.longitude +','+ this.data.content.latitude +'&key=ee95e52bf08006f63fd29bcfbcf21df0';
	}
};

YYIMCacheMessage.prototype.analysisExtend = function(){
	if(this.data && this.data.extend && !this.data.noticy){
		try{
			 this.data.extend = JSON.parse(this.data.extend);
			 if(this.data.extend.esndata){
			 	this.data.extend.esndata = JSON.parse(this.data.extend.esndata);
			 	this.data.extend.esndata.parent = this;
			 	this.data.noticy = new YYIMCacheNoticy(this.data.extend.esndata);
			 }
		}catch(e){
			this.data.extend = this.data.extend || {};
		}
	}
};

YYIMCacheMessage.prototype.analysisAtmsg = function(){
	if(this.type == YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT 
		&& !!this.data 
		&& this.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.TEXT 
		&& typeof this.data.content === 'string'){
			
		if(this.data.atuser instanceof Array && !!this.data.receipt){
			if(this.data.atuser.indexOf(YYIMChat.getUserID()) > -1){
				this.data.isHaveAt = true;
			}
		}
	}
};

YYIMCacheMessage.prototype.getConvertedIds = function(arg){
	var that = this;
	if(this.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE){
		YYIMChat.getTransformFileList({
			attachId: this.data.content.attachId,
			success:function(data){
				if(!!data.result){
					that.data.convertedIds = data.result;
				}
			}
		});
	}
};


function YYIMCacheMessageManager(){
	this.messList = {};	
	this.showInterval = {};
	this.atUserList = [];
	this.attachMapped = {};	
}

YYIMCacheMessageManager.prototype = new YYIMCacheList();

YYIMCacheMessageManager.getInstance = function(){
	if(!this._instance){
		this._instance = new YYIMCacheMessageManager();
	}
	return this._instance;
};

/**
 * 跟新消息缓存
 * @param {Object} arg
 */
YYIMCacheMessageManager.prototype.updateCache = function(arg){
	if(!arg) return;

	var id = arg.msgId || arg.packetId || arg.id;
	
	if(id){
		var message = this.get(id),
		isNew = false;
		if(!!message){
			message.build(arg);
		}else{
			message = new YYIMCacheMessage(arg);
			if(!message.data) return;			
			this.set(id,message);
			isNew = true;
		}	
		
		/**
		 * 按照 附件id 存附件與消息的关系映射
		 */
		if(message.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE){
			this.attachMapped[message.data.content.attchId] = message;
		}
		
		try{
			var uid = message.fromId || message.from.id;
			var to = message.toId || message.to.id;
		}catch(e){
			return;
		}
		
		if(YYIMChat.getUserID() !== to){
			uid = to;
		}
		
		if(uid){
			if(!this.messList[uid]){
				this.messList[uid] = {};
				this.messList[uid]['readed'] = [];
				this.messList[uid]['unreaded'] = [];
				this.messList[uid]['all'] = [];
			}
			
			if(isNew){
				this.messList[uid]['all'].push(message);
			}
			
			this.messList[uid]['readed'].length = 0;
			this.messList[uid]['unreaded'].length = 0;
			
			for(var x in this.messList[uid]['all']){
				var mess = this.messList[uid]['all'][x];
				if(!!mess && mess.readed === true){
					this.messList[uid]['readed'].push(mess);
				}else if(!!mess && mess.readed === false){
					this.messList[uid]['unreaded'].push(mess);
				}
			}
			
			this.messList[uid]['readed'] = this.messList[uid]['readed'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
			this.messList[uid]['unreaded'] = this.messList[uid]['unreaded'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
			this.messList[uid]['all'] = this.messList[uid]['all'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
		}
		
		this.getShowInterval(message);
		
		if(arg.sendState == YYIMCacheConfig.SEND_STATE.READED || message.received){
			this.receiveReceipts(message.id);
		}
		return message;
	}
};

YYIMCacheMessageManager.prototype.getShowInterval = function(message){
	if(!!message && message.opposite){
		var dateline = message.dateline;
		var opposite = message.opposite;
		
		this.showInterval[opposite] = this.showInterval[opposite] || {max:dateline,min:dateline};
		
		if(dateline - this.showInterval[opposite]['max'] > YYIMCacheConfig.PRE_SHOW_TIMEINTERVAL){
			this.showInterval[opposite]['max'] = dateline;
			message.build({
				showInterval: true
			});
		}else if(this.showInterval[opposite]['min'] - dateline > YYIMCacheConfig.PRE_SHOW_TIMEINTERVAL){
			this.showInterval[opposite]['min'] = dateline;
			message.build({
				showInterval: true
			});
		}else if(this.showInterval[opposite]['min'] == this.showInterval[opposite]['max'] && this.showInterval[opposite]['min'] == dateline){
			message.build({
				showInterval: true
			});
		}else if(message.firstShow === true){
			if(!!this.firstShow){
				this.firstShow.build({
					showInterval: false
				});
			}
			this.firstShow = message;
			this.firstShow.build({
				showInterval: true
			});
		}
	}
};

/**
 * 获取历史消息
 * @param {Object} arg {
 * id: //对话人id
 * chatType: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * contentType:int, //代表希望拿到的消息类型，不填则为全部消息类型 
 * start: number,   //消息列表的分页参数，起始值，默认0,
 * num: number   //消息列表的分页参数，分页参数，默认100
 * }
 */
YYIMCacheMessageManager.prototype.getHistoryMessage = function(arg){
	var user = arg.id || arg.to;
	if(!user) return;
	
	var recent = YYIMCacheRecentManager.getInstance().get(user);
	if(!recent) return;
	
	var that = this;
	
	that.history = that.history || {};
	that.history[user] = that.history[user] || {};
	
	that.history[user]['start'] = that.history[user]['start'] || 0;
	that.history[user]['present'] = arg.present || that.history[user]['present'] || 0;
	
	if(that.history[user]['isEnd']){
		arg.success && arg.success({
			count: 0,
			isEnd: true
		});
		return;
	}
	
	this.TemphisMsgList = this.TemphisMsgList || [];
	
	YYIMChat.getHistoryMessage({
		id: user,
		chatType: arg.chatType || arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT,
		contentType: arg.contentType,
		start: that.history[user]['start'] || 0,
		size: YYIMCacheConfig.PRE_HISTORY_LENGTH,
		endVersion: recent.originVersion,
		success:function(data){
			var isEnd = data.result.length <= (YYIMCacheConfig.PRE_HISTORY_LENGTH - that.history[user]['present']) && data.result.length < YYIMCacheConfig.PRE_HISTORY_LENGTH; //没有历史记录了
			var isFull = false;
			var lastestMessage = null;
			
			data.result.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
			try{
				var firstMessage = data.result[data.result.length-1];
				if(firstMessage){
					firstMessage.firstShow = true;
				}
			}catch(e){}
			
			for(var x in data.result){
				var result = data.result[x];
				var msgId = result.msgId || result.packetId || result.id;
				var message = that.get(msgId);
				
				if(!message){
					result.readed = true;
					lastestMessage = that.updateCache(result);
					that.history[user]['present'] += 1;
				}
				
				that.history[user]['start'] += 1;
				
				if(!!lastestMessage){
					var list = that.messList[user]['all'];
					var lastestTime = 0;
					if(!!list && list.length){
						lastestTime = list[list.length-1].dateline;
					}
					
					if(lastestMessage.dateline >= lastestTime){
						if(lastestMessage.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.REVOCATION){
							var entity = lastestMessage.fromRoster || lastestMessage.from;
							var latestState = entity.name + '撤回了一条消息';
							if(entity.id == YYIMChat.getUserID()){
								latestState = '您撤回了一条消息';
							}
							YYIMCacheRecentManager.getInstance().updateCache({
								id: user,
								dateline: lastestMessage.dateline,
								latestState: latestState,
								contentType: lastestMessage.data.contentType,
								sessionVersion: lastestMessage.sessionVersion,
								type: lastestMessage.type,
								sort: false
							});
						}else{
							YYIMCacheRecentManager.getInstance().updateCache({
								id: user,
								dateline: lastestMessage.dateline,
								latestState: lastestMessage.data,
								contentType: lastestMessage.data.contentType,
								sessionVersion: lastestMessage.sessionVersion,
								type: lastestMessage.type,
								sort: false
							});
						}
					}
					
					that.TemphisMsgList.push(lastestMessage);
				}
				
				if(that.history[user]['present'] >= YYIMCacheConfig.PRE_HISTORY_LENGTH){
					isFull = true; //本次拉取固定条数完成
					break;
				}
			}
			
			if(isEnd || isFull){
				var temp = that.history[user]['present'];
				that.history[user]['present'] = 0;
				
				if(isEnd){
					that.history[user]['isEnd'] = true;
				}
				arg.success && arg.success({
					list: that.TemphisMsgList,
					count:temp,
					isEnd:isEnd,
					isFull:isFull
				});
				
				that.TemphisMsgList.length = 0;
			}else{
				that.getHistoryMessage(arg);
			}
			
		},
		error:function(){
			arg.error && arg.error();
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 获取历史消息
 */
YYIMCacheMessageManager.prototype.getOfflineMessage = function(arg){
	YYIMChat.getOfflineMessage(arg);
};

/**
 * 获取消息列表
 * @param {Object}
 *  arg {
 * 	id:,//对话人id
 *  condition: // readed(已读)/unreaded(未读)/all(全部)
 * }
 *  
 */
YYIMCacheMessageManager.prototype.getMessageList = function(arg){
	try{
		return this.messList[arg.id][arg.condition || 'all'];
	}catch(e){
		return [];
	}
};

YYIMCacheMessageManager.prototype.getLastValidMessage = function(arg){
	var messageList = this.getMessageList(arg);
	var length = messageList.length;
	while(length--){
		if(!messageList[length].revocation){
			return messageList[length];
		}
	}
};

/**
 * 展示消息列表
 * @param {Object}
 *  arg {
 * 	id:,//对话人id
 *  condition: // readed(已读)/unreaded(未读)/all(全部)
 * }
 *  
 */
YYIMCacheMessageManager.prototype.showMessageList = function(arg){
	try{
		var uid = arg.id;
		for(var x in this.messList[uid]['unreaded']){
			var message = this.messList[uid]['unreaded'][x];
			if(message && message.id){
				this.updateCache({
					id: message.id,
					readed: true
				});
			}
		}
		
		var list = this.messList[uid]['all'];
		var lastestMessage = list[list.length-1];
		if(!!lastestMessage){
			var recent = YYIMCacheRecentManager.getInstance().get(uid);	
			
			if(!!recent && (recent.sessionVersion - recent.readedVersion)){
				YYIMCacheRecentManager.getInstance().updateCache({
					id: uid,
					type: recent.type,
					readedVersion: recent.sessionVersion
				});
				this.sendReceipts(lastestMessage.id);
			}
		}
		return list;
	}catch(e){
		return [];
	}
};

/**
 * 对方已读回执处理
 */
YYIMCacheMessageManager.prototype.receiveReceipts = function(id){
	if(id){
		var message = this.get(id);
		if(message){
			for(var x in this.messList[message.opposite]['all']){
				var temp = this.messList[message.opposite]['all'][x];
				if(temp && temp.sessionVersion <= message.sessionVersion){
					temp.build({
						sendState: YYIMCacheConfig.SEND_STATE.READED
					});
				}
			}
		}
	}
};

YYIMCacheMessageManager.prototype.sendReceipts = function(id){
	if(!!id){
		var message = this.get(id);
		if(message && message.data.receipt){
			if(message.data.receipt){
				var recent = YYIMCacheRecentManager.getInstance().get(message.opposite);
				if(!!recent && message.data.receipt.sessionVersion < recent.sessionVersion){
					message.data.receipt.sessionVersion = recent.sessionVersion;
				}
				YYIMChat.sendReadedReceiptsPacket(message.data.receipt);
			}
		}
	}
};

/**
 * 撤销消息 rongqb 20160707
 * arg {
 * 	id: String, //消息id
 *  to: String, //消息的另一方,待定
 *  type: 'chat/groupchat/pubaccount',
 *  success: function,
 *  error: function,
 *  complete: function
 * }
 */
YYIMCacheMessageManager.prototype.revocationMessage = function(arg){
	arg = arg || {};
	var that = this;
	var message = this.get(arg.id);
	if(message && !message.revocation){
		YYIMChat.revocationMessage(arg);
	}
};

/**
 * 发送文本消息[文本,表情]
 * @param arg {
 * to: id,  //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * msg:text, //消息文本
 * style：{
 *    font: "16", //字体
 *    size: "30", //大小
 *    color: "#000", //颜色
 *    biu: 7 //加粗、斜体、下划线
 * }, 
 * extend: string,  //扩展字段 
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendTextMessage = function(arg){
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	var that = this;
	
	var atUserId;
	if(this.atUserList.length){
		atUserId = [];
		for(var x in this.atUserList){
			atUserId.push(this.atUserList[x].id);
		}
	}
	var param = {
		to: to,
		type: type,
		msg: arg.msg,
		atuser: atUserId,
		style: arg.style,
		extend: JSON.stringify(this.atUserList),
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	};
	
	this.atUserList.length = 0;
	YYIMChat.sendTextMessage(param);
};

/**
 * 发送分享消息[分享消息]
 * @param arg {
 * to: id, //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * extend: string,  //扩展字段 
 * sharebody:{
 * 		shareImageUrl:string, //分享中图片的url
 * 		shareUrl:string, //分享的url
 * 		shareDesc:string, //分享的内容描述
 * 		shareTitle:string //分享的标题
 * 	},
 * success:function //成功回调函数
 * }
 */  
YYIMCacheMessageManager.prototype.sendShareMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendShareMessage({
		to: arg.to || arg.id,
		type: type,
		sharebody: arg.sharebody,
		extend: arg.extend,
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	});
	
};


/**
 * 发送图片消息
 * @param arg{
 * chatInfo: function,
 * fileFiltered: function, //文件被添加到上传队列
 * beforeUpload: function, //文件上传之前
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendPicMessage  = function(arg){
	var that = this;
	YYIMChat.sendPic({
		fileInputId:arg.fileInputId,
		fileFiltered: arg.fileFiltered,
		beforeUpload: arg.beforeUpload,
		chatInfo: arg.chatInfo,
		success:function(data){
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		},
		progress: function(result){
			YYIMChat.log('uploadProgress',3,result.percent);
			arg.progress && arg.progress(result);
		}
	});
};

/**
 * 发送文件消息
 * @param arg{
 * chatInfo: function,
 * fileFiltered: function, //文件被添加到上传队列
 * beforeUpload: function, //文件上传之前
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendFileMessage  = function(arg){
	var that = this;
	YYIMChat.sendFile({
		fileInputId:arg.fileInputId,
		fileFiltered: arg.fileFiltered,
		beforeUpload: arg.beforeUpload,
		chatInfo: arg.chatInfo,
		success:function(data){
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		},
		progress: function(result){
			YYIMChat.log('uploadProgress',3,result.percent);
			arg.progress && arg.progress(result);
		}
	});
};

YYIMCacheMessageManager.prototype.sendFormMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendFormMessage({
		
		file: {
				name: arg.file.name,
				size: arg.file.size
		},
		mediaType: arg.mediaType || 1,
		
		data: arg.data,

		to: to,
		
		type: type,
		
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message);
		},
		progress:function(data) {
			// body...
			console.log('progress');
			console.log(data);
			arg.progress && arg.progress(data);
		}
	});
};

YYIMCacheMessageManager.prototype.PostMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.postMessage({
		content:arg.content,
		to: arg.to,
		contentType:arg.contentType,
		type: arg.type,		
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message);
		},
		progress:function(data) {
			// body...
			console.log('progress');
			console.log(data);
			//arg.progress && arg.progress(data);
		}
	});
};

YYIMCacheMessageManager.prototype.forwardMessage  = function(arg){
	var that = this;
	var msg = that.get(arg.mid);
	if (!msg) return;
	switch(msg.data.contentType)
		{
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.TEXT:
		  var msgcopy ={
		  		to: arg.to,
				msg: msg.data.content,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.sendTextMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE:
		  var msgcopy ={
		  		to: arg.to,
				content: msg.data.content,
				contentType:msg.data.contentType,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.PostMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.IMAGE:
		  var msgcopy ={
		  		to: arg.to,
				content: msg.data.content,
				contentType:msg.data.contentType,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.PostMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.AUDO:
		  
		  break;
		default:
		   break;
		}
		arg.success && arg.success();
};

/**
 * 发送白板消息
 * @param arg {
 * to: id,  //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * extend: string,  //扩展字段 
 * content:{
 * 	id:, //白板id
 * }, 
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendWhiteBoardMessage = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendWhiteBoardMessage({
		to: to,
		type: type,
		extend: arg.extend,
		content: arg.content,
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	});
};

YYIMCacheMessageManager.prototype.updateCacheByTransMessage = function(arg){
	switch(arg.category){
		case YYIMCacheConfig.TRAMSPARENT_TYPE.ATTACHMENTCONVERTED:
		 	try{
		 		var convertedIds = JSON.parse(arg.attributes.convertedInfo);
		 		var message = this.attachMapped[convertedIds.attachId];
				if(!!message){ //消息已到达
				 	message.data.convertedIds = convertedIds.result;
				}
				return message;
		 	}catch(e){}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.REVOKE:
			 if(arg && arg.attributes && arg.attributes.packetId){
			 	var message = this.get(arg.attributes.packetId);
			 	if(message){
			 		message.build({
				 		revocation: YYIMCacheRosterManager.getInstance().updateCache({
				 			id: arg.from.roster || arg.from
				 		})
				 	});
				 	return message;
			 	}
			 }
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.SETMUTE:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					mute: true
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){
					recent.build({});
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.CANCELMUTE:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					mute: false
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){
					recent.build({});
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.SETSTICK:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					stick: true
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){ 
					YYIMCacheRecentManager.getInstance().updateCache({
						id: entity.id,
						type: recent.type,
						stick: true
					});
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.CANCELSTICK:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					stick: false
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){
					YYIMCacheRecentManager.getInstance().updateCache({
						id: entity.id,
						type: recent.type,
						stick: false
					});
					return recent;
				}
			}
			break;
		default:break;
	}
};

YYIMCacheMessageManager.prototype.getEntity = function(arg){
	arg = arg || {};
	var id = arg.to || arg.id; 
	if(arg && id && arg.type){
		switch(arg.type){
			case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
				return YYIMCacheGroupManager.getInstance().get(id);
			case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
				return YYIMCachePubAccountManager.getInstance().updateCache({id: id});
			default: 
				return YYIMCacheRosterManager.getInstance().updateCache({id: id});
		}
	}
};

YYIMCacheMessageManager.prototype.destory = function(){
	this.messList = {};	
	this.showInterval = {};
	this.atUserList.length = 0;
	this.attachMapped = {};	
	this.history = {};
	this.clear();
};
function YYIMCacheNoticy(arg) {
	this.defaultAvatar = BusinessInterfaceConfig.STATICADDRESS + YYIMCacheConfig.DEFAULT_PHOTO.ROSTER;
	this.build(arg);
}

YYIMCacheNoticy.prototype.build = function(arg){
	this.id = arg.noticeId || this.noticeId;
	this.title = arg.title || this.title;
	this.type_detail = arg.type_detail || this.type_detail;
	this.detail_url = arg.detail_url || this.detail_url;
	this.type = arg.type || this.type;
	this.highlight = arg.highlight || this.highlight;
	this.authorid = arg.authorid || this.authorid;
	this.avatar = arg.avatar || this.avatar;
	this.content = arg.content || this.content;
	this.created = arg.created || this.created;
	this.spaceId = arg.qz_id || this.spaceId;
	this.from_id = arg.from_id || this.from_id;
	this.noticeId = arg.noticeId || this.noticeId;
	this.srcData = arg.srcData || this.srcData;
	this.note = arg.note || this.note;
	this.pending = YYIMUtil['isWhateType'](arg.pending, 'Number') ? arg.pending : this.pending || 0;
	this.parent = arg.parent || this.parent;
	
	this.businessId = this.type_detail + '_' + this.from_id;

	this.syncInfo(arg);
};

YYIMCacheNoticy.prototype.syncInfo = function(arg) {

	if(!!this.parent && this.parent.from && this.parent.from.noticyType) {
		this.noticyType = this.parent.from.noticyType;
	}

	if(!!this.authorid && this.authorid !== '0' && !this.author) {
		this.author = YYIMCacheRosterManager.getInstance().updateCache({
			id: this.authorid
		});
	}

};
var YYIMCacheProfileManager = (function(){
	
	function getProfile(arg){
		arg = arg || {};
		YYIMChat.getProfile({
			success: function(data){
				if(data && data.muteItems){
					for(var x in data.muteItems){
						if(!!data.muteItems[x].id){
							var entity = getEntity(data.muteItems[x]);
							if(!!entity){
								entity.build({
									mute: true
								});
								
								var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
								if(!!recent){
									recent.build({});
								}
							}
						}
					}
				}
				
				if(data && data.stickItems){
					for(var x in data.stickItems){
						if(!!data.stickItems[x].id){
							var entity = getEntity(data.stickItems[x]);
							if(!!entity){
								entity.build({
									stick: true
								});
								
								var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
								if(!!recent){
									YYIMCacheRecentManager.getInstance().updateCache({
										id: entity.id,
										type: recent.type,
										stick: true
									});
								}
							}
						}
					}
				}
				
				arg.success && arg.success(data);
			},
			error: arg.error
		});
	}
	
	function getEntity(arg){
		arg = arg || {};
		var id = arg.to || arg.id; 
		if(arg && id && arg.type){
			switch(arg.type){
				case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
					return YYIMCacheGroupManager.getInstance().updateCache({id: id});
				case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
					return YYIMCachePubAccountManager.getInstance().updateCache({id: id});
				default: 
					return YYIMCacheRosterManager.getInstance().updateCache({id: id});
			}
		}
	}
	
	function mute(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.mute({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						mute: true
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						recent.build({});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function cancelMute(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.cancelMute({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						mute: false
					});
					
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						recent.build({});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function stick(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.stick({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						stick: true
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: entity.id,
							type: recent.type,
							stick: true
						});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function cancelStick(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.cancelStick({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: entity.id,
							type: recent.type,
							stick: false
						});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function createProfile(arg){
		YYIMChat.createProfile(arg);
	}
	
	function removeProfile(arg){
		YYIMChat.removeProfile(arg);
	}
	
	function clearProfile(arg){
		arg = arg || {};
		YYIMChat.clearProfile({
			success:function(){
				YYIMCacheGroupManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				
				YYIMCachePubAccountManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				
				YYIMCacheRosterManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				arg.success && arg.success(); 
			},error: arg.error
		});
	}
	
	return {
		getProfile: getProfile,
		mute: mute,
		cancelMute: cancelMute,
		stick: stick,
		cancelStick: cancelStick,
		createProfile: createProfile,
		removeProfile: removeProfile,
		clearProfile: clearProfile
	};
})();

function YYIMCachePubAccount(arg){
	this.build(arg);
}

YYIMCachePubAccount.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || this.name || this.id;
	this.type = arg.type || this.type || YYIMCacheConfig.PUBACCOUNT_TYPE.BROADCASE.TYPE;
	this.photo = arg.photo || this.photo;
	this.group = arg.group || this.group;
	
	this.tag = arg.tag || this.tag;
	this.mute = YYIMUtil['isWhateType'](arg.mute, 'Boolean')? arg.mute: !!this.mute;
	this.stick = YYIMUtil['isWhateType'](arg.stick, 'Boolean')? arg.stick: !!this.stick;
	this.loadedInfo = YYIMUtil['isWhateType'](arg.loadedInfo, 'Boolean')? arg.loadedInfo: !!this.loadedInfo;
	
	this.syncInfo();
};

YYIMCachePubAccount.prototype.syncInfo = function(){
	this.getAttributes();
    this.initInfo();
};

YYIMCachePubAccount.prototype.initInfo = function(){
	if(!this.loadedInfo){
		if(this.querying) return;
		this.querying = true;
		var that = this;
		YYIMChat.getPubAccountInfo({
			id: this.id,
			success:function(data){
				that.build(data);
				var recent = YYIMCacheRecentManager.getInstance().get(data.id);
				if(!!recent){
					YYIMCacheRecentManager.getInstance().remove(recent.id);
					YYIMCacheRecentManager.getInstance().updateCache(recent);
				}
				that.getPubaccountType();
				
				that.loadedInfo = true;
				that.querying = false;
			},
			error: function(error){
				var recent = YYIMCacheRecentManager.getInstance().get(that.id);
				if(!!recent){
					YYIMCacheRecentManager.getInstance().remove(recent.id);
				}
			}
		});
	}
};

YYIMCachePubAccount.prototype.getAttributes = function(){
	if(!!this.id && !this.spaceId){
		var temps = this.id.split('_');
		if(temps.length > 1){
			if(!this.pubType){ //获取公共号类型
				for(var x in YYIMCacheBusinessConfig.PUBACCOUNTTYPE){
					if(YYIMCacheBusinessConfig.PUBACCOUNTTYPE[x].name == temps[0]){
						this.pubType = temps[0];
						this.spaceId = temps[1];
						
						if(this.pubType == YYIMCacheBusinessConfig.PUBACCOUNTTYPE.APPACCOUNT.name && temps[2]){
							this.appId = temps[2];
						}
						
						if(this.pubType == YYIMCacheBusinessConfig.PUBACCOUNTTYPE.PUBACCOUNT.name && temps[2]){
							this.noticyType = temps[2];
							if(YYIMCacheBusinessConfig.PUBACCOUNTTYPE.PUBACCOUNT.type[this.noticyType]){
								this.photo = this.photo || YYIMCacheBusinessConfig.PUBACCOUNTTYPE.PUBACCOUNT.type[this.noticyType].photo;
							}
						}
						break;
					}
				}
			}
		}
	}
	
	this.photo = this.photo || YYIMCacheConfig.DEFAULT_PHOTO.PUBACCOUNT;
};

YYIMCachePubAccount.prototype.getPhotoUrl = function(){
	return this.photo;
};

YYIMCachePubAccount.prototype.getPubaccountType = function(){
	if(!this.pubaccountType){
		switch(this.type){
			case YYIMCacheConfig.PUBACCOUNT_TYPE.BROADCASE.TYPE:
				this.pubaccountType = YYIMCacheConfig.PUBACCOUNT_TYPE.BROADCASE.NAME;
				break;
			case YYIMCacheConfig.PUBACCOUNT_TYPE.SUBSCRIBED.TYPE:;	
			case YYIMCacheConfig.PUBACCOUNT_TYPE.SUBSCRIBE.TYPE:
				this.pubaccountType = YYIMCacheConfig.PUBACCOUNT_TYPE.SUBSCRIBE.NAME;
				break;
			default:break;
		}
	}
	return this.pubaccountType;
};



function YYIMCachePubAccountManager(){
}

YYIMCachePubAccountManager.prototype = new YYIMCacheList();

YYIMCachePubAccountManager.getInstance = function(spaceId){
	if(!this._instance){
		this._instance = new YYIMCachePubAccountManager();
	}
	this._instance.spaceId = spaceId;
	return this._instance;
};

/**
 * 更新公众号
 * @param {Object} arg {
 * 	 id:,name:,type:,photo
 * }
 */
YYIMCachePubAccountManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id){
		var pubaccount = this.get(arg.id);
		if(!!pubaccount){
			pubaccount.build(arg);
		}else{
			pubaccount = new YYIMCachePubAccount(arg);
			this.set(pubaccount.id,pubaccount);	
		}
		return pubaccount;
	}
};

/**
 * 查找广播号/订阅号
 * @param arg {
 * keyword, 
 * success: function, 
 * error: function,
 * complete: function
 * }
 */
YYIMCachePubAccountManager.prototype.queryPubaccount = function(arg){
	YYIMChat.queryPubaccount(arg);
};

/**
 * 关注订阅号
 * @param {Object} arg {
 * 	id,
 *  success:function,
 *  error:function
 * }
 */
YYIMCachePubAccountManager.prototype.addPubaccount = function(arg){
	if(!!arg && arg.id){
		var pubaccount = this.get(arg.id); 
		if(!pubaccount){
			YYIMChat.addPubaccount(arg);
		}
	}
};

/**
 * 取消公众订阅号
 * @param {Object} arg {
 * 	id,
 *  success:function,
 *  error:function
 * }
 */
YYIMCachePubAccountManager.prototype.removePubaccount = function(arg){
	if(!!arg && arg.id){
		var pubaccount = this.get(arg.id); 
		if(!!pubaccount){
			var that = this;
			YYIMChat.removePubaccount({
				id:arg.id,
				success:function(data){
					that.remove(data.from);					
					arg.success && arg.success(data);
				},
				error:function(){
					arg.error && arg.error();
				},
				complete:function(){
					arg.complete && arg.complete();
				}
			});
		}
	}
};

/**
 * 获取公众号(订阅号，广播号)列表
 * @param {Object} 
 * key 空：全部列表，broadcase：广播号，subscribe：订阅号
 */
YYIMCachePubAccountManager.prototype.getPubaccountList = function(key){
	var tempList = [];
	for(var x in this.list){
		if(!this.list[x].spaceId || this.list[x].spaceId == this.spaceId){
			if(typeof key === 'undefined'){
				tempList.push(this.list[x]);
				continue;
			}
			if(this.list[x].pubaccountType === key){
				tempList.push(this.list[x]);
		    }
		}
	}
	return tempList;
};



YYIMCachePubAccountManager.prototype.destory = function(){
	this.clear();
};

function YYIMCachePresence(arg){
	this.id = arg.id || arg.from || this.id;
	this.presence = {};
	this.build(arg);
}

/**
 * 构造roster Presence
 * @param {Object} arg {
 * 	  id,resource,show
 * }
 */
YYIMCachePresence.prototype.build = function(arg){
	if(arg.show && arg.resource){
		for(var x in YYIMCacheConfig.TERMINAL_TYPE){
			if(arg.resource.toLowerCase().indexOf(YYIMCacheConfig.TERMINAL_TYPE[x]) !== -1){
				this.presence[YYIMCacheConfig.TERMINAL_TYPE[x]] = {
					show:arg.show,
					resource:arg.resource
				};
				break;
			}
		}
	}
};

function YYIMCacheRoster(arg){
	this.loadedInfo = false;
	this.build(arg);
}

/**
 * 构建roster
 * @param {Object} arg
 */
YYIMCacheRoster.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || arg.nickname || this.name;
	this.ask = arg.ask || this.ask;
	this.recv = arg.recv || this.recv;
	this.resource = arg.resource || this.resource;
	this.subscription = arg.subscription || this.subscription;
	this.group = arg.group || this.group;
	this.photo = arg.photo || this.photo;
	this.vcard = arg.vcard || this.vcard;
	this.loadedInfo = YYIMUtil['isWhateType'](arg.loadedInfo, 'Boolean')? arg.loadedInfo: !!this.loadedInfo;
	
	this.tag = arg.tag || this.tag;
	this.mute = YYIMUtil['isWhateType'](arg.mute, 'Boolean')? arg.mute: !!this.mute;
	this.stick = YYIMUtil['isWhateType'](arg.stick, 'Boolean')? arg.stick: !!this.stick;
	
	this.init();
};

/**
 * 初始化roster
 */
YYIMCacheRoster.prototype.init = function(){
	this.id = this.id.toString();
	this.getRosterType();
	this.syncInfo();
	this.initVCard();
	this.updatePresence();
};

/**
 * 为自己设置上线presence，和改变其他联系人presence
 * @param {Object} arg
 */
YYIMCacheRoster.prototype.updatePresence = function(arg){
	arg = arg || {};
	
	arg.id = this.id;
	arg.resource = arg.resource || this.resource;
	arg.show = arg.show || YYIMCacheConfig.PRESENCE_SHOW.UNAVAILABLE;
	
	if(!this.presence){
		this.presence = new YYIMCachePresence(arg);
	}else{
		this.presence.build(arg);
	}
};

/**
 * 获得联系人的在线状态
 * @param {Object} terminalType
 */
YYIMCacheRoster.prototype.getPresence = function(terminalType){
	var presenceTemp = this.presence['presence'][terminalType || YYIMCacheConfig.TERMINAL_TYPE.WEB];
	if(presenceTemp){
		return presenceTemp['show'];
	}
};

/**
 * 修改本人vcard
 * @param {Object} 
 * arg {
 * 		vcard : {
 * 			nickname,
 * 			photo,
 * 			email,
 * 			mobile,
 * 			telephone
 * 		},
 * 		success : function,
 * 		error : fcuntion
 * }
 */
YYIMCacheRoster.prototype.setVCard = function(arg){
	if(this.rosterType === YYIMCacheConfig.ROSTER_TYPE.MYSELF){
		if(arg.vcard){
			var that = this;
			YYIMChat.setVCard({
				vcard:arg.vcard,
				success:function(){
					that.vcard.build(arg.vcard);
					that.syncInfo();
					arg.success && arg.success();	
				},
				error:function(){
					arg.error && arg.error();	
				}
			});
		}
	}
};

/**
 * 修改好友备注
 * @param {Object} 
 * arg {
 * 	roster:{
 * 		name:String,//新的备注姓名
 * 		group:[] //新的分组(数组)
 *  },
 *  success:function,
 *  error:function 
 * }
 */
YYIMCacheRoster.prototype.setRemark = function(arg){
	if(this.rosterType === YYIMCacheConfig.ROSTER_TYPE.FRIEND){
		if(arg && arg.roster && (arg.roster.name !== this.name || arg.roster.group !== this.group)){
			var that = this;
			YYIMChat.updateRosterItem({
				roster:{
					id:this.id,
					name:arg.roster.name,
					groups:arg.roster.group
				},
				suceess:function(){
					that.build({
						name:arg.roster.name,
						group:arg.roster.group
					});
					arg.success && arg.success();	
				},
				error:function(){
					arg.error && arg.error();	
				}
			});
		}
	}
};

/**
 * 初始化vcard
 */
YYIMCacheRoster.prototype.initVCard = function(){
	var that = this;
	if(!this.loadedInfo){
		
		if(this.querying) return;
		this.querying = true;
		
		this.vcard = new YYIMCacheVCard({
			id: this.id,
			name: this.name || this.id,
			photo: this.photo
		});
		
		YYIMChat.getVCard({ //默认的拿取 vcard 信息
			id: this.id,
			success: function(data) {
				if (data.enableFields) {
					YYIMCacheRosterManager.getInstance().build({
						enableVCardFields: data.enableFields
					});
				}
				
				that.vcard.build(data);
				
				that.build({
					tag: data.tag
				});
				
				that.syncInfo();
				
				that.loadedInfo = true;
				that.querying = false;
			}
		});
	}
};

/**
 * 信息同步
 */
YYIMCacheRoster.prototype.syncInfo = function(){
    if((!this.name || this.name == this.id || this.rosterType === YYIMCacheConfig.ROSTER_TYPE.MYSELF) && this.vcard && this.vcard.name){
    	this.name = this.vcard.name;
    }
	
    if(this.vcard && this.vcard.photo){
    	this.photo = this.vcard.photo;
    	if (this.photo.indexOf('.thumb.jpg') === -1){
    		this.photo = this.vcard.photo+'.thumb.jpg';
    	}
       this.avatar = this.photo;
    }
};

/**
 * 获取头像地址
 */
YYIMCacheRoster.prototype.getPhotoUrl = function(){
	return this.photo;
};

/**
 * 判断roster的类型
 */
YYIMCacheRoster.prototype.getRosterType = function(){
	if(this.id ===  YYIMChat.getUserID()){
		this.rosterType = YYIMCacheConfig.ROSTER_TYPE.MYSELF;

	}else if(this.subscription === YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.BOTH){
		this.rosterType = YYIMCacheConfig.ROSTER_TYPE.FRIEND;
		
	}else if(this.subscription === YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.NONE && this.ask === 1){
		this.rosterType = YYIMCacheConfig.ROSTER_TYPE.ASK;
		
	}else if(this.subscription === YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.NONE && this.recv === 1){
		this.rosterType = YYIMCacheConfig.ROSTER_TYPE.RECV;
		
	}else{
		this.rosterType = YYIMCacheConfig.ROSTER_TYPE.NONE;
	}
	return this.rosterType;
};

function YYIMCacheRosterManager(){
	this.init();
}

YYIMCacheRosterManager.prototype = new YYIMCacheList();

YYIMCacheRosterManager.getInstance = function(){
	if(!this._instance){
		this._instance = new YYIMCacheRosterManager();
	}
	return this._instance;
};

YYIMCacheRosterManager.prototype.build = function(arg){
	this.enableVCardFields = YYIMUtil['isWhateType'](arg.enableVCardFields, 'Array')? arg.enableVCardFields: this.enableVCardFields || [];
};

YYIMCacheRosterManager.prototype.init = function(){
	this.updateCache({
		id:YYIMChat.getUserID()
	});
	
	this.build({});
	this.getRostersPresence();
};

/**
 * 创建、更新联系人信息
 * arg {	
 * 		id,name,ask,recv,resource,subscription,group,photo,
 *	}
 */
YYIMCacheRosterManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id){
		var roster = this.get(arg.id);
		if(!!roster){
			roster.build(arg);
		}else{
			roster = new YYIMCacheRoster(arg);
			this.set(roster.id,roster);	
		}
		return roster;
	}
};

/**
 * 发送添加好友请求
 * @param {Object} id
 */
YYIMCacheRosterManager.prototype.addRoster = function(id){
	if(!!id){
		var roster = this.get(id);
		if(!roster || this.getRostersList('none').indexOf(roster) !== -1){
			YYIMChat.addRosterItem(id);
			this.updateCache({
				id:id,
				ask:1,
				recv:-1,
				subscription:YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.NONE
			});
		}
	}
};

/**
 * 发送删除好友请求
 * @param {Object} 
 * arg {
 * 	id:,
 *  success:function,
 *  complete:function
 * }
 */
YYIMCacheRosterManager.prototype.deleteRoster = function(arg){
	if(!!arg && this.getRostersList('friend').indexOf(this.get(arg.id)) !== -1){
		var that = this;
		YYIMChat.deleteRosterItem({
			id:arg.id,
			success:function(){
				that.updateCache({
					id:arg.id,
					ask:-1,
					recv:-1,
					subscription:YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.NONE
				});
				arg.success && arg.success();
			},
			complete:function(){
				arg.complete && arg.complete();
			}
		});
	}
};

/**
 * 同意添加好友请求
 */
YYIMCacheRosterManager.prototype.approveRoster = function(id){
	if(!!id && this.getRostersList('recv').indexOf(this.get(id)) !== -1){
		YYIMChat.approveSubscribe(id);
		this.updateCache({
			id:id,
			ask:-1,
			recv:-1,
			subscription:YYIMCacheConfig.ROSTER_SUBSCRIPTION_TYPE.BOTH
		});
	}
};

/**
 * 删除联系人 (暂时用不到)
 * @param {Object} id
 */
YYIMCacheRosterManager.prototype.removeRoster = function(id){
	this.remove(id);
};

/**
 * 更新联系人在线状态
 * @param {Object} 
 * arg {
 * 	from:,
 *  resource:,
 *  show:
 * }
 */
YYIMCacheRosterManager.prototype.updatePresence = function(arg){
	if(!!arg && (arg.from || arg.id)){
		var roster = this.get(arg.from || arg.id);
		if(!!roster){
			roster.updatePresence(arg);
		}
	}
};

/**
 * 批量获取联系人的在线状态
 */
YYIMCacheRosterManager.prototype.getRostersPresence = function(){
	var that = this;
    setTimeout(function(){
    	var keys = [];
    	for(var x in this.list){
    		if(!!this.get(x).id){
    			keys.push(this.get(x).id);
    		}
    	}
		if(keys.length){
			YYIMChat.getRostersPresence({
				username: keys,
				success:function(data){
					for(var x in data){
						var presence = data[x].presence;
						for(var y in presence){
							if(presence[y].available){
								that.updatePresence({
									id:data[x].userid,
									resource: presence[y].device,
									show: presence[y].show
								});
							}
						}
					}
				}
			});
		}
    },500);
};

/**
 * 修改本人vcard
 * @param {Object} 
 * arg {
 * 		vcard : {
 * 			nickname,
 * 			photo,
 * 			email,
 * 			mobile,
 * 			telephone
 * 		},
 * 		success : function,
 * 		error : fcuntion
 * }
 */
YYIMCacheRosterManager.prototype.setVCard = function(arg){
	var roster = this.get(YYIMChat.getUserID());
	if(!!roster){
		roster.setVCard(arg);	
	}
};


/**
 * 修改好友备注
 * @param {Object} 
 * arg {
 * 	roster:{
 *		id:String, //联系人id
 * 		name:String,//新的备注姓名
 * 		group:[] //新的分组(数组)
 *  },
 *  success:function,
 *  error:function 
 * }
 */
YYIMCacheRosterManager.prototype.setRemark = function(arg){
	if(!!arg && arg.roster && arg.roster.id){
		var roster = this.get(arg.roster.id);
		if(!!roster){
			roster.setRemark(arg);	
		}
	}
};

/**
 * 获取联系人(自己，好友，请求的，被请求的，陌生人)列表
 * @param {Object} 
 * key 空：全部列表，myself：自己，friend：好友，ask：发送请求的，recv：被请求的，none：陌生人
 */
YYIMCacheRosterManager.prototype.getRostersList = function(key){
	var list = this.get();
	var tempList = [];
	for(var x in list){
		if(typeof key === 'undefined'){
			tempList.push(list[x]);
			continue;
		}
		if(list[x].rosterType === key){
			tempList.push(list[x]);
	    }
	}
	return tempList;	
};

YYIMCacheRosterManager.prototype.destory = function(){
	this.enableVCardFields.length = 0;
	this.clear();
};

function YYIMCacheVCard(arg){
	this.build(arg);
}

YYIMCacheVCard.prototype.build = function(arg){
	this.id = arg.id || arg.userId || arg.member_id || this.id;
	this.name = arg.name || arg.nickname || this.name;
	this.email = arg.email || this.email;
	this.photo = arg.photo || this.photo;
	this.sysInfo();
};

YYIMCacheVCard.prototype.sysInfo = function(arg){
	if(!this.photo){
		this.photo = YYIMCacheConfig.DEFAULT_PHOTO.ROSTER;
	}
	
	if(this.photo.indexOf('http://') == -1 && this.photo.indexOf('https://') == -1){
		this.photo = BusinessInterfaceConfig.STATICADDRESS + this.photo;
	}
	
	this.avatar = this.photo;
};
	

function YYIMCacheFoldedRecent(arg){
	this.list = {};
	this.recentTopList = [];
	this.recentNormalList = [];
	this.recentList = [];
	this.stick = false;
	this.spaceIds = [];
	this.type = YYIMCacheConfig.RECENT_TYPE.FOLDED;
	this.build(arg);
}

YYIMCacheFoldedRecent.prototype = new YYIMCacheList();

YYIMCacheFoldedRecent.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || this.name || this.id;
	
	this.updateCache(arg.entity);
	this.syncInfo();
};

YYIMCacheFoldedRecent.prototype.getSpaceAttributes = function(){
	var list = this.getRecentList();
	this.notice = 0;
	this.dateline = 0;
	for(var x in list){
		if(list[x].notice){
			this.notice += list[x].notice; 				
		}
		
		if(list[x].dateline > this.dateline){
			this.dateline = list[x].dateline; 				
		}
	}
};

YYIMCacheFoldedRecent.prototype.syncInfo = function(){
	this.getSpaceAttributes();
};

YYIMCacheFoldedRecent.prototype.updateCache = function(arg){
	if(arg && arg.id){
		
		var manager,entity,recent;
		switch(arg.type){
			case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
			     entity = YYIMCacheGroupManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCacheGroupManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name
					});		     	
			     }
				 break;
			case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
			 	 entity = YYIMCachePubAccountManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCachePubAccountManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name,
						group: arg.from.group
					});		     	
			     }
				 break;
			default: 
				 entity = YYIMCacheRosterManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCacheRosterManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name
					});		     	
			     }
				 break;
		}
		
		if(!entity){
			return;
		}
		
		var recent = this.get(arg.id);
		
		if(!!recent && YYIMUtil['isWhateType'](arg.stick, 'Boolean') && arg.stick !== recent.stick && arg.stick === entity.stick){ //设置 置顶
			recent.stick = arg.stick;
			arg = recent;
			this.remove(arg.id);
			recent = null;
		}
		
		if(!!recent){
			recent.build(arg);
			
			var targetList = this.recentNormalList;
			
			if(recent.stick){
				targetList = this.recentTopList;
			}
			
			if(arg.sort){
				if(targetList.indexOf(recent)>-1){
					if(targetList.indexOf(recent)!=0){
						targetList.splice(targetList.indexOf(recent),1);
						targetList.unshift(recent);
					}
				}
			}
		}else{
			arg.parent = this;
			recent = new YYIMCacheRecent(arg);
			
			var manager;
			if(recent.type === YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT){
				manager = YYIMCacheGroupManager.getInstance();
			}else if(recent.type === YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
				manager = YYIMCachePubAccountManager.getInstance();
			}else{
				manager = YYIMCacheRosterManager.getInstance();
			}
			
			if(!manager.get(recent.id)){
				return;
			}
			
			this.set(recent.id,recent);
			
			var targetList = this.recentNormalList;
			if(recent.stick){
				targetList = this.recentTopList;
			}
			targetList.unshift(recent);
		}
		
		this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
		this.recentList = this.recentTopList.concat(this.recentNormalList);
		
		if(!!recent.from.spaceId){
			if(this.spaceIds.indexOf(recent.from.spaceId) == -1){
				this.spaceIds.push(recent.from.spaceId);
			}
		}
		
		return recent;	
	}
};

YYIMCacheFoldedRecent.prototype.remove = function(key){
	if(!!key){
		var recent = this.get(key);
		if(!!recent){
			delete this.list[key];                                             
			if(this.recentTopList.indexOf(recent) > -1){
				this.recentTopList.splice(this.recentTopList.indexOf(recent),1);
			}
			
			if(this.recentNormalList.indexOf(recent) > -1){
				this.recentNormalList.splice(this.recentNormalList.indexOf(recent),1);
			}
			this.recentList = this.recentTopList.concat(this.recentNormalList);
		}
	}
};

YYIMCacheFoldedRecent.prototype.getAllRecentList = function(){
	return this.list;
};

YYIMCacheFoldedRecent.prototype.getRecentList = function(){
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
			|| !this.recentList[x].spaceId 
			|| this.recentList[x].spaceId == currentSpaceId){
			list.push(this.recentList[x]);
		}
	}
	return list;
};

YYIMCacheFoldedRecent.prototype.queryRecentList = function(key){
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
			|| !this.recentList[x].spaceId 
			|| this.recentList[x].spaceId == currentSpaceId){
				
			var entity = this.recentList[x].from;
			if((entity.name && entity.name.indexOf(key) >-1) 
				|| (entity.vcard && entity.vcard.mobile && entity.vcard.mobile.indexOf(key) >-1)){
					list.push(this.recentList[x]);
			}
		}
	}
	return list;
};

YYIMCacheFoldedRecent.prototype.getListByChatType = function(type){
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(!type || this.recentList[x].type == type){
			if(!this.recentList[x].spaceId 
				|| this.recentList[x].spaceId == currentSpaceId){
				list.push(this.recentList[x]);
			}
		} 
	}
	return list;
};

YYIMCacheFoldedRecent.prototype.getPhotoUrl = function(){
	return YYIMCacheConfig.DEFAULT_PHOTO.PUBACCOUNTFOLDED;	
};

function YYIMCacheRecent(arg){
	this.build(arg);
}

YYIMCacheRecent.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name =  arg.name || this.name || this.id;
	this.dateline = arg.dateline || arg.lastContactTime || this.dateline;
	this.type = arg.type || this.type;
	this.latestState = arg.latestState || this.latestState;
	this.lastMessage = arg.lastMessage || this.lastMessage;
	this.contentType = arg.contentType || this.contentType;
	
	this.readedVersion = this.readedVersion || 0;
	this.sessionVersion = this.sessionVersion || 0;
	
	this.parent = arg.parent || this.parent;
	this.isHaveAt = YYIMUtil['isWhateType'](arg.isHaveAt, 'Boolean')? arg.isHaveAt: !!this.isHaveAt; 
	
	this.syncInfo(arg);
};

YYIMCacheRecent.prototype.syncInfo = function(arg){
	
	this.readedVersion = (arg.readedVersion >= this.readedVersion)? Number(arg.readedVersion): this.readedVersion;
	this.sessionVersion = (arg.sessionVersion >= this.sessionVersion)? Number(arg.sessionVersion): this.sessionVersion;
	
	this.readedVersion = this.readedVersion > this.sessionVersion?  this.sessionVersion: this.readedVersion;
	
	if(this.originVersion == undefined){
		this.originVersion = this.sessionVersion;
	}
	
	if(!this.from){
		switch(this.type){
			case YYIMCacheConfig.CHAT_TYPE.CHAT: 
				 this.from = YYIMCacheRosterManager.getInstance().updateCache({id: this.id});
			     if(!this.from.loadedInfo && arg && arg.from){
					this.from = YYIMCacheRosterManager.getInstance().updateCache({
						id: this.id,
						name: arg.from.name
					});		     	
			     }
				 break;
			case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
			     this.from = YYIMCacheGroupManager.getInstance().updateCache({id: this.id});
			     if(!this.from.loadedInfo && arg && arg.from){
					this.from = YYIMCacheGroupManager.getInstance().updateCache({
						id: this.id,
						name: arg.from.name
					});		     	
			     }
				 break;
			case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
			 	 this.from = YYIMCachePubAccountManager.getInstance().updateCache({id: this.id});
			     if(!this.from.loadedInfo && arg && arg.from){
					this.from = YYIMCachePubAccountManager.getInstance().updateCache({
						id: this.id,
						name: arg.from.name,
						group: arg.from.group
					});		     	
			     }
				 break;
			default:break;
		}
	}
	
	if(!!this.from){
		this.mute = this.from.mute;		
		this.stick = this.from.stick;
		this.spaceId = this.from.spaceId;
	}
	
	if(!!this.from && this.from.name !== this.from.id){
		this.name = this.from.name;
	}
	
	if(!!this.lastMessage){
		this.latestState = this.lastMessage.data;
		if(this.lastMessage.data){
			this.dateline = this.lastMessage.data.dateline || this.dateline; 
		}
		if(!!this.lastMessage && this.lastMessage.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.REVOCATION){
			var message = YYIMCacheMessageManager.getInstance().updateCache(this.lastMessage);
			var entity = message.fromRoster || message.from;
			this.latestState = entity.name + '撤回了一条消息';
			if(entity.id == YYIMChat.getUserID()){
				this.latestState = '您撤回了一条消息';
			}
			this.showState = this.latestState;
			this.lastMessage = null;
			return;
		}
		this.lastMessage = null;
	}
	
	this.notice = Math.abs(this.sessionVersion - this.readedVersion);
	
	if(!!this.latestState){
		if(typeof this.latestState != 'string'){
			this.contentType = this.contentType || this.latestState.contentType;
		}
		
		switch(this.contentType){
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE: this.showState = '[文件]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.IMAGE: this.showState = '[图片]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.SYSTEM: 
				try{
					if(typeof this.latestState != 'string'){
						this.showState = this.latestState.content.title;
					}else{
						this.showState = this.latestState;
					}
				}catch(e){
					this.showState = '[单图文]';
				}
				break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.PUBLIC: 
				try{
					if(typeof this.latestState != 'string'){
						this.showState = this.latestState.content[0].title;
					}else{
						this.showState = this.latestState;
					}
				}catch(e){
					this.showState = '[多图文]';
				}
				break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.SMALLVIDEO: this.showState = '[小视频]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.AUDO: this.showState = '[音频]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.LOCATION: this.showState = '[位置]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.SHARE: this.showState = '[分享]'; break;
			case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.WHITEBOARD: this.showState = '[白板]'; break;
			default: 
				if(!!this.latestState){
					this.showState = null;
					if(typeof this.latestState != 'string'){
						if(!!this.latestState.atContent){
							this.showState = this.latestState.atContent;
						}
						this.latestState = this.latestState.content;
						this.showState = this.showState || this.latestState;
						break;
				    }
					this.showState = this.latestState;
				}
		}
	}
};

function YYIMCacheRecentManager(spaceId){
	this.recentTopList = [];
	this.recentNormalList = [];
	this.recentList = [];
	this.spaceId = spaceId;
	this.init();
}

YYIMCacheRecentManager.prototype = new YYIMCacheList();

YYIMCacheRecentManager.getInstance = function(spaceId){
	if(!this._instance){
		this._instance = new YYIMCacheRecentManager();
	}
	
	this._instance.spaceId = spaceId;
	return this._instance;
};

YYIMCacheRecentManager.prototype.init = function(){
	var that = this;
	jQuery(window).on('unload',function() {
		that.save();
	});
};

YYIMCacheRecentManager.prototype.getRecentDigset = function(arg){
	arg = arg || {};
	var that = this;
	
	var version = ScriptUtil['localstorage']['getItem']('IMCHATVERSION_' + YYIMChat.getUserNode()) || '';
	if(YYIMCacheConfig.IMCHATVERSION && version != YYIMCacheConfig.IMCHATVERSION){
		ScriptUtil['localstorage']['removeItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('RECENTDATA_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('GROUPDATA_' + YYIMChat.getUserNode());
		
		ScriptUtil['localstorage']['setItem']('IMCHATVERSION_' + YYIMChat.getUserNode(),YYIMCacheConfig.IMCHATVERSION);	
	}
	
	
	var storaged = ScriptUtil['localstorage']['getItem']('RECENTDATA_' + YYIMChat.getUserNode()) || '';
	
	var pubIds = [],tempRecents = {};
	try{
		storaged = JSON.parse(storaged);
		for(x in storaged){
			if(storaged[x].type == YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
				if(pubIds.indexOf(storaged[x].id) == -1){
					pubIds.push(storaged[x].id);
					tempRecents[storaged[x].id] = storaged[x];
				}
			}
			that.updateCache(storaged[x]);
		}
	}catch(e){
		ScriptUtil['localstorage']['setItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode(),0);
	}
	
	YYIMCacheGroupManager.getInstance().initLocal({
		success: function(){
			YYIMChat.getRecentDigset({
				startDate: Number(ScriptUtil['localstorage']['getItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode())) || 0,
				success: function(data){
					ScriptUtil['localstorage']['setItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode(),data.ts);
					
					for(var y in data.list){
						if(data.list[y].type == YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
							if(pubIds.indexOf(data.list[y].id) == -1){
								pubIds.push(data.list[y].id);
								tempRecents[data.list[y].id] = data.list[y];
							}
						}
						that.updateCache(data.list[y]);
					}
					
					if(pubIds.length){
						YYIMChat.getPubAccounts({
							pubIds: pubIds,
							success: function(result){
								for(var z in result){
									result[z].loadedInfo = true;
									YYIMCachePubAccountManager.getInstance().updateCache(result[z]);
									var recent = that.get(result[z].id);
									if(!!recent){
										that.remove(recent.id);
										that.updateCache(recent);
									}
								}
								
								YYIMCacheProfileManager.getProfile({
									success: function(){
										arg.success && arg.success(true);
									}
								});
							}
						});
					}else{
						YYIMCacheProfileManager.getProfile({
							success: function(){
								arg.success && arg.success(true);
							}
						});
					}
				},
				error: function(message){
					YYIMChat.log('拉取摘要失败',0,message);
					arg.error && arg.error(message);
				}
			});
		}
	});
	
	
};



YYIMCacheRecentManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id && arg.id != YYIMChat.getUserID()){
		
		var manager,entity,recent,mode = YYIMCacheConfig.RECENT_TYPE.UNFOLDED;
		
		switch(arg.type){
			case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
			     entity = YYIMCacheGroupManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCacheGroupManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name
					});		     	
			     }
				 break;
			case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
			 	 entity = YYIMCachePubAccountManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCachePubAccountManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name,
						group: arg.from.group
					});		     	
			     }
				 break;
			default: 
				 entity = YYIMCacheRosterManager.getInstance().updateCache({id: arg.id});
			     if(!entity.loadedInfo && arg && arg.from){
					entity = YYIMCacheRosterManager.getInstance().updateCache({
						id: arg.id,
						name: arg.from.name
					});		     	
			     }
				 break;
		}
		
		if(!entity){
			return;
		}
		
		if(!!entity.group && arg.type === YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
			mode = YYIMCacheConfig.RECENT_TYPE.FOLDED;
			recent = this.get(encodeURIComponent(entity.group));
		}else{
			recent = this.get(entity.id);
			
			if(!!recent && YYIMUtil['isWhateType'](arg.stick, 'Boolean') && arg.stick !== recent.stick && arg.stick === entity.stick){ //设置 置顶
				recent.stick = arg.stick;
				arg = recent;
				this.remove(arg.id);
				recent = null;
			}
		}
		
		if(!!recent){
			if(mode == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				recent.build({
					id: encodeURIComponent(entity.group),
					name: entity.group,
					entity: arg
				});
			}else{
				recent.build(arg);
			}
			
			var targetList = this.recentNormalList;
			
			if(recent.stick){
				targetList = this.recentTopList;
			}
			
			if(arg.sort){
				if(targetList.indexOf(recent)>-1){
					if(targetList.indexOf(recent)!=0){
						targetList.splice(targetList.indexOf(recent),1);
						targetList.unshift(recent);
					}
				}
			}
		}else{
			
			if(mode == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				recent = new YYIMCacheFoldedRecent({
					id: encodeURIComponent(entity.group),
					name: entity.group,
					entity: arg
				});
			}else{
				recent = new YYIMCacheRecent(arg);
			}
			
			this.set(recent.id,recent);
			
			var targetList = this.recentNormalList;
			if(recent.stick){
				targetList = this.recentTopList;
			}
			targetList.unshift(recent);
		}
		
		this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
		this.recentList = this.recentTopList.concat(this.recentNormalList);
		
		this.countNotices(recent);
		
//		this.save();
		return recent;
	}
};

YYIMCacheRecentManager.prototype.updateFoldedAttibutes = function(recent){
	this.forEach(function(index,item,list){
		if(item.type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			item.getSpaceAttributes();
		}
	});
};

YYIMCacheRecentManager.prototype.countNotices = function(recent){
	if(recent && recent.spaceId){
		YYIMCacheSpaceManager.getInstance().updateCache({
			id: recent.spaceId
		});
	}
	
	var totalNum = 0; 
	var recentList = this.getAllRecentList();
	YYIMCacheSpaceManager.getInstance().forEach(function(index,item){
		item.build({
			unReadedNum: 0,
			unReadedTotalNum: 0
		});
		
		for(var x in recentList){
			if(!!recentList[x].from && recentList[x].type != YYIMCacheConfig.RECENT_TYPE.FOLDED){
				if(!recentList[x].from.pubType || recentList[x].from.pubType == YYIMCacheBusinessConfig.PUBACCOUNTTYPE.PUBACCOUNT.name){
					if(!recentList[x].spaceId){
						item.unReadedTotalNum += recentList[x].notice;
					}else if(recentList[x].spaceId == item.id){
						item.unReadedNum += recentList[x].notice;
						item.unReadedTotalNum += recentList[x].notice;
					}
				}
			}
		}
		
		totalNum += item.unReadedNum; 
		
		if(item.unReadedNum > 0){
			var obj = {};
			obj[item.id] = item.unReadedNum;
			jQuery(document).trigger('getSpaceMsgNum.EucIM',[obj]);
		}
	});
	
	YYIMCacheSpaceManager.getInstance().forEach(function(index,item){
		item.build({unReadedOtherTotalNum: totalNum - item.unReadedNum});
	});
};

YYIMCacheRecentManager.prototype.remove = function(key){
	if(!!key){
		var recent = this.get(key);
		if(!!recent){
			delete this.list[key];
			if(this.recentTopList.indexOf(recent) > -1){
				this.recentTopList.splice(this.recentTopList.indexOf(recent),1);
			}
			
			if(this.recentNormalList.indexOf(recent) > -1){
				this.recentNormalList.splice(this.recentNormalList.indexOf(recent),1);
			}
			this.recentList = this.recentTopList.concat(this.recentNormalList);
			
			this.save();
			this.countNotices();
		}
	}
};

YYIMCacheRecentManager.prototype.getRecentList = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			if(this.recentList[x].spaceIds.indexOf(this.spaceId) > -1){
				list.push(this.recentList[x]);
			}
		}else{
			if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
				|| !this.recentList[x].spaceId 
				|| this.recentList[x].spaceId == this.spaceId){
				list.push(this.recentList[x]);
			}
		}
	}
	return list;
};

YYIMCacheRecentManager.prototype.get = function(id){
	if(!!id){
		var list = this.getAllRecentList();
		return list[id];
	}
};

YYIMCacheRecentManager.prototype.getAllRecentList = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = {};
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			var foldList = this.recentList[x].getAllRecentList();
			for(var y in foldList){
				if(!!foldList[y].id){
					list[foldList[y].id] = foldList[y];
				}
			}
		}
		list[this.recentList[x].id] = this.recentList[x];
	}
	return list;
};

YYIMCacheRecentManager.prototype.queryRecentList = function(key){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			list = list.concat(this.recentList[x].queryRecentList(key));
		}else{
			if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
				|| !this.recentList[x].spaceId 
				|| this.recentList[x].spaceId == this.spaceId){
					
				var entity = this.recentList[x].from;
				if((entity.name && entity.name.indexOf(key) > -1) 
					|| (entity.vcard && entity.vcard.mobile && entity.vcard.mobile.indexOf(key) > -1)){
						list.push(this.recentList[x]);
				}
			}
		}
	}
	return list;
};

/**
 * 分类获取最近联系人列表
 * @param {Object} type 'chat'/'groupchat'/'pubaccount'
 */
YYIMCacheRecentManager.prototype.getListByChatType = function(type){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			list = list.concat(this.recentList[x].getListByChatType());
		}else{
			if(!type || this.recentList[x].type == type){
				if(!this.recentList[x].spaceId 
					|| this.recentList[x].spaceId == this.spaceId){
					list.push(this.recentList[x]);
				}
			} 
		}
	}
	return list;
};

YYIMCacheRecentManager.prototype.save = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	var recentList = this.recentTopList.concat(this.recentNormalList);
	var target = [];
	for(var x in recentList){
		var recent = recentList[x];
		if(recent.id){
			if(recent.type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				var foldList = recent.recentTopList.concat(recent.recentNormalList);
				for(var y in foldList){
					if(foldList[y].id){
						target.unshift({
							id: foldList[y].id,
							name: foldList[y].name,
							from: {
								id: foldList[y].id,
								name: foldList[y].from.name,
								group: foldList[y].from.group
							},
							type: foldList[y].type,
							contentType: foldList[y].contentType,
							readedVersion: foldList[y].readedVersion,
							sessionVersion: foldList[y].sessionVersion,
							mute: foldList[y].mute,
							stick: foldList[y].stick,
							latestState: foldList[y].showState,
							dateline: foldList[y].dateline
						});		
					}
				}
			}else{
				target.unshift({
					id: recent.id,
					name: recent.name,
					from: {
						id: recent.id,
						name: recent.from.name,
						group: recent.from.group
					},
					type: recent.type,
					contentType: recent.contentType,
					readedVersion: recent.readedVersion,
					sessionVersion: recent.sessionVersion,
					mute: recent.mute,
					stick: recent.stick,
					latestState: recent.showState,
					dateline: recent.dateline
				});			
			}
		}
	}
	
	ScriptUtil['localstorage']['setItem']('RECENTDATA_' + YYIMChat.getUserNode(),JSON.stringify(target));
};

YYIMCacheRecentManager.prototype.destory = function(){
	this.save();
	this.recentTopList.length = 0;
	this.recentNormalList.length = 0;
	this.recentList.length = 0;
	this.spaceId = null;
	this.clear();
};


function YYIMCacheSpace(arg){
	this.build(arg);
}

YYIMCacheSpace.prototype.build = function(arg){
	this.id = arg.id || this.id;
	this.name = arg.name || this.name;
	this.type = arg.type || this.type || YYIMCacheBusinessConfig.SPACETYPE.NORMAL;
	this.unReadedNum = YYIMUtil['isWhateType'](arg.unReadedNum, 'Number')? arg.unReadedNum: this.unReadedNum || 0;//空间未读
	this.unReadedTotalNum = YYIMUtil['isWhateType'](arg.unReadedTotalNum, 'Number')? arg.unReadedTotalNum: this.unReadedTotalNum || 0;//空间未读
	this.unReadedOtherTotalNum = YYIMUtil['isWhateType'](arg.unReadedOtherTotalNum, 'Number')? arg.unReadedOtherTotalNum: this.unReadedOtherTotalNum || 0;//空间未读
};

YYIMCacheSpace.prototype.getRecentManager = function() {
	return YYIMCacheRecentManager.getInstance(this.id);
};

YYIMCacheSpace.prototype.getGroupManager = function() {
	return YYIMCacheGroupManager.getInstance(this.id);
};

YYIMCacheSpace.prototype.getPubAccountManager = function() {
	return YYIMCachePubAccountManager.getInstance(this.id);
};

YYIMCacheSpace.prototype.getRosterManager = function() {
	return YYIMCacheRosterManager.getInstance();
};

YYIMCacheSpace.prototype.getMessageManager = function() {
	return YYIMCacheMessageManager.getInstance();
};

YYIMCacheSpace.prototype.getProfileManager = function() {
	return YYIMCacheProfileManager;
};

YYIMCacheSpace.prototype.destory = function() {
	this.getRecentManager().destory();
	this.getGroupManager().destory();
	this.getPubAccountManager().destory();
	this.getRosterManager().destory();
	this.getMessageManager().destory();
};

function YYIMCacheSpaceManager(arg){
}

YYIMCacheSpaceManager.prototype = new YYIMCacheList();

YYIMCacheSpaceManager.getInstance = function(){
	if(!this._instance){
		this._instance = new YYIMCacheSpaceManager();
	}
	return this._instance;
};

YYIMCacheSpaceManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id){
		var space = this.get(arg.id);
		if(!!space){
			space.build(arg);
		}else{
			space = new YYIMCacheSpace(arg);
			this.set(space.id,space);	
		}
		return space;
	}
};

YYIMCacheSpaceManager.prototype.setBaseUrl = function(address,staticAddress){
	BusinessInterfaceConfig.ADDRESS = address || BusinessInterfaceConfig.ADDRESS;
	BusinessInterfaceConfig.STATICADDRESS = staticAddress || BusinessInterfaceConfig.STATICADDRESS;
};

YYIMCacheSpaceManager.prototype.getBaseUrl = function(route){
	return BusinessInterfaceConfig.ADDRESS;
};

YYIMCacheSpaceManager.prototype.destory = function(){
	this.updateCache({id: currentSpaceId}).destory();
};

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

	return YYIMCacheSpaceManager.getInstance();
})();