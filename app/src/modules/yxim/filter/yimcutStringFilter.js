define(['../module'], function(module) {
.filter('cutString',function(){
	return function(input,direction,length){
		if(!input)return '';
		if(direction){
			return input.substr(input.length-length,length);
		}else{
			return input.substr(0,length);
		}
	}
});
})