function YYIMCacheGroupManager(){
	this.init();
}

YYIMCacheGroupManager.prototype = new YYIMCacheList();

YYIMCacheGroupManager.getInstance = function(spaceId){
	if(!this._instance){
		this._instance = new YYIMCacheGroupManager();
	}
	this._instance.spaceId = spaceId;
	return this._instance;
};

YYIMCacheGroupManager.prototype.init = function(arg){
	var that = this;
	jQuery(window).on('unload',function() {
		that.save();
	});
};

/**
 * 更新群组缓存
 * @param {Object} 
 * arg {
 * 	id,name,numberOfMembers,superLarge,collected,creater,members,photo
 * }
 */
YYIMCacheGroupManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id){
		var group = this.get(arg.id);
		if(!!group){
			group.build(arg);
		}else{
			group = new YYIMCacheGroup(arg);
			this.set(group.id,group);	
			
		}
		return group;
	}
};

/**
 * 创建群组
 * @param arg {name:,members:[],success:function,complete:function}
 */
YYIMCacheGroupManager.prototype.createChatGroup = function(arg){
	var that = this;
	YYIMChat.createChatGroup({
		name:arg.name,
		members:arg.members || [],
		success:function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 创建经销商群组
 * @param arg {name:,members:[],success:function,complete:function}
 */
YYIMCacheGroupManager.prototype.createDealerChatGroup = function(arg){
	if(this.spaceId){
		var that = this;
		YYIMChat.createChatGroup({
			to: YYIMCacheBusinessConfig.GROUPTYPE.DEALER.flag + '_' + this.spaceId + '_' + new Date().getTime(),
			name:arg.name,
			members:arg.members || [],
			success:function(data){
				arg.success && arg.success(that.updateCache(data));
			},
			complete:function(){
				arg.complete && arg.complete();
			}
		});
	}
};

/**
 * 拉取群成员
 * @param {Object} 
 * arg {
 * 	  to: String,//群组
 *    success:function,
 *    error:function,
 *    complete:function
 * }
 */
YYIMCacheGroupManager.prototype.getGroupMembers = function(arg){
	var group = this.get(arg.to);
	if(!!group){
		group.getGroupMembers(arg);
	}
};

/**
 * 转让群主
 * @param {Object} arg 
 * {to:群组,newOwner:string,success:function,error:function,complete:function}
 */
YYIMCacheGroupManager.prototype.transferChatGroup = function(arg){
	var group = this.get(arg.to);
	if(group.owner && group.owner.id === YYIMChat.getUserID()){
		var newOwner = group.get(arg.newOwner);
		if(newOwner){
			var that = this;
			YYIMChat.transferChatGroup({
				to:	arg.to || arg.id,
				newOwner: arg.newOwner,
				success: function(data){
					data.action = 'append';
					arg.success && arg.success(that.updateCache(data));
				},
				complete:function(){
					arg.complete && arg.complete();
				}
			});
		}
	}
};

/**
 * 群主解散群
 * @param {Object} arg {
 * 	to: String,
 *  success:funciton
 * }
 */
YYIMCacheGroupManager.prototype.dismissChatGroup = function(arg){
	var group = this.get(arg.to);
	var that = this;
	if(!!group && group.owner.id == YYIMChat.getUserID()){
		YYIMChat.dismissChatGroup({
			to: arg.to,
			success: function(data){
				that.remove(data.from);
				arg.success && arg.success(data.from);
			},
			error: arg.error,
			complete: arg.complete
		});
	}
};
/**
 * 转换群组
 * @param {Object} arg
 * {to:群组,newOwner:string}
 */
YYIMCacheGroupManager.prototype.transferOwner = function(arg){
	if(arg.to){
		var group = this.get(arg.to);
		if(group && arg.newOwner){
			group.transferOwner(arg.newOwner); 
		}
	}
};

/**
 * 邀请群成员
 * @param {Object} arg 
 * {to:群组,members:[],success:function,error:function,complete:function}
 */
YYIMCacheGroupManager.prototype.inviteGroupMember = function(arg){
	var that = this;
	YYIMChat.inviteGroupMember({
		to:arg.to || arg.id,
		members:arg.members || [],
		success:function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 更改群名称
 * @param {Object} arg 
 * {to:群组,name:string, success: function,complete: function}
 */
YYIMCacheGroupManager.prototype.modifyChatGroupInfo = function(arg){
	if(this.get(arg.to).owner.id === YYIMChat.getUserID()){
		var that = this;
		YYIMChat.modifyChatGroupInfo({
			to:arg.to || arg.id,
			name:arg.name,
			success:function(data){
				arg.success && arg.success(that.updateCache(data));
			},
			complete:function(){
				arg.complete && arg.complete();
			}
		});
	}
};

/**
 * 群主踢人
 * @param {Object} arg
 */
YYIMCacheGroupManager.prototype.kickGroupMember = function(arg){
	var that = this;
	YYIMChat.kickGroupMember({
		to: arg.to,
		member: arg.member,
		success: function(data){
			arg.success && arg.success(that.updateCache(data));
		},
		error: arg.error,
		complete: arg.complete
	});
};

/**
 * 被群组踢出
 * @param {Object} arg
 */
YYIMCacheGroupManager.prototype.KickedOutByGroup = function(arg){
	var group = this.get(arg.from);
	if(!!group){
		if(!arg.to || arg.to === YYIMChat.getUserID()){
			this.remove(arg.from);
		}else{
			group.removeMember(arg.to);
		}
	}
};

/**
 * 退出群组
 * {to:群组,success: function,complete: function}
 */
YYIMCacheGroupManager.prototype.exitChatGroup = function(arg){
	var that = this;
	YYIMChat.exitChatGroup({
		to:arg.to,
		success:function(data){
			that.remove(data.from);
			arg.success && arg.success(data.from);
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 收藏群组
 * @param {Object} arg
 *  {to:群组id, success: function, error: function,complete: function}
 */
YYIMCacheGroupManager.prototype.collectGroup = function(arg){
	var that = this;
	YYIMChat.collectGroup({
		to:arg.to,
		success:function(data){
			that.updateCache({id:data.from,collected:true});
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 取消收藏群组
 * @param {Object} arg
 *  {to:群组id, success: function, error: function,complete: function}
 */
YYIMCacheGroupManager.prototype.removeCollectGroup = function(arg){
	var that = this;
	YYIMChat.removeCollectGroup({
		to:arg.to,
		success:function(data){
			that.updateCache({id:data.from,collected:false});
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

YYIMCacheGroupManager.prototype.getGroupList = function(){
	var temp = [];
	for(var x in this.list){
		if(!!this.list[x].id){
			if(!this.list[x].spaceId || this.list[x].spaceId == this.spaceId){
				temp.push(this.list[x]);
			}
		}
	}
	return temp;
};

YYIMCacheGroupManager.prototype.initLocal = function(arg){
	arg = arg || {};
	
	var storaged = ScriptUtil['localstorage']['getItem']('GROUPDATA_' + YYIMChat.getUserNode());
	try{
		storaged = JSON.parse(storaged);
		for(var x in storaged){
			if(storaged[x].id){
				storaged[x].loadedInfo = true;
				this.updateCache(storaged[x]);
			}
		}
	}catch(e){
		ScriptUtil['localstorage']['setItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode(),0);
	}
	
	that = this;
	
	YYIMChat.getChatGroups({
		startDate: Number(ScriptUtil['localstorage']['getItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode())) || 0,
		success: function(data){
			ScriptUtil['localstorage']['setItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode(),data.ts);

			for(var x in data.roomItems){
				if(data.roomItems[x].id){
					data.roomItems[x].loadedInfo = true;
					that.updateCache(data.roomItems[x]);
				}
			}
			
			that.forEach(function(index,item,list){
				if(data.roomNames.indexOf(item.id) === -1){
					that.remove(item.id);
					
				}
			});
			
			arg.success && arg.success();
		}
	});
};

YYIMCacheGroupManager.prototype.save = function(){
	var target = {};
	this.forEach(function(index,item,list){
		var members = [];
		
		if(item.owner){
			members.push({
				id: item.owner.id,
				name: item.owner.name,
				photo: item.owner.photo,
				affiliation: 'owner' 
			});
		}
		
		for(var x = 0; x < 10 && x < item.members.length;x++){
			if(!item.owner || item.owner.id != item.members[x].id){
				members.push({
					id: item.members[x].id,
					name: item.members[x].name,
					photo: item.members[x].photo,
					affiliation: 'memeber' 
				});
			}
		}
		
		target[item.id] = {
			id: item.id,
			name: item.name,
			photo: item.photo,
			members: members,
			numberOfMembers: item.numberOfMembers
		};
	});
	ScriptUtil['localstorage']['setItem']('GROUPDATA_' + YYIMChat.getUserNode(),JSON.stringify(target));
};


YYIMCacheGroupManager.prototype.destory = function(){
	this.save();
	this.clear();
};




