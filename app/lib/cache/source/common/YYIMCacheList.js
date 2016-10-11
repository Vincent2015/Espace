function YYIMCacheList(){
	this.list = {};
}

YYIMCacheList.prototype.set = function(key,val){
	if(key && val){
		this.list[key] = val;
	}
};

YYIMCacheList.prototype.get = function(key){
	if(key){
		return this.list[key];
	}
	return this.list;
};

YYIMCacheList.prototype.remove = function(key){
	if(key){
		delete this.list[key];
	}
};

YYIMCacheList.prototype.update = function(key,val){
	this.set.apply(this,arguments);
};

YYIMCacheList.prototype.clear = function(){
	this.list = {};
};

YYIMCacheList.prototype.forEach = function(fun){
	if(YYIMUtil['isWhateType'](fun, 'Function')){
		var index = 0;
		for(var x in this.list){
			if(!!this.list[x].id){
				fun(index++,this.list[x],this.list);
			}
		}
	}
};
