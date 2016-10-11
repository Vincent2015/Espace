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
