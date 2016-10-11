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
