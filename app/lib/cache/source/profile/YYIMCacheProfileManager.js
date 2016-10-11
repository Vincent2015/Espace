var YYIMCacheProfileManager = (function(){
	
	function getProfile(arg){
		arg = arg || {};
		YYIMChat.getProfile({
			success: function(data){
				if(data && data.muteItems){
					for(var x in data.muteItems){
						if(!!data.muteItems[x].id){
							var entity = getEntity(data.muteItems[x]);
							if(!!entity){
								entity.build({
									mute: true
								});
								
								var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
								if(!!recent){
									recent.build({});
								}
							}
						}
					}
				}
				
				if(data && data.stickItems){
					for(var x in data.stickItems){
						if(!!data.stickItems[x].id){
							var entity = getEntity(data.stickItems[x]);
							if(!!entity){
								entity.build({
									stick: true
								});
								
								var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
								if(!!recent){
									YYIMCacheRecentManager.getInstance().updateCache({
										id: entity.id,
										type: recent.type,
										stick: true
									});
								}
							}
						}
					}
				}
				
				arg.success && arg.success(data);
			},
			error: arg.error
		});
	}
	
	function getEntity(arg){
		arg = arg || {};
		var id = arg.to || arg.id; 
		if(arg && id && arg.type){
			switch(arg.type){
				case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
					return YYIMCacheGroupManager.getInstance().updateCache({id: id});
				case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
					return YYIMCachePubAccountManager.getInstance().updateCache({id: id});
				default: 
					return YYIMCacheRosterManager.getInstance().updateCache({id: id});
			}
		}
	}
	
	function mute(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.mute({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						mute: true
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						recent.build({});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function cancelMute(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.cancelMute({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						mute: false
					});
					
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						recent.build({});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function stick(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.stick({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						stick: true
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: entity.id,
							type: recent.type,
							stick: true
						});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function cancelStick(arg){
		arg = arg || {};
		var entity = getEntity(arg);
		if(!!entity){
			YYIMChat.cancelStick({
				to: arg.to,
				type: arg.type,
				success: function(data){
					entity.build({
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: entity.id,
							type: recent.type,
							stick: false
						});
					}
					arg.success && arg.success(data); 
				},
				error: arg.error
			});
		}
	}
	
	function createProfile(arg){
		YYIMChat.createProfile(arg);
	}
	
	function removeProfile(arg){
		YYIMChat.removeProfile(arg);
	}
	
	function clearProfile(arg){
		arg = arg || {};
		YYIMChat.clearProfile({
			success:function(){
				YYIMCacheGroupManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				
				YYIMCachePubAccountManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				
				YYIMCacheRosterManager.getInstance().forEach(function(index,item,list){
					item.build({
						mute: false,
						stick: false
					});
					var recent = YYIMCacheRecentManager.getInstance().get(item.id);
					if(!!recent){
						YYIMCacheRecentManager.getInstance().updateCache({
							id: item.id,
							type: recent.type,
							stick: false
						});
					}
				});
				arg.success && arg.success(); 
			},error: arg.error
		});
	}
	
	return {
		getProfile: getProfile,
		mute: mute,
		cancelMute: cancelMute,
		stick: stick,
		cancelStick: cancelStick,
		createProfile: createProfile,
		removeProfile: removeProfile,
		clearProfile: clearProfile
	};
})();
