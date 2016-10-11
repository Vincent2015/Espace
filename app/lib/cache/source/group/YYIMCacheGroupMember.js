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
