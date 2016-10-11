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
