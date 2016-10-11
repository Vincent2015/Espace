define(['../module'], function(module) {
module.filter("expressionFilter", function (_) {
    var filterfun = function (inputstr) {
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
})