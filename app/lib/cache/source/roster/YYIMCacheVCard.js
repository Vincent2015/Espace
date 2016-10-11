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
	
