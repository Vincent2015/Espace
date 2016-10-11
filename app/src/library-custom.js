/**
 * Created by Gin on 16/6/7.
 */
(function(me,$){
    /**
     * 加载框
     * @param time (毫秒)
     * @param auto (是否自动停止模式:true,false)
     */
    me.showloading = function (time, auto,fn) {
        if(!time){
          time = 1000;
        }
        var esn_three_bounce = document.createElement('div');
        esn_three_bounce.classList.add('esn-three-bounce');
        var esn_bounce1 = document.createElement('div');
        esn_bounce1.classList.add('esn-child');
        esn_bounce1.classList.add('esn-bounce1');
        var esn_bounce2 = document.createElement('div');
        esn_bounce2.classList.add('esn-child');
        esn_bounce2.classList.add('esn-bounce2');
        var esn_bounce3 = document.createElement('div');
        esn_bounce3.classList.add('esn-child');
        esn_bounce3.classList.add('esn-bounce3');

        esn_three_bounce.appendChild(esn_bounce1);
        esn_three_bounce.appendChild(esn_bounce2);
        esn_three_bounce.appendChild(esn_bounce3);


        document.body.appendChild(esn_three_bounce);
        // var result = (fn && typeof(fn) === 'function') && fn();
        // if(auto || result){
        //     window.setTimeout(function () {
        //       //  document.body.removeChild(esn_three_bounce);
        //       this.stoploading();
        //     },time);
        // }
    }
    me.stoploading = function () {
        var loading = document.getElementsByClassName('esn-three-bounce');
        if(loading.length > 0) {
            //document.body.removeChild(loading[0]);
            loading[0].remove();
        }
    }

    /**
     *
     * @param msg 显示内容
     * @param time 浮现时间
     */
    me.toast = function (msg, time) {
        var mask = document.createElement('div');
        mask.classList.add('esn-mask');
        var toast = document.createElement('div');
        toast.classList.add('esn-toast');
        console.log(msg)
        toast.innerText = msg;
        mask.appendChild(toast);
        document.body.appendChild(mask);
        if(!time){
            time = 1000;
        }
        window.setTimeout(function () {
          // if(mark){
              document.body.removeChild(mask);
          // }
        },time);
        return mask;
    }
    me.quitTost = function(){
        var esn_mask = document.getElementsByClassName('esn-mask');
        if(esn_mask.length > 0) {
            document.body.removeChild(esn_mask[0]);
        }
    }

    me.singleConfirm = (function(){
        var unique;
        function getInstance(opts){
            if(unique === undefined ){
                unique = new Construct(opts);
            }
            return unique;
        }
        function Construct(opts){
            var content = opts.msg || '密码输入错误，是否重置密码？'
            var confirm = $('<div class="esn-confirm-mask">'+
                                '<div class="esn-warp">'+
                                    '<div class="esn-content text-ellipsis">'+content+'</div>'+
                                          '<div class="esn-btns">'+
                                              '<div class="esn-ok">确定</div>'+
                                              '<div class="esn-cancle">取消</div>'+
                                          '</div>'+
                                    '</div>'+
                                '</div>'+
                            '</div>');
            confirm.on('click',function(e){
               e.stopPropagation();
               e.preventDefault();
               return;
            })
            confirm.find(".esn-ok").on("click",function(e){
               e.stopPropagation();
               e.preventDefault();
               unique = undefined;
               (opts.confirm && typeof(opts.confirm) === 'function') && opts.confirm();
               $(".esn-confirm-mask").remove();
            });
            confirm.find(".esn-cancle").on("click",function(e){
               unique = undefined;
               e.stopPropagation();
               e.preventDefault();
               (opts.cancle && typeof(opts.cancle) === 'function') && opts.cancle();
               $(".esn-confirm-mask").remove();
            });
            $(document.body).append(confirm);
        }
        return {
          getInstance : getInstance
        }
    })();
}(window,jQuery));
