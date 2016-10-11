define(['../module'], function(module) {
	module.directive('newsview', [ function() {
		 return {
					restrict:'AE',
					replace:true,
					scope:{
						item : "=item"
					},
					template:"<div class='esn-msg-news'></div>",
					link: function($scope, element, attrs) {
            var item = $scope.item;
            if (item && item.data.content) {
              for (var i = 0; i < item.data.content.length; i++) {
                if (i==0) {
                  element.append("<div class='newsItem' contentsrc='"+item.data.content[i].contentSourceUrl+"'><img src='"+item.data.content[i].thumbId+"' style='width:100%;'/><span class='newstitle'>"+item.data.content[i].title+"</span></div>");
                } else {
                  element.append("<div class='newsItem' contentsrc='"+item.data.content[i].contentSourceUrl+"'><div class='newitemContent'>"+item.data.content[i].title+"</div><img src='"+item.data.content[i].thumbId+"' style='width:60px;height:60px;'/></div>");
                }
              }
              for (var i = 0; i < element[0].children.length; i++) {
                jQuery(element[0].children[i]).bind("click",element[0].children[i].getAttribute('contentsrc'),function(param){
                  if (typeof require != "undefined") {
              				try {
              					if (!!require('nw.gui')) {
              						this.gui = require('nw.gui');
              					}
              				}
              				catch (err){}
              		}
            			this.gui.Shell.openExternal(param.data);
                });
              }
            }




					 }



				}

	}]);
})
