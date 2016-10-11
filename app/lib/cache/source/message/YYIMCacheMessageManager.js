function YYIMCacheMessageManager(){
	this.messList = {};	
	this.showInterval = {};
	this.atUserList = [];
	this.attachMapped = {};	
}

YYIMCacheMessageManager.prototype = new YYIMCacheList();

YYIMCacheMessageManager.getInstance = function(){
	if(!this._instance){
		this._instance = new YYIMCacheMessageManager();
	}
	return this._instance;
};

/**
 * 跟新消息缓存
 * @param {Object} arg
 */
YYIMCacheMessageManager.prototype.updateCache = function(arg){
	if(!arg) return;

	var id = arg.msgId || arg.packetId || arg.id;
	
	if(id){
		var message = this.get(id),
		isNew = false;
		if(!!message){
			message.build(arg);
		}else{
			message = new YYIMCacheMessage(arg);
			if(!message.data) return;			
			this.set(id,message);
			isNew = true;
		}	
		
		/**
		 * 按照 附件id 存附件與消息的关系映射
		 */
		if(message.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE){
			this.attachMapped[message.data.content.attchId] = message;
		}
		
		try{
			var uid = message.fromId || message.from.id;
			var to = message.toId || message.to.id;
		}catch(e){
			return;
		}
		
		if(YYIMChat.getUserID() !== to){
			uid = to;
		}
		
		if(uid){
			if(!this.messList[uid]){
				this.messList[uid] = {};
				this.messList[uid]['readed'] = [];
				this.messList[uid]['unreaded'] = [];
				this.messList[uid]['all'] = [];
			}
			
			if(isNew){
				this.messList[uid]['all'].push(message);
			}
			
			this.messList[uid]['readed'].length = 0;
			this.messList[uid]['unreaded'].length = 0;
			
			for(var x in this.messList[uid]['all']){
				var mess = this.messList[uid]['all'][x];
				if(!!mess && mess.readed === true){
					this.messList[uid]['readed'].push(mess);
				}else if(!!mess && mess.readed === false){
					this.messList[uid]['unreaded'].push(mess);
				}
			}
			
			this.messList[uid]['readed'] = this.messList[uid]['readed'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
			this.messList[uid]['unreaded'] = this.messList[uid]['unreaded'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
			this.messList[uid]['all'] = this.messList[uid]['all'].sort(YYIMUtil['array']['comparisonAsc']('dateline'));
		}
		
		this.getShowInterval(message);
		
		if(arg.sendState == YYIMCacheConfig.SEND_STATE.READED || message.received){
			this.receiveReceipts(message.id);
		}
		return message;
	}
};

YYIMCacheMessageManager.prototype.getShowInterval = function(message){
	if(!!message && message.opposite){
		var dateline = message.dateline;
		var opposite = message.opposite;
		
		this.showInterval[opposite] = this.showInterval[opposite] || {max:dateline,min:dateline};
		
		if(dateline - this.showInterval[opposite]['max'] > YYIMCacheConfig.PRE_SHOW_TIMEINTERVAL){
			this.showInterval[opposite]['max'] = dateline;
			message.build({
				showInterval: true
			});
		}else if(this.showInterval[opposite]['min'] - dateline > YYIMCacheConfig.PRE_SHOW_TIMEINTERVAL){
			this.showInterval[opposite]['min'] = dateline;
			message.build({
				showInterval: true
			});
		}else if(this.showInterval[opposite]['min'] == this.showInterval[opposite]['max'] && this.showInterval[opposite]['min'] == dateline){
			message.build({
				showInterval: true
			});
		}else if(message.firstShow === true){
			if(!!this.firstShow){
				this.firstShow.build({
					showInterval: false
				});
			}
			this.firstShow = message;
			this.firstShow.build({
				showInterval: true
			});
		}
	}
};

/**
 * 获取历史消息
 * @param {Object} arg {
 * id: //对话人id
 * chatType: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * contentType:int, //代表希望拿到的消息类型，不填则为全部消息类型 
 * start: number,   //消息列表的分页参数，起始值，默认0,
 * num: number   //消息列表的分页参数，分页参数，默认100
 * }
 */
YYIMCacheMessageManager.prototype.getHistoryMessage = function(arg){
	var user = arg.id || arg.to;
	if(!user) return;
	
	var recent = YYIMCacheRecentManager.getInstance().get(user);
	if(!recent) return;
	
	var that = this;
	
	that.history = that.history || {};
	that.history[user] = that.history[user] || {};
	
	that.history[user]['start'] = that.history[user]['start'] || 0;
	that.history[user]['present'] = arg.present || that.history[user]['present'] || 0;
	
	if(that.history[user]['isEnd']){
		arg.success && arg.success({
			count: 0,
			isEnd: true
		});
		return;
	}
	
	this.TemphisMsgList = this.TemphisMsgList || [];
	
	YYIMChat.getHistoryMessage({
		id: user,
		chatType: arg.chatType || arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT,
		contentType: arg.contentType,
		start: that.history[user]['start'] || 0,
		size: YYIMCacheConfig.PRE_HISTORY_LENGTH,
		endVersion: recent.originVersion,
		success:function(data){
			var isEnd = data.result.length <= (YYIMCacheConfig.PRE_HISTORY_LENGTH - that.history[user]['present']) && data.result.length < YYIMCacheConfig.PRE_HISTORY_LENGTH; //没有历史记录了
			var isFull = false;
			var lastestMessage = null;
			
			data.result.sort(YYIMUtil['array']['comparisonDesc']('dateline'));
			try{
				var firstMessage = data.result[data.result.length-1];
				if(firstMessage){
					firstMessage.firstShow = true;
				}
			}catch(e){}
			
			for(var x in data.result){
				var result = data.result[x];
				var msgId = result.msgId || result.packetId || result.id;
				var message = that.get(msgId);
				
				if(!message){
					result.readed = true;
					lastestMessage = that.updateCache(result);
					that.history[user]['present'] += 1;
				}
				
				that.history[user]['start'] += 1;
				
				if(!!lastestMessage){
					var list = that.messList[user]['all'];
					var lastestTime = 0;
					if(!!list && list.length){
						lastestTime = list[list.length-1].dateline;
					}
					
					if(lastestMessage.dateline >= lastestTime){
						if(lastestMessage.data.contentType == YYIMCacheConfig.MESSAGE_CONTENT_TYPE.REVOCATION){
							var entity = lastestMessage.fromRoster || lastestMessage.from;
							var latestState = entity.name + '撤回了一条消息';
							if(entity.id == YYIMChat.getUserID()){
								latestState = '您撤回了一条消息';
							}
							YYIMCacheRecentManager.getInstance().updateCache({
								id: user,
								dateline: lastestMessage.dateline,
								latestState: latestState,
								contentType: lastestMessage.data.contentType,
								sessionVersion: lastestMessage.sessionVersion,
								type: lastestMessage.type,
								sort: false
							});
						}else{
							YYIMCacheRecentManager.getInstance().updateCache({
								id: user,
								dateline: lastestMessage.dateline,
								latestState: lastestMessage.data,
								contentType: lastestMessage.data.contentType,
								sessionVersion: lastestMessage.sessionVersion,
								type: lastestMessage.type,
								sort: false
							});
						}
					}
					
					that.TemphisMsgList.push(lastestMessage);
				}
				
				if(that.history[user]['present'] >= YYIMCacheConfig.PRE_HISTORY_LENGTH){
					isFull = true; //本次拉取固定条数完成
					break;
				}
			}
			
			if(isEnd || isFull){
				var temp = that.history[user]['present'];
				that.history[user]['present'] = 0;
				
				if(isEnd){
					that.history[user]['isEnd'] = true;
				}
				arg.success && arg.success({
					list: that.TemphisMsgList,
					count:temp,
					isEnd:isEnd,
					isFull:isFull
				});
				
				that.TemphisMsgList.length = 0;
			}else{
				that.getHistoryMessage(arg);
			}
			
		},
		error:function(){
			arg.error && arg.error();
		},
		complete:function(){
			arg.complete && arg.complete();
		}
	});
};

/**
 * 获取历史消息
 */
YYIMCacheMessageManager.prototype.getOfflineMessage = function(arg){
	YYIMChat.getOfflineMessage(arg);
};

/**
 * 获取消息列表
 * @param {Object}
 *  arg {
 * 	id:,//对话人id
 *  condition: // readed(已读)/unreaded(未读)/all(全部)
 * }
 *  
 */
YYIMCacheMessageManager.prototype.getMessageList = function(arg){
	try{
		return this.messList[arg.id][arg.condition || 'all'];
	}catch(e){
		return [];
	}
};

YYIMCacheMessageManager.prototype.getLastValidMessage = function(arg){
	var messageList = this.getMessageList(arg);
	var length = messageList.length;
	while(length--){
		if(!messageList[length].revocation){
			return messageList[length];
		}
	}
};

/**
 * 展示消息列表
 * @param {Object}
 *  arg {
 * 	id:,//对话人id
 *  condition: // readed(已读)/unreaded(未读)/all(全部)
 * }
 *  
 */
YYIMCacheMessageManager.prototype.showMessageList = function(arg){
	try{
		var uid = arg.id;
		for(var x in this.messList[uid]['unreaded']){
			var message = this.messList[uid]['unreaded'][x];
			if(message && message.id){
				this.updateCache({
					id: message.id,
					readed: true
				});
			}
		}
		
		var list = this.messList[uid]['all'];
		var lastestMessage = list[list.length-1];
		if(!!lastestMessage){
			var recent = YYIMCacheRecentManager.getInstance().get(uid);	
			
			if(!!recent && (recent.sessionVersion - recent.readedVersion)){
				YYIMCacheRecentManager.getInstance().updateCache({
					id: uid,
					type: recent.type,
					readedVersion: recent.sessionVersion
				});
				this.sendReceipts(lastestMessage.id);
			}
		}
		return list;
	}catch(e){
		return [];
	}
};

/**
 * 对方已读回执处理
 */
YYIMCacheMessageManager.prototype.receiveReceipts = function(id){
	if(id){
		var message = this.get(id);
		if(message){
			for(var x in this.messList[message.opposite]['all']){
				var temp = this.messList[message.opposite]['all'][x];
				if(temp && temp.sessionVersion <= message.sessionVersion){
					temp.build({
						sendState: YYIMCacheConfig.SEND_STATE.READED
					});
				}
			}
		}
	}
};

YYIMCacheMessageManager.prototype.sendReceipts = function(id){
	if(!!id){
		var message = this.get(id);
		if(message && message.data.receipt){
			if(message.data.receipt){
				var recent = YYIMCacheRecentManager.getInstance().get(message.opposite);
				if(!!recent && message.data.receipt.sessionVersion < recent.sessionVersion){
					message.data.receipt.sessionVersion = recent.sessionVersion;
				}
				YYIMChat.sendReadedReceiptsPacket(message.data.receipt);
			}
		}
	}
};

/**
 * 撤销消息 rongqb 20160707
 * arg {
 * 	id: String, //消息id
 *  to: String, //消息的另一方,待定
 *  type: 'chat/groupchat/pubaccount',
 *  success: function,
 *  error: function,
 *  complete: function
 * }
 */
YYIMCacheMessageManager.prototype.revocationMessage = function(arg){
	arg = arg || {};
	var that = this;
	var message = this.get(arg.id);
	if(message && !message.revocation){
		YYIMChat.revocationMessage(arg);
	}
};

/**
 * 发送文本消息[文本,表情]
 * @param arg {
 * to: id,  //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * msg:text, //消息文本
 * style：{
 *    font: "16", //字体
 *    size: "30", //大小
 *    color: "#000", //颜色
 *    biu: 7 //加粗、斜体、下划线
 * }, 
 * extend: string,  //扩展字段 
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendTextMessage = function(arg){
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	var that = this;
	
	var atUserId;
	if(this.atUserList.length){
		atUserId = [];
		for(var x in this.atUserList){
			atUserId.push(this.atUserList[x].id);
		}
	}
	var param = {
		to: to,
		type: type,
		msg: arg.msg,
		atuser: atUserId,
		style: arg.style,
		extend: JSON.stringify(this.atUserList),
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	};
	
	this.atUserList.length = 0;
	YYIMChat.sendTextMessage(param);
};

/**
 * 发送分享消息[分享消息]
 * @param arg {
 * to: id, //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * extend: string,  //扩展字段 
 * sharebody:{
 * 		shareImageUrl:string, //分享中图片的url
 * 		shareUrl:string, //分享的url
 * 		shareDesc:string, //分享的内容描述
 * 		shareTitle:string //分享的标题
 * 	},
 * success:function //成功回调函数
 * }
 */  
YYIMCacheMessageManager.prototype.sendShareMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendShareMessage({
		to: arg.to || arg.id,
		type: type,
		sharebody: arg.sharebody,
		extend: arg.extend,
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	});
	
};


/**
 * 发送图片消息
 * @param arg{
 * chatInfo: function,
 * fileFiltered: function, //文件被添加到上传队列
 * beforeUpload: function, //文件上传之前
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendPicMessage  = function(arg){
	var that = this;
	YYIMChat.sendPic({
		fileInputId:arg.fileInputId,
		fileFiltered: arg.fileFiltered,
		beforeUpload: arg.beforeUpload,
		chatInfo: arg.chatInfo,
		success:function(data){
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		},
		progress: function(result){
			YYIMChat.log('uploadProgress',3,result.percent);
			arg.progress && arg.progress(result);
		}
	});
};

/**
 * 发送文件消息
 * @param arg{
 * chatInfo: function,
 * fileFiltered: function, //文件被添加到上传队列
 * beforeUpload: function, //文件上传之前
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendFileMessage  = function(arg){
	var that = this;
	YYIMChat.sendFile({
		fileInputId:arg.fileInputId,
		fileFiltered: arg.fileFiltered,
		beforeUpload: arg.beforeUpload,
		chatInfo: arg.chatInfo,
		success:function(data){
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		},
		progress: function(result){
			YYIMChat.log('uploadProgress',3,result.percent);
			arg.progress && arg.progress(result);
		}
	});
};

YYIMCacheMessageManager.prototype.sendFormMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendFormMessage({
		
		file: {
				name: arg.file.name,
				size: arg.file.size
		},
		mediaType: arg.mediaType || 1,
		
		data: arg.data,

		to: to,
		
		type: type,
		
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message);
		},
		progress:function(data) {
			// body...
			console.log('progress');
			console.log(data);
			arg.progress && arg.progress(data);
		}
	});
};

YYIMCacheMessageManager.prototype.PostMessage  = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.postMessage({
		content:arg.content,
		to: arg.to,
		contentType:arg.contentType,
		type: arg.type,		
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message);
		},
		progress:function(data) {
			// body...
			console.log('progress');
			console.log(data);
			//arg.progress && arg.progress(data);
		}
	});
};

YYIMCacheMessageManager.prototype.forwardMessage  = function(arg){
	var that = this;
	var msg = that.get(arg.mid);
	if (!msg) return;
	switch(msg.data.contentType)
		{
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.TEXT:
		  var msgcopy ={
		  		to: arg.to,
				msg: msg.data.content,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.sendTextMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.FILE:
		  var msgcopy ={
		  		to: arg.to,
				content: msg.data.content,
				contentType:msg.data.contentType,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.PostMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.IMAGE:
		  var msgcopy ={
		  		to: arg.to,
				content: msg.data.content,
				contentType:msg.data.contentType,
				type: msg.type,
				success:function(message) {
					// body...
					YYIMCacheRecentManager.getInstance().updateCache({
						id: message.opposite,
						dateline: message.dateline,
						latestState: message.data,
						contentType: message.data.contentType,
						type: message.type,
						sort: true
					});

				}
		  }
		  that.PostMessage(msgcopy);
		  break;
		case YYIMCacheConfig.MESSAGE_CONTENT_TYPE.AUDO:
		  
		  break;
		default:
		   break;
		}
		arg.success && arg.success();
};

/**
 * 发送白板消息
 * @param arg {
 * to: id,  //对话人id
 * type: "groupchat/chat/pubaccount",  //chat:单聊，groupcgat:群聊,pubaccount:公众号
 * extend: string,  //扩展字段 
 * content:{
 * 	id:, //白板id
 * }, 
 * success:function //成功回调函数
 * }
 */
YYIMCacheMessageManager.prototype.sendWhiteBoardMessage = function(arg){
	var that = this;
	var type = arg.type || YYIMCacheConfig.CHAT_TYPE.CHAT;
	var to = arg.to || arg.id;
	YYIMChat.sendWhiteBoardMessage({
		to: to,
		type: type,
		extend: arg.extend,
		content: arg.content,
		success:function(data){
			data.type = type;
			data.readed = true;
			data.sendState = YYIMCacheConfig.SEND_STATE.UNREADED;
			
			var message = that.updateCache(data);
			arg.success && arg.success(message); 
		}
	});
};

YYIMCacheMessageManager.prototype.updateCacheByTransMessage = function(arg){
	switch(arg.category){
		case YYIMCacheConfig.TRAMSPARENT_TYPE.ATTACHMENTCONVERTED:
		 	try{
		 		var convertedIds = JSON.parse(arg.attributes.convertedInfo);
		 		var message = this.attachMapped[convertedIds.attachId];
				if(!!message){ //消息已到达
				 	message.data.convertedIds = convertedIds.result;
				}
				return message;
		 	}catch(e){}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.REVOKE:
			 if(arg && arg.attributes && arg.attributes.packetId){
			 	var message = this.get(arg.attributes.packetId);
			 	if(message){
			 		message.build({
				 		revocation: YYIMCacheRosterManager.getInstance().updateCache({
				 			id: arg.from.roster || arg.from
				 		})
				 	});
				 	return message;
			 	}
			 }
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.SETMUTE:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					mute: true
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){
					recent.build({});
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.CANCELMUTE:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
				entity.build({
					mute: false
				});
				var recent = YYIMCacheRecentManager.getInstance().get(entity.id);
				if(!!recent){
					recent.build({});
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.SETSTICK:
			var entity = this.getEntity(arg.attributes.bareJID);
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
					return recent;
				}
			}
			break;
		case YYIMCacheConfig.TRAMSPARENT_TYPE.CANCELSTICK:
			var entity = this.getEntity(arg.attributes.bareJID);
			if(!!entity){
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
					return recent;
				}
			}
			break;
		default:break;
	}
};

YYIMCacheMessageManager.prototype.getEntity = function(arg){
	arg = arg || {};
	var id = arg.to || arg.id; 
	if(arg && id && arg.type){
		switch(arg.type){
			case YYIMCacheConfig.CHAT_TYPE.GROUP_CHAT:
				return YYIMCacheGroupManager.getInstance().get(id);
			case YYIMCacheConfig.CHAT_TYPE.PUB_ACCOUNT:
				return YYIMCachePubAccountManager.getInstance().updateCache({id: id});
			default: 
				return YYIMCacheRosterManager.getInstance().updateCache({id: id});
		}
	}
};

YYIMCacheMessageManager.prototype.destory = function(){
	this.messList = {};	
	this.showInterval = {};
	this.atUserList.length = 0;
	this.attachMapped = {};	
	this.history = {};
	this.clear();
};