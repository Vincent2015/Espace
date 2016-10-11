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