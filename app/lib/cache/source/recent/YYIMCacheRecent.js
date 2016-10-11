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
