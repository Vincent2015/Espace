function YYIMCacheRecentManager(spaceId){
	this.recentTopList = [];
	this.recentNormalList = [];
	this.recentList = [];
	this.spaceId = spaceId;
	this.init();
}

YYIMCacheRecentManager.prototype = new YYIMCacheList();

YYIMCacheRecentManager.getInstance = function(spaceId){
	if(!this._instance){
		this._instance = new YYIMCacheRecentManager();
	}
	
	this._instance.spaceId = spaceId;
	return this._instance;
};

YYIMCacheRecentManager.prototype.init = function(){
	var that = this;
	jQuery(window).on('unload',function() {
		that.save();
	});
};

YYIMCacheRecentManager.prototype.getRecentDigset = function(arg){
	arg = arg || {};
	var that = this;
	
	var version = ScriptUtil['localstorage']['getItem']('IMCHATVERSION_' + YYIMChat.getUserNode()) || '';
	if(YYIMCacheConfig.IMCHATVERSION && version != YYIMCacheConfig.IMCHATVERSION){
		ScriptUtil['localstorage']['removeItem']('GROUPTIMESTAMP_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('RECENTDATA_' + YYIMChat.getUserNode());
		ScriptUtil['localstorage']['removeItem']('GROUPDATA_' + YYIMChat.getUserNode());
		
		ScriptUtil['localstorage']['setItem']('IMCHATVERSION_' + YYIMChat.getUserNode(),YYIMCacheConfig.IMCHATVERSION);	
	}
	
	
	var storaged = ScriptUtil['localstorage']['getItem']('RECENTDATA_' + YYIMChat.getUserNode()) || '';
	
	var pubIds = [],tempRecents = {};
	try{
		storaged = JSON.parse(storaged);
		for(x in storaged){
			if(storaged[x].type == YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
				if(pubIds.indexOf(storaged[x].id) == -1){
					pubIds.push(storaged[x].id);
					tempRecents[storaged[x].id] = storaged[x];
				}
			}
			that.updateCache(storaged[x]);
		}
	}catch(e){
		ScriptUtil['localstorage']['setItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode(),0);
	}
	
	YYIMCacheGroupManager.getInstance().initLocal({
		success: function(){
			YYIMChat.getRecentDigset({
				startDate: Number(ScriptUtil['localstorage']['getItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode())) || 0,
				success: function(data){
					ScriptUtil['localstorage']['setItem']('RECENTTIMESTAMP_' + YYIMChat.getUserNode(),data.ts);
					
					for(var y in data.list){
						if(data.list[y].type == YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
							if(pubIds.indexOf(data.list[y].id) == -1){
								pubIds.push(data.list[y].id);
								tempRecents[data.list[y].id] = data.list[y];
							}
						}
						that.updateCache(data.list[y]);
					}
					
					if(pubIds.length){
						YYIMChat.getPubAccounts({
							pubIds: pubIds,
							success: function(result){
								for(var z in result){
									result[z].loadedInfo = true;
									YYIMCachePubAccountManager.getInstance().updateCache(result[z]);
									var recent = that.get(result[z].id);
									if(!!recent){
										that.remove(recent.id);
										that.updateCache(recent);
									}
								}
								
								YYIMCacheProfileManager.getProfile({
									success: function(){
										arg.success && arg.success(true);
									}
								});
							}
						});
					}else{
						YYIMCacheProfileManager.getProfile({
							success: function(){
								arg.success && arg.success(true);
							}
						});
					}
				},
				error: function(message){
					YYIMChat.log('拉取摘要失败',0,message);
					arg.error && arg.error(message);
				}
			});
		}
	});
	
	
};



YYIMCacheRecentManager.prototype.updateCache = function(arg){
	if(!!arg && arg.id && arg.id != YYIMChat.getUserID()){
		
		var manager,entity,recent,mode = YYIMCacheConfig.RECENT_TYPE.UNFOLDED;
		
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
		
		if(!!entity.group && arg.type === YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT){
			mode = YYIMCacheConfig.RECENT_TYPE.FOLDED;
			recent = this.get(encodeURIComponent(entity.group));
		}else{
			recent = this.get(entity.id);
			
			if(!!recent && YYIMUtil['isWhateType'](arg.stick, 'Boolean') && arg.stick !== recent.stick && arg.stick === entity.stick){ //设置 置顶
				recent.stick = arg.stick;
				arg = recent;
				this.remove(arg.id);
				recent = null;
			}
		}
		
		if(!!recent){
			if(mode == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				recent.build({
					id: encodeURIComponent(entity.group),
					name: entity.group,
					entity: arg
				});
			}else{
				recent.build(arg);
			}
			
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
			
			if(mode == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				recent = new YYIMCacheFoldedRecent({
					id: encodeURIComponent(entity.group),
					name: entity.group,
					entity: arg
				});
			}else{
				recent = new YYIMCacheRecent(arg);
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
		
		this.countNotices(recent);
		
//		this.save();
		return recent;
	}
};

YYIMCacheRecentManager.prototype.updateFoldedAttibutes = function(recent){
	this.forEach(function(index,item,list){
		if(item.type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			item.getSpaceAttributes();
		}
	});
};

YYIMCacheRecentManager.prototype.countNotices = function(recent){
	if(recent && recent.spaceId){
		YYIMCacheSpaceManager.getInstance().updateCache({
			id: recent.spaceId
		});
	}
	
	var totalNum = 0; 
	var recentList = this.getAllRecentList();
	YYIMCacheSpaceManager.getInstance().forEach(function(index,item){
		item.build({
			unReadedNum: 0,
			unReadedTotalNum: 0
		});
		
		for(var x in recentList){
			if(!!recentList[x].from && recentList[x].type != YYIMCacheConfig.RECENT_TYPE.FOLDED){
				if(!recentList[x].from.pubType || recentList[x].from.pubType == YYIMCacheBusinessConfig.PUBACCOUNTTYPE.PUBACCOUNT.name){
					if(!recentList[x].spaceId){
						item.unReadedTotalNum += recentList[x].notice;
					}else if(recentList[x].spaceId == item.id){
						item.unReadedNum += recentList[x].notice;
						item.unReadedTotalNum += recentList[x].notice;
					}
				}
			}
		}
		
		totalNum += item.unReadedNum; 
		
		if(item.unReadedNum > 0){
			var obj = {};
			obj[item.id] = item.unReadedNum;
			jQuery(document).trigger('getSpaceMsgNum.EucIM',[obj]);
		}
	});
	
	YYIMCacheSpaceManager.getInstance().forEach(function(index,item){
		item.build({unReadedOtherTotalNum: totalNum - item.unReadedNum});
	});
};

YYIMCacheRecentManager.prototype.remove = function(key){
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
			
			this.save();
			this.countNotices();
		}
	}
};

YYIMCacheRecentManager.prototype.getRecentList = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			if(this.recentList[x].spaceIds.indexOf(this.spaceId) > -1){
				list.push(this.recentList[x]);
			}
		}else{
			if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
				|| !this.recentList[x].spaceId 
				|| this.recentList[x].spaceId == this.spaceId){
				list.push(this.recentList[x]);
			}
		}
	}
	return list;
};

YYIMCacheRecentManager.prototype.get = function(id){
	if(!!id){
		var list = this.getAllRecentList();
		return list[id];
	}
};

YYIMCacheRecentManager.prototype.getAllRecentList = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = {};
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			var foldList = this.recentList[x].getAllRecentList();
			for(var y in foldList){
				if(!!foldList[y].id){
					list[foldList[y].id] = foldList[y];
				}
			}
		}
		list[this.recentList[x].id] = this.recentList[x];
	}
	return list;
};

YYIMCacheRecentManager.prototype.queryRecentList = function(key){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			list = list.concat(this.recentList[x].queryRecentList(key));
		}else{
			if(this.recentList[x].type == YYIMCacheConfig.CHAT_TYPE.CHAT 
				|| !this.recentList[x].spaceId 
				|| this.recentList[x].spaceId == this.spaceId){
					
				var entity = this.recentList[x].from;
				if((entity.name && entity.name.indexOf(key) > -1) 
					|| (entity.vcard && entity.vcard.mobile && entity.vcard.mobile.indexOf(key) > -1)){
						list.push(this.recentList[x]);
				}
			}
		}
	}
	return list;
};

/**
 * 分类获取最近联系人列表
 * @param {Object} type 'chat'/'groupchat'/'pubaccount'
 */
YYIMCacheRecentManager.prototype.getListByChatType = function(type){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	this.recentList = this.recentTopList.concat(this.recentNormalList);
	var list = [];
	for(var x in this.recentList){
		if(this.recentList[x].type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
			list = list.concat(this.recentList[x].getListByChatType());
		}else{
			if(!type || this.recentList[x].type == type){
				if(!this.recentList[x].spaceId 
					|| this.recentList[x].spaceId == this.spaceId){
					list.push(this.recentList[x]);
				}
			} 
		}
	}
	return list;
};

YYIMCacheRecentManager.prototype.save = function(){
	this.recentNormalList.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
	var recentList = this.recentTopList.concat(this.recentNormalList);
	var target = [];
	for(var x in recentList){
		var recent = recentList[x];
		if(recent.id){
			if(recent.type == YYIMCacheConfig.RECENT_TYPE.FOLDED){
				var foldList = recent.recentTopList.concat(recent.recentNormalList);
				for(var y in foldList){
					if(foldList[y].id){
						target.unshift({
							id: foldList[y].id,
							name: foldList[y].name,
							from: {
								id: foldList[y].id,
								name: foldList[y].from.name,
								group: foldList[y].from.group
							},
							type: foldList[y].type,
							contentType: foldList[y].contentType,
							readedVersion: foldList[y].readedVersion,
							sessionVersion: foldList[y].sessionVersion,
							mute: foldList[y].mute,
							stick: foldList[y].stick,
							latestState: foldList[y].showState,
							dateline: foldList[y].dateline
						});		
					}
				}
			}else{
				target.unshift({
					id: recent.id,
					name: recent.name,
					from: {
						id: recent.id,
						name: recent.from.name,
						group: recent.from.group
					},
					type: recent.type,
					contentType: recent.contentType,
					readedVersion: recent.readedVersion,
					sessionVersion: recent.sessionVersion,
					mute: recent.mute,
					stick: recent.stick,
					latestState: recent.showState,
					dateline: recent.dateline
				});			
			}
		}
	}
	
	ScriptUtil['localstorage']['setItem']('RECENTDATA_' + YYIMChat.getUserNode(),JSON.stringify(target));
};

YYIMCacheRecentManager.prototype.destory = function(){
	this.save();
	this.recentTopList.length = 0;
	this.recentNormalList.length = 0;
	this.recentList.length = 0;
	this.spaceId = null;
	this.clear();
};

