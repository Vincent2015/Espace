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

