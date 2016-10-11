define(['../module'], function(module) {
	module.directive('headerphoto', [ 'httpService',function(httpService) {
		 var photoHost = "http://test.staticoss.upesn.com/";
		 var subData="abcdefghijklmnopqrstuvwxyz";

		 var colorArr = ['29d4ff','1594ff','ffa92f','b587fa','06cf86','fa6771','73d51c','8991ff'];
		 function checkFileExt(filename){
		 	    if (!filename){return false;}
				var flag = false; //状态
				var arr = ["jpg","png","gif","bmp","jpeg"];
				//取出上传文件的扩展名
				var index = filename.lastIndexOf(".");
				var ext = filename.substr(index+1);
				//循环比较
				for(var i=0;i<arr.length;i++)
				{
					if(ext == arr[i])
					{
					 flag = true; //一旦找到合适的，立即退出循环
					 break;
					}
				}
				if (filename.indexOf("default_avatar.jpg")>-1 || filename.indexOf("defaultGroup.gif")>-1) {
					return false;
				}
				//条件判断
				if(flag){
					return true;
				}else
				{
					return false;
				}
		 }

		 function GetRandomNum(Min,Max)
			{   
			var Range = Max - Min;   
			var Rand = Math.random();   
			return(Min + Math.round(Rand * Range));   
			}   

		 return {
					restrict:'AE',
					replace:true,
					scope:{
						item : "=item",
						size : "=size",
						info :"=info",
						fontsize : "=fontsize"
					},
					template:"<div class='avt-s-l' style='border-radius:0'></div>",
					link: function($scope, element, attrs) {
					     var size = {
								"size1":{width:38,height:38},
								"size2":{width:29,height:29},
								"size3":{width:24,height:24},
								"size4":{width:22,height:22}
							};
														var pos ={
												"pos1":[{left:"0px",top:"0px"}],
												"pos2":[{left:"14px",top:"0px"},{left:"0px",top:"14px"}],
												"pos3":[{left:"0px",top:"18px"},{left:"9px",top:"0px"},{left:"18px",top:"18px"}],
												"pos4":[
													{left:"2px",top:"20px"},
													{left:"2px",top:"0px"},
													{left:"20px",top:"0px"},
													{left:"20px",top:"20px"}
												]
											};
						var item = $scope.item;
						var info = $scope.info;
					
						 console.log(item);

						var checkavatar = true;
						
						if (attrs.align && item && !checkavatar) {
							element.css("vertical-align",attrs.align);
						}
						if (attrs.margintop && item &&  item.type == "groupchat" && item.from.members > 1) {
							element.css("margin-top",attrs.margintop);
						}
						   if (!item){
						     console.log(info);
						     if (info){

						     	        var img =  new Image();
										img.width = 38;
										img.height = 38;
										 img.onerror = function() {
											this.src ="./src/style/images/avt_default.png";
									     };

									
											img.src = info.avatar;
											element.append(img);
						        	
						        }
						     	return;        
						   }

						    switch(item.type)
							    {
							        case "chat":
							        	var img =  new Image();
										img.width = 38;
										img.height = 38;
									
										if (!checkFileExt(item.from.avatar)){
											var itemname;
						         			itemname = item.name;
											var maxlength =  itemname.length;
											var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
											var name = "";
											if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
												i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
												name = itemname.substring(minlength,maxlength);
												if(subData.indexOf(i) > -1){
													i = subData.indexOf(i);
												}
												if (i>7) {
													i = (i+1)%8;
												}
											} else {
												var maxlength = (itemname.length < 2) ? itemname.length : 2;

												i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
												name = itemname.substring(0,maxlength);
												if(subData.indexOf(i) > -1){
													i = subData.indexOf(i);
												}
												if (i>7) {
													i = (i+1)%8;
												}
											}

											var color = colorArr[i];
												var fontsize = "16";
												if($scope.fontsize) {
													fontsize = $scope.fontsize;
												}
												if (!color){
												color = colorArr[GetRandomNum(1,7)];
											}
												var header ="<div style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: "+fontsize+"px;color: #fff;background: #"+
												color +";border-radius: 100%;'>"+name+"</div>";
												element.append(header);
										}else{

										 img.onerror = function() {
											this.src ="./src/style/images/avt_default.png";
									     };

									      img.style.borderRadius = "100%";
											img.src = item.from.avatar;
											element.append(img);
										}
									
										
							         break;
							        

							         case "groupchat":
							           if(!item.fromRoster){
									           var members = item.from.members;
									           if (members.length>0){

									           	var menlen = members.length>4 ? 4:members.length; 

									           	for(var m=0;m<menlen;m++){
														var img = new Image();
														
														img.onerror = function() {
														this.src ="./src/style/images/avt_default.png";
													   };
													   if (!members[m].avatar){
													   	console.log('000');
													   assert(1);
													   }
													   
													   if (!checkFileExt(members[m].avatar)){
														var itemname;
									         			itemname = item.name;
														var maxlength =  itemname.length;
														var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
														var name = "";
														if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
															i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
															name = itemname.substring(minlength,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														} else {
															var maxlength = (itemname.length < 2) ? itemname.length : 2;

															i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
															name = itemname.substring(0,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														}

														    var color = colorArr[i];
															var fontsize = "16";
															if($scope.fontsize) {
																fontsize = $scope.fontsize;
															}
															if (!color){
																color = colorArr[GetRandomNum(1,7)];
															}
															var header ="<div style='position:absolute;border: 2px #fff solid; top:"+pos["pos"+menlen][m].top+";left:"+pos["pos"+menlen][m].left
															+"; height: "+size["size"+menlen].height+"px; width: "+size["size"+menlen].width+"px;display: inline-flex;justify-content: center;align-items: center;font-size: 16px;color: #fff;background: #"+
															color +";border-radius: 100%;'><i style='-webkit-transform: scale(0.58);display: inline-block;width: 100%;font-size: 12px;'>"+name+"</i></div>";
															element.append(header);
													}else{
														img.src = members[m].avatar;
														img.width = size["size"+menlen].width;
														img.height = size["size"+menlen].height;
														img.style.position = "absolute";
														img.style.borderRadius = "100%";
													    img.style.border = "2px solid #fff";
														img.style.top = pos["pos"+menlen][m].top;
														img.style.left = pos["pos"+menlen][m].left;
														element.append(img);
													}
												   
												  }
									           }else{
									           		var itemname;
								         			itemname = item.name;
													var maxlength =  itemname.length;
													var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
													var name = "";
													if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
														i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
														name = itemname.substring(minlength,maxlength);
														if(subData.indexOf(i) > -1){
															i = subData.indexOf(i);
														}
														if (i>7) {
															i = (i+1)%8;
														}
													} else {
														var maxlength = (itemname.length < 2) ? itemname.length : 2;

														i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
														name = itemname.substring(0,maxlength);
														if(subData.indexOf(i) > -1){
															i = subData.indexOf(i);
														}
														if (i>7) {
															i = (i+1)%8;
														}
													}

													var color = colorArr[i+1];
													if (!color){
												color = colorArr[GetRandomNum(1,7)];
											}
														var fontsize = "16";
														if($scope.fontsize) {
															fontsize = $scope.fontsize;
														}
														var header ="<div style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: "+fontsize+"px;color: #fff;background: #"+
														color +";border-radius: 100%;'>"+name+"</div>";
														element.append(header);

									           }//end recentlist
							           }else if(item.fromRoster){
							           				   var ss = item.fromRoster.avatar;
													   if (!checkFileExt(ss)){
														var itemname;
									         			itemname =item.name? item.name:"无名";
														var maxlength =  itemname.length;
														var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
														var name = "";
														if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
															i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
															name = itemname.substring(minlength,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														} else {
															var maxlength = (itemname.length < 2) ? itemname.length : 2;

															i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
															name = itemname.substring(0,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														}

														 //    var color = colorArr[i];
															// var fontsize = "16";
															// if($scope.fontsize) {
															// 	fontsize = $scope.fontsize;
															// }
												
															// var header ="<div style='position:absolute;border: 2px #fff solid; top:"+pos["pos"+menlen][m].top+";left:"+pos["pos"+menlen][m].left
															// +"; height: "+size["size"+menlen].height+"px; width: "+size["size"+menlen].width+"px;display: inline-flex;justify-content: center;align-items: center;font-size: 16px;color: #fff;background: #"+
															// color +";border-radius: 100%;'><i style='-webkit-transform: scale(0.58);display: inline-block;width: 100%;font-size: 12px;'>"+name+"</i></div>";
															// element.append(header);

															var color = colorArr[i];
															var fontsize = "16";
															if($scope.fontsize) {
																fontsize = $scope.fontsize;
															}
															if (!color){
																color = colorArr[GetRandomNum(1,7)];
															}
															var header ="<div style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: "+fontsize+"px;color: #fff;background: #"+
															color +";border-radius: 100%;'>"+name+"</div>";
															element.append(header);
													}else{

													     var img = new Image();
														
														img.onerror = function() {
														this.src ="./src/style/images/avt_default.png";
													    };
														img.src = ss;
														img.width = size["size"+1].width;
														img.height = size["size"+1].height;
														// img.style.position = "absolute";
														img.style.borderRadius = "100%";
													 //    img.style.border = "2px solid #fff";
														// img.style.top = pos["pos"+menlen][m].top;
														// img.style.left = pos["pos"+menlen][m].left;
														element.append(img);
													}

							           }
							           
							          
							          break;
							            case "pubaccount":
				                              						// 	// console.log(item);
													var i;
													var itemname = item.name || item.from.name;
													var classname = "";
													if(!item.name){
														element.addClass("photocard");
														element.addClass("z");
														classname = "photocard z ";
													}
													if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
														i = $.md5(itemname.substring(0,2)).substring(0,1);
														if(subData.indexOf(i) > -1){
															i = subData.indexOf(i);
														}
														if (i>7) {
															i = (i+1)%8;
														}
													}
									
													 //paragraph
													 {

														var color = "";
														if (attrs.headercolor) {
															color = attrs.headercolor;
														} else {
															item.colorNum = i;
															color = colorArr[item.colorNum];
															if (element[0].offsetParent) {
																element[0].offsetParent.setAttribute("headercolor",color);
															}
														}
														var classtype = "";
														//['29d4ff'：蓝,'1594ff'：深蓝,'ffa92f':橙,'b587fa'：紫,'06cf86'：绿,'fa6771'：红,'73d51c'：青,'8991ff'：淡紫]
														switch (item.from.noticyType) {
															case "app": //应用通知
																classtype = "icon-web_icon_message_application";
																color = colorArr[2];
																break;
															case "qz": //空间通知
																classtype = "icon-web_icon_message_space";
																color = colorArr[4];
																break;
															case "feed": //动态通知
																classtype = "icon-web_icon_message_dynamic";
																color = colorArr[4];
																break;
															case "groupnew"://团队通知
																classtype = "icon-web_icon_message_team";
																color = colorArr[2];
																break;
															case "system"://系统通知
																classtype = "icon-web_icon_set_selected";
																color = colorArr[1];
																break;
															case "vmail"://微邮通知
																classtype = "icon-web_icon_mail_selected";
																color = colorArr[7];
																break;
															default:
																classtype = "icon-web_icon_message_subscribe";
																// color = colorArr[7];
														}
														// icon-web_icon_message_space //空间
														// icon-web_icon_message_application //应用
														// icon-web_icon_message_subscribe //订阅号
														// icon-web_icon_message_dynamic //动态
														if (!color) {
															color = colorArr[7];
														}
														if (!color){
												color = colorArr[GetRandomNum(1,7)];
											}
														var header ="<div class='"+classtype+"' style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: 24px;color: #fff;background: #"+
														color +";border-radius: 100%;'></div>";

														element.append(header);
													 }
													 // else {
													// 	img.src = src;
													// 	element.append(img);
													// }
							             break;
							          case "folded":
							                           var color = "";
														if (attrs.headercolor) {
															color = attrs.headercolor;
														} else {
															item.colorNum = i;
															color = colorArr[item.colorNum];
															if (element[0].offsetParent) {
																element[0].offsetParent.setAttribute("headercolor",color);
															}
														}
														var classtype = "";
												
													    classtype = "icon-web_icon_message_subscribe";
											
														if (!color) {
															color = colorArr[7];
														}
														if (!color){
												color = colorArr[GetRandomNum(1,7)];
											}
														var header ="<div class='"+classtype+"' style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: 24px;color: #fff;background: #"+
														color +";border-radius: 100%;'></div>";

														element.append(header);

														break;
							        default:

							            var img =  new Image();
										img.width = 38;
										img.height = 38;
										img.style.borderRadius = "100%";


										if ((!checkFileExt(item.avatar) && !checkFileExt(item.group_logo))) {
											var itemname;
						         			itemname = item.name ? item.name:item.group_name;
						         			if (!itemname){
						         				 img.onerror = function() {
												this.src ="./src/style/images/avt_default.png";
										   		  };
										   		 var posindex = item.avatar_middle.indexOf('.middle.jpg');
										       	img.src = item.avatar_middle.substring(0,posindex)+'.thumb.jpg';
												element.append(img);  
						         			}else{
						         			itemname = itemname ? itemname:item.uname;
											var maxlength =  itemname.length;
											var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
											var name = "";
											if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
												i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
												name = itemname.substring(minlength,maxlength);
												if(subData.indexOf(i) > -1){
													i = subData.indexOf(i);
												}
												if (i>7) {
													i = (i+1)%8;
												}
											} else {
												var maxlength = (itemname.length < 2) ? itemname.length : 2;

												i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
												name = itemname.substring(0,maxlength);
												if(subData.indexOf(i) > -1){
													i = subData.indexOf(i);
												}
												if (i>7) {
													i = (i+1)%8;
												}
											}

											var color = colorArr[i];
											if (!color){
												color = colorArr[GetRandomNum(1,7)];
											}
												var fontsize = "16";
												if($scope.fontsize) {
													fontsize = $scope.fontsize;
												}
												var header ="<div style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: "+fontsize+"px;color: #fff;background: #"+
												color +";border-radius: 100%;'>"+name+"</div>";
												element.append(header);
						         			}
						         			
										}else{
											 img.onerror = function() {
											this.src ="./src/style/images/avt_default.png";
									   		  };

									       if (item.group_logo){
									       		if(!checkFileExt(item.group_logo)){
												       	var itemname;
									         			itemname = item.name ? item.name:item.group_name;
														var maxlength =  itemname.length;
														var minlength = (maxlength > 2 ) ? maxlength-2 : 0;
														var name = "";
														if(/.*[\u4e00-\u9fa5]+.*$/.test(itemname)){
															i = $.md5(itemname.substring(minlength,maxlength)).substring(0,1);
															name = itemname.substring(minlength,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														} else {
															var maxlength = (itemname.length < 2) ? itemname.length : 2;

															i = $.md5(itemname.substring(0,maxlength)).substring(0,1);
															name = itemname.substring(0,maxlength);
															if(subData.indexOf(i) > -1){
																i = subData.indexOf(i);
															}
															if (i>7) {
																i = (i+1)%8;
															}
														}

														var color = colorArr[i];
															var fontsize = "16";
															if($scope.fontsize) {
																fontsize = $scope.fontsize;
															}
															if (!color){
															color = colorArr[GetRandomNum(1,7)];
														}
															var header ="<div style='height: 38px; width: 38px;display: inline-flex;justify-content: center;align-items: center;font-size: "+fontsize+"px;color: #fff;background: #"+
															color +";border-radius: 100%;'>"+name+"</div>";
															element.append(header);
									       		}else{
									       			img.src = item.group_logo;
									       			element.append(img);   
									       		}
									       		
									       }else{
									       	img.src = item.avatar;
									       	element.append(img);   
									       }
											
											  
										}

										  
							                        	
							    }//end switch

						

					}
				}

	}]);
})
