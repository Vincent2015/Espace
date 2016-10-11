define(['./module','jquery'], function(module,$) {

  var SNSExpressionData = {
  		DEFAULT:{
  			priority:0,
  			folder:"src/style/images/expression/default/",
        data:[{actionData:"[龇牙]",url:"expression_ciya.png"},
  					{actionData:"[哈哈]",url:"expression_haha.png"},
  					{actionData:"[害羞]",url:"expression_haix.png"},
  					{actionData:"[惊恐]",url:"expression_jingk.png"},
  					{actionData:"[拜拜]",url:"expression_bye.png"},
  					{actionData:"[大哭]",url:"expression_crya.png"},
  					{actionData:"[鼻涕]",url:"expression_bit.png"},
  					{actionData:"[汗]",url:"expression_hanb.png"},
  					{actionData:"[汗死]",url:"expression_hana.png"},
  					{actionData:"[可怜]",url:"expression_kelian.png"},
  					{actionData:"[亲亲]",url:"expression_kissb.png"},
  					{actionData:"[色]",url:"expression_se.png"},
  					{actionData:"[调皮]",url:"expression_tiaop.png"},
  					{actionData:"[偷笑]",url:"expression_toux.png"},
  					{actionData:"[吓到]",url:"expression_xia.png"},
  					{actionData:"[疑问]",url:"expression_yiw.png"},
  					{actionData:"[晕]",url:"expression_yun.png"},
  					{actionData:"[ok]",url:"expression_ok.png"},
  					{actionData:"[yeak]",url:"expression_yeak.png"},
  					{actionData:"[拜托]",url:"expression_bait.png"},
  					{actionData:"[鼓掌]",url:"expression_guz.png"},
  					{actionData:"[祈祷]",url:"expression_pray.png"},
  					{actionData:"[握手]",url:"expression_wos.png"},
  					{actionData:"[赞]",url:"expression_zan.png"},
  					{actionData:"[弱]",url:"expression_ruo.png"},
  					{actionData:"[拳]",url:"expression_quan.png"},
  					{actionData:"[私家车]",url:"expression_car.png"},
  					{actionData:"[大巴]",url:"expression_bus.png"},
  					{actionData:"[火车]",url:"expression_train.png"},
  					{actionData:"[飞机]",url:"expression_plane.png"},
  					{actionData:"[打闪]",url:"expression_shand.png"},
  					{actionData:"[下雨]",url:"expression_rain.png"},
  					{actionData:"[下雪]",url:"expression_snow.png"},
  					{actionData:"[雨伞]",url:"expression_umbre.png"},
  					{actionData:"[彩虹]",url:"expression_rainb.png"},
  					{actionData:"[多云]",url:"expression_cloudy.png"},
  					{actionData:"[晴天]",url:"expression_sunny.png"},
  					{actionData:"[茶]",url:"expression_tea.png"},
  					{actionData:"[汉堡]",url:"expression_hanbao.png"},
  					{actionData:"[米饭]",url:"expression_rice.png"},
  					{actionData:"[啤酒]",url:"expression_beer.png"},
  					{actionData:"[蛋糕]",url:"expression_cake.png"},
  					{actionData:"[篮球]",url:"expression_basket.png"},
  					{actionData:"[足球]",url:"expression_ball.png"},
  					{actionData:"[台球]",url:"expression_taiq.png"},
  					{actionData:"[羽毛球]",url:"expression_yum.png"},
  					{actionData:"[炸弹]",url:"expression_zhad.png"},
  					{actionData:"[气球]",url:"expression_qiq.png"},
  					{actionData:"[心碎]",url:"expression_xins.png"},
  					{actionData:"[药]",url:"expression_med.png"},
  					{actionData:"[玫瑰花]",url:"expression_rose.png"},
  					{actionData:"[爱心]",url:"expression_heart.png"},
  					{actionData:"[吻]",url:"expression_kissa.png"},
  					{actionData:"[礼盒]",url:"expression_box.png"},
  					{actionData:"[钻石]",url:"expression_zuan.png"},
  					{actionData:"[给力]",url:"expression_geili.png"},
  					{actionData:"[囧]",url:"expression_jiong.png"},
  					{actionData:"[邮件]",url:"expression_mail.png"}
  			]
  		}
  }
//几个工具方法
function autosize(image,w,h)
{
  var iw = image.width,ih = image.height;
    if (image.width<w && image.height<h)
    {
        // ImgD.width=image.width;
        // ImgD.height=image.height;
    }
    else
    {
        if (w / h <= iw/ ih)
        {
            image.width=w;
            image.height=w * (ih / iw);
        }
        else
        {
            image.width=h * (iw / ih);
            image.height=h;
        }
    }
    return image;
}
function getCaretCharacterOffsetWithin(element) {
  var caretOffset = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  var range = null;
  if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
          range = win.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
      }
  }
  else if ( (sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
  }
  return caretOffset;
}
function setCaretPos(el, sPos){
  var charIndex = 0, range = document.createRange();
  range.setStart(el, 0);
  range.collapse(true);
  var nodeStack = [el], node, foundStart = false, stop = false;
  while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType == 3) {
          var nextCharIndex = charIndex + node.length;
          if (!foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
              range.setStart(node, sPos - charIndex);
              foundStart = true;
          }
          if (foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
              range.setEnd(node, sPos - charIndex);
              stop = true;
          }
          charIndex = nextCharIndex;
      } else {
          var i = node.childNodes.length;
          while (i--) {
              nodeStack.push(node.childNodes[i]);
          }
      }
  }
  selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
 }





  module.directive('imTextarea', ['$http',"imService",function($http,imService) {
     return {
          restrict:'AE',
          replace:true,
          scope:false,
          template:"<div ng-click='hideEmojiPanel()' contenteditable='true' ng-keydown='keydown($event)' class='em-im-win-textarea-inner' ng-bind='winInfo.inputmessage'> </div>",
          controller:function($scope, $element){
            $element[0].addEventListener('paste', function(e){
              var clipboardData, pastedData;
              e.stopPropagation();
              e.preventDefault();
              clipboardData = e.clipboardData || window.clipboardData;
              pastedData = clipboardData.getData('Text');
              var position = getCaretCharacterOffsetWithin( $element[0]);
              var text = $element[0].innerHTML;
              $element[0].innerHTML = text.slice(0,position) + pastedData +	text.slice(position,text.length);
              setCaretPos($element[0],(position+pastedData.length));
            })

            $scope.keydown=function(e){
              if(e.keyCode==13){
                e.preventDefault();
                $scope.sendMessage();

              }
            }
            $scope.insertEmoji=function(str){
              var position = getCaretCharacterOffsetWithin( $element[0]);
              var text = $element[0].innerHTML;
              $element[0].innerHTML = text.slice(0,position) + str +	text.slice(position,text.length);
              setCaretPos($element[0],(position+str.length));
            }

          },link:function($scope, $element,attrs){

            $scope.sendMessage=function(){
              $scope.hideEmojiPanel();
              var esnuser = JSON.parse(localStorage.getItem('esn_user'));
              var ftype= window.currentWin.ftype;
              var fid= window.currentWin.fid;
              var data = new Date();
              var sendtime = data.getFullYear()+"-"+(data.getMonth()+1)+"-"+data.getDate()+" "+data.getHours()+":"+data.getMinutes()+":"+data.getSeconds();
              sendtime =  Date.parse(new Date())/1000;

              if ($element.html().length<=0){
                 toast('不支持发送空消息',1000);
                 return;
              };


              var msg = {
                fid:fid,
                ftype:ftype,
                qz_id:esnuser.qz_id,
                msg:$element.html(),
                mtype:0,
                uid:esnuser.muid,
                sendtime:"",
                formatsendtime:"",
                readtime:"",
                avatar:esnuser.avatar_middle,
                name:esnuser.uname,
                row_status:"2",
                row_time:(new Date()).valueOf()
              }
              var msgContent = $element.html();
              $element.html("");
              $scope.list.push(msg);

              imService.SendMsg(msgContent,msg,({
                        $scopeId:$scope.id,
                        success:function(data) {
                                //  console.log(JSON.stringify(data));
                                 if(data.code!=0){
                                   toast(data.msg,1000);
                                 }
                                 $scope.$apply(function(){
                                   $scope.list = imService.dataSouce[$scope.id] ;
                                 });
                        },
                        error:function(err) {
                          // body...
                          $scope.$apply(function(){
                            $scope.list = imService.dataSouce[$scope.id] ;
                          });
                        }
                      }));
              //$element.html("");
              $scope.listScrollToBottom();
            }
          }
        }

  }]);

  module.directive('imToolbar', ['$http', function($http) {
     return {
          restrict:'AE',
          replace:true,
          scope:false,
          template:"<div class='em-im-win-toolbar'><div class='em-im-win-toolbar-icon icon-web_icon_picture'></div><div ng-if='hideAt' class='em-im-win-toolbar-icon icon-web_icon_a-tail'></div><a href='#' ng-click='emojiClick($event)'><div  class='em-im-win-toolbar-icon icon-web_icon_expression'></div></a><div class='em-im-win-toolbar-icon'></div></div>",
          controller:function($scope, $element){
          },
          link: function($scope, element, attrs) {
            $scope.hideAt = attrs.showAt!=="false";
            $scope.emojiClick = function(e){
              e.preventDefault();
              $scope.showEmojiPanel(e.target);
            }

         }
        }

  }]);


    module.directive('imSendbtn', [function() {
       return {
            restrict:'AE',
            replace:true,
            scope:false,
            template:"<div ng-click='btnSendMessage($event)' class='em-im-win-footer-right'><div class='em-im-send-icon icon-web_icon_sendout'></div><div  class='em-im-send-text' >发送</div></div>",
            controller:function($scope, $element){
              $scope.btnSendMessage=function(){
                $scope.sendMessage($element.html());
              }
            },
            link: function($scope, element, attrs) {

           }
          }

    }]);





  module.filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            //return $sce.trustAsHtml(text);
            return text;
        };
    }])


    ///  使用方法如下： <p  ng-bind-html="demoapp  | expressionFilter"> {{demoapp}} </p>
    module.filter("expressionFilter", function () {
      var filterfun = function (inputstr) {
          /// 数据为空的处理
          if (inputstr) {
            for(var i=0,j=SNSExpressionData.DEFAULT.data.length;i<j;i++){
              var element = SNSExpressionData.DEFAULT.data[i];
              var temReg = element.actionData.replace(/\[/,'\/\\[').replace(/\]/,'\\]\/g');
              inputstr = inputstr.replace(eval(temReg), '<img  class="im-expression" src=' + '"' + SNSExpressionData.DEFAULT.folder + SNSExpressionData.DEFAULT.data[i].url + '"' + '/>');
            }
          }
          return inputstr;
      };
      return filterfun;
  })


module.filter('atMsgFilter',function(_){
	 var filterfun = function (data) {
	 	inputstr = data.content;

	 	try{
	 		var obj = JSON.parse(data.extend);
		 	if(!!obj){
		 		for(var x in obj){
					var atuser = obj[x];
		 			if(!!atuser.id && atuser.id == YYIMChat.getUserID()){
		 				var temp = '';
		 				var atByBofore = '<span class="atByColor">';
		 				var atByAfter = '</span>';
		 				temp += inputstr.slice(0,atuser.start);
				 		temp += atByBofore + inputstr.slice(atuser.start,atuser.end) + atByAfter;
				 		temp += inputstr.slice(atuser.end);

				 		var appendLength = atByBofore.length + atByAfter.length;

				 		for(var y in obj){
			 				var item = obj[y];
				 			if(!!item.id && item.id != atuser.id){
					 			if(item.start >= atuser.end){
					 				item.start += appendLength;
					 				item.end += appendLength;
					 			}
					 		}
				 		}
				 		atuser.start += atByBofore.length;
				 		atuser.end += appendLength;
				 		inputstr = temp;
		 			}
		 		}
		 	};
	 	}catch(e){

	 	}

        /// 数据为空的处理
        if (inputstr) {
            _.each(SNSExpressionData.DEFAULT.data, function (element, index, list) {
				var temReg = element.actionData.replace(/\[/,'\/\\[').replace(/\]/,'\\]\/g');
                inputstr = inputstr.replace(eval(temReg), '<img  class="expression" src=' + '"' + SNSExpressionData.DEFAULT.folder + SNSExpressionData.DEFAULT.data[index].url + '"' + '/>');
            })
        }

        return inputstr;
    };
    return filterfun;
});

    module.directive('imEmoji', [ function() {
       return {
            restrict:'AE',
            replace:true,
            scope:false,
            template:"<div class='im-emoji-wrapper' ng-click='hideEmojiPanel($event)'><div ng-click='emojiPanelClick($event)' class='im-emoji-panel'><a href='#' class='im-emoji-item' title={{item.actionData}} ng-repeat='item in SNSExpressionData.DEFAULT.data'><img title={{item.actionData}} ng-src={{'src/style/images/expression/default/'+item.url}}></img></a></div></div>",
            controller:function($scope, $element){
              $scope.SNSExpressionData = SNSExpressionData;
              $scope.showEmojiPanel = function(target){
                var pos = target.getBoundingClientRect();
                $element[0].style["display"]="block";
                var panel= $element[0].childNodes[0];
                $(panel).css({top:(pos.top-215)+"px",left:(pos.left-309-154)+"px"});
              }
              $scope.hideEmojiPanel = function(){
                $element[0].style["display"]="none";
              }
              $scope.emojiPanelClick = function(e){
                e.stopPropagation();
                e.preventDefault();
                var title = e.target.getAttribute("title");
                if(title){
                  $scope.insertEmoji(title);
                }
              }
            },
            link: function($scope, element, attrs) {

           }
          }

    }]);


  module.directive('imImage', [function() {
     return {
          restrict:'AE',
          replace:false,
          scope:false,
          template:"<div class='im-image-loading-label'>图片加载中...</div>",
          controller:function($scope, $element){
          },
          link: function($scope, $element, attrs) {
            var img=new Image();
            img.onload=function(e){
              $element.empty();
              $element.append(autosize(img,380,400));
            };
            img.onerror=function(){console.log("图片下载失败。。优化界面todo..");};
            img.src=attrs.imgSrc;
         }
        }

  }]);

  module.directive('imLoading', [function() {
     return {
          restrict:'AE',
          replace:true,
          scope:false,
          template:'<div ng-if="isLoadingMore" class="im-loading-wrapper"><div class="spinner9"><div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div></div></div>',
          link:function($scope, $element){
            $scope.isLoadingMore = false;
            $scope.showLoadingMore=function(){
              // $scope.$apply(function(){
                $scope.isLoadingMore = true;
              // });
            }
            $scope.hideLoadingMore=function(){
              // $scope.$apply(function(){
                $scope.isLoadingMore = false;
              // });
            }
          }
        }

  }]);



  module.directive('imList', ['$http','imService', function($http,imService) {
     return {
          restrict:'AE',
          replace:true,
          scope:false,
          templateUrl:'./src/modules/im/chatlist.html',
          link:function($scope, $element){
            var now = new Date();
            var now_year = now.getFullYear();
            var now_month = (now.getMonth()+1);
            var now_day = now.getDate();
            var timePoint = (new Date()).valueOf()/1000;
            var nullTimeCount = 0;

            $scope.formartImTime = function(timestr){
              try{
                var date = new Date(timestr*1000);
                var year = date.getFullYear();
                var month = (date.getMonth()+1);
                var day = date.getDate();
                var hour = date.getHours();
                var minu = date.getMinutes();
                minu = minu<10?("0"+minu):minu;
                var second = date.getSeconds();
                second = second<10?("0"+second):second;
                if(now_year == year && now_month == month && day == now_day){
                  return hour+":"+minu+":"+second;
                }
                return year+"-"+month+"-"+day+" "+hour+":"+minu+":"+second;
              }catch(e){
                return "";
              }
            }

            $scope.formartListTime = function(data){
              for(var i=data.length-1;i>=0;i--){
                var itemTime,item = data[i];

                try{
                  itemTime = parseInt(item.sendtime);
                  var diff = Math.abs(timePoint - itemTime);
                  var diff_min = diff/60;
                  if(diff_min>=10||nullTimeCount>15){
                    timePoint = itemTime;
                    item["formatsendtime"] = $scope.formartImTime(itemTime);
                    nullTimeCount = 0;
                  }else{
                    item["formatsendtime"]="";
                    nullTimeCount+=1;
                  }
                  // itemTime= new Date(parseInt(item.sendtime)*1000);
                }catch(e){
                    item["formatsendtime"]="";
                }
              }
              return data;
            }

            $scope.loadMessage=function(para){
              var dataSouce = imService.dataSouce[$scope.id];

              if(!para.isLoadMore&&dataSouce&&dataSouce.length>0){
                $scope.list = dataSouce;
                $scope.listScrollToBottom();
                return;
              }
              $scope.showLoadingMore();
              var needScrollToBottom = true;
              var endid = parseInt(window.currentWin.msg_id);
              if($scope.list.length>0){
                endid = $scope.list[0].id;
                needScrollToBottom = false;
              }
              imService.GetMsgList({
                      //第一次加载的时候id需要加1 不然获取不到最近的那条消息
                      endid:needScrollToBottom?endid+1:endid,
                      success:function(data) {
                          data = $scope.formartListTime(data||[]);
                          $scope.list = data.concat($scope.list);
                          imService.dataSouce[$scope.id] = $scope.list;
                          $scope.hideLoadingMore();
                          $scope.setListPosWhenLoadMore();
                          if(needScrollToBottom){
                            $scope.listScrollToBottom();
                          }
                      },
                      error:function(err) {
                         $scope.hideLoadingMore();
                      }
                  })
            }
          },
          controller:function($scope, $element){
            var timeId = null;
            var beforeScrollTop = 0;

            $scope.setListPosWhenLoadMore=function(){
              window.setTimeout(function(){
                   $element[0].scrollTop = $element[0].scrollHeight - curScrollHeight;
                 },1);
            }
            $scope.listScrollToBottom=function(){
              if(timeId){
                window.clearTimeout(timeId);
              }
              timeId = window.setTimeout(function(){
                beforeScrollTop=($element[0].scrollHeight - $element[0].offsetHeight);
                $element[0].scrollTop = beforeScrollTop;
                // $($element[0]).animate({scrollTop: beforeScrollTop}, 200);
              },10);
            }


            var curScrollHeight = 0;
            $($element[0]).bind("scroll",function(e){
              var scrollTop = $element[0].scrollTop;
              if(scrollTop<beforeScrollTop){
                if($element[0].scrollTop<2){
                  if($scope.isLoadingMore){
                    return;
                  }
                  curScrollHeight = $element[0].scrollHeight;
                  $scope.loadMessage({isLoadMore:true});
                }
              }
              beforeScrollTop = scrollTop;
            });
          }
        }

  }]);






});
