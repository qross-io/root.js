
// INPUT 标签扩展

class Input {

    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            
            //不需要名字，其他不使用的原生属性也不进类。
            //这个组件的目的是对 INPUT 进行扩展，而不是生成另外一个新组件
            
            type: 'text', //非常重要！不同的类型有不同的样式、操作和判断逻辑

            required: '', //当未输入值为空时提示的文字
            invalid: '', //当输入的值无效时（未通过验证器验证）提示的文字
            validator: '', //正则表达式验证器，根据不同的 type 类型设定不同的值

            minLength: 0, //最小长度是最基本验证，比如姓名最少要输入两个字
            status: 'ORIGIN|INCORRECT|CORRECT', //当值改变时切换状态，注意判断时用大写。这个属性非常重要！

            //样式需要实现，使用 root.css 中的样式即可
            className: function(value) {
                if (value == null) {
                    value = this.required == '' ? 'input-optional-class' : 'input-required-class';
                }
                return value;
            },
            focusClass: 'input-focus-class', //获得焦点样式
            warnClass: 'input-warn-class', //值为空或验证无效时的样式，根据 root.css 中的样式修改一个，红边框浅色偏红的背景

            icon: function(value) {
                if (value == null) {
                    value = ''; //根据不同的类型选择不同的 iconfont 图标（自动设置）
                }
                return value;
            }
        }).elementify(element => {
            this.type = this.type.toLowerCase();
            this.element = element;
        });      
    }
}

Input.prototype.warn = function() {
    //当值为空或验证无效时提醒文字，在文本框的后面创建一个 SPAN，移动端可回行（注意间距）
}

Input.prototype.apply = function() {
    let input = this;
    $x(this.element).on('focus', function(ev) {
        input.element.className = input.focusClass;
    });

    //失去焦点时对值进行检查
    $x(this.element).on('blur', function(ev) {
        input.element.className = input.className;
    });
}

// 因为没有事件，也没有可用方法，所以自定义选择器没有意义，使用原生的事件和选择器。

Input.initializeAll = function() {
    $x('INPUT').objects.forEach(input => {
        //calendar 已被占用
        if (!/^calendar$/i.test(input.type.trim())) {
            new Input(input).apply();
        }        
    });
}

$ready(function() {
    Input.initializeAll();
});