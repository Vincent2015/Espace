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


