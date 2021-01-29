
// INPUT 标签扩展

class Input {

    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            
            //不需要名字，其他不使用的原生属性也不进类。
            //这个组件的目的是对 INPUT 进行扩展，而不是生成另外一个新组件
            
            type: 'text', //非常重要！不同的类型有不同的样式、操作和判断逻辑

            requiredText: null, //当未输入值为空时提示的文字
            // message:'not null',
            invalidText: '', //当输入的值无效时（未通过验证器验证）提示的文字
            validator: '', //正则表达式验证器，根据不同的 type 类型设定不同的值
            minLength: 0, //最小长度是最基本验证，比如姓名最少要输入两个字
            // _status: 'ORIGN', //当值改变时切换状态，注意判断时用大写。这个属性非常重要！ status: Enum('origin','incorrect','correct'), //当值改变时切换状态，注意判断时用大写。这个属性非常重要！

            //样式需要实现，使用 root.css 中的样式即可
            className: function(value) {
                if (value == '') {
                    value = this.requiredText == null ? 'input-optional-class' : 'input-required-class';
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
            this.element = element;
            this.type = this.type.toLowerCase();

            this.element.status = 'correct';//状态赋值
            this.element.className = this.className;
        });
    }
}

Input.prototype.warnSpan = null;//验证失败 生成span warnSpan

Input.prototype.warn = function(spanText) {
    //$root.isMobile判断是否移动端 调整span位置
    let spanClass = 'span-warn-class';
    if ($root.isMobile) {
        spanClass = 'span-warn-mobile-class';
    }
    //判断是否span已经存在
    if($x(this.element).parent().select('span').objects.length == 0) {
        this.warnSpan = $create('SPAN', {innerHTML: spanText}, { }, {class: spanClass })
        $x(this.element).insertBehind(this.warnSpan);//添加警示
    }
    //当值为空或验证无效时提醒文字，在文本框的后面创建一个 SPAN，移动端可回行（注意间距）
    this.element.status = 'incorrect';
    this.element.className = this.warnClass;
}

Input.prototype.removeWarn = function() {
    //input事件绑定 可能会添加不止一个span
    $x(this.warnSpan).remove();
    this.element.className = this.className;
}

Input.prototype.validate = function() {
    //验证方法 按情况 有正则验证走正则 否则非空验证
    if (this.requiredText != null && this.element.value.$trim() == '') {
        this.warn(this.requiredText);
        return false;
    }
    else if (this.minLength != 0 && this.element.value.$trim().length < this.minLength) {
        this.warn(this.requiredText||this.invalidText);
        return false;
    }
    else if (this.validator != '') {//validator有值 按正则判断走
        let reg;
        if (this.validator.startsWith('/')) {
            reg = eval(this.validator)
        } else {
            reg = new RegExp(this.validator);
        }
            if (!reg.test(this.element.value)) {//验证失败
                this.warn(this.invalidText);
                return false;
            } else {
                return true;
            }
    }
    else {
        return true;
    }
}

Input.prototype.apply = function() {
    let input = this;
    //聚焦 重新输入时暂时清除warn相关
    $x(this.element).on('focus', function(ev) {
        if (input.element.status == 'incorrect') {
            input.removeWarn();
        }
        input.element.className = input.focusClass;
    });

    //失去焦点时对值进行检查
    $x(this.element).on('input,blur', function(ev) {//
        input.element.className = input.className;
        if (input.requiredText != '' || input.validator != '' || this.minLength != 0) {//必填 或正则有值 或设置了最小长度 三者之一走验证
            if(input.validate()) {
                //返回true 验证成功 失败的返回法拉瑟
                if (input.element.status == 'incorrect') {
                    input.removeWarn();
                }
                input.element.status = 'correct';
                input.removeWarn();
            }
            else {//返回false 验证失败 warn方法在validate里调
                input.element.status = 'incorrect';
            }
        }
        else {
            input.element.status = 'correct';
        }
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