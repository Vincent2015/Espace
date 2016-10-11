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
