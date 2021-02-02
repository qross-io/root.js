
// INPUT 标签扩展

class Input {

    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            
            name: 'TextBox_' + document.components.size,
            type: 'text', //非常重要！不同的类型有不同的样式、操作和判断逻辑

            requiredText: '', //当未输入值为空时提示的文字
            invalidText: '', //当输入的值无效时（未通过验证器验证）提示的文字
            validText: '', //验证成功之后的提示文字

            validator: '', //正则表达式验证器，根据不同的 type 类型设定不同的值
            minLength: 0, //最小长度是最基本验证，比如姓名最少要输入两个字

            className: '',
            focusClass: 'input-focus-class', //获得焦点样式
            warnClass: 'input-warn-class', //值为空或验证无效时的样式
            validClass: 'input-valid-class', //输入值验证成功之后的样式

            warnTextClass: 'span-warn-class',
            validTextClass: 'span-valid-class',

            get: null, //pre-process 获取组件的值时对值进行处理，value 代表文本框的值，如 value.trim()
            set: null, //post-process 设置组件的值时对值进行处理，value 代表文本框的值            
            preventInjection: null, //防止SQL注入攻击，当获取值是将单引号替换成两个单引号
            
            icon: function(value) {
                if (value == null) {
                    value = ''; //根据不同的类型选择不同的 iconfont 图标（自动设置）
                }
                return value;
            }
        }).elementify(element => {
            this.element = element;
            this.type = this.type.toLowerCase();
            this.required = this.requiredText != '' || this.invalidText != '';
            this._status = 2; //无值初始状态

            if (this.required) {
                if (this.className == '') {
                    this.className = 'input-required-class';
                }
                this.warnSpan = $create('SPAN', { innerHTML: '', className: this.warnTextClass });
                $x(this.element).insertBehind(this.warnSpan);

                if (this.element.value != '') {
                    this._status = 3; //有值初始状态
                    this.validate();
                }
            }
            else {
                this.warnSpan = null;
                if (this.className == '') {
                    this.className = 'input-optional-class';
                }
            }
            this.element.className = this.className;            
        });
    }

    get warnText() {
        return this.warnSpan != null ? this.warnSpan.innerHTML : '';
    }
    
    set warnText(text) {
        if (this.warnSpan != null) {
            this.warnSpan.innerHTML = text;
            this.warnSpan.className = (this.status != 1 ? this.warnTextClass : this.validTextClass);
        }
    }

    get status() {
        return this._status;
    }

    set status(status) {
        this._status = status;
    }

    get value() {
        let value = this.element.value;
        if (this.preventInjection != null) {
            value = value.replace(/'/g, '\'\'');
        }
        if (this.get != null) {
            value = function(exp, value) { return eval(exp); }.call(this.element, this.get, value);
        }
        return value;
    }

    set value(value) {
        if (this.set != null) {            
            this.element.value = function(exp, value) { return eval(exp); }.call(this.element, this.set, value);
        }
        else {
            this.element.value = value;
        }
    }
}

Input.prototype.validate = function () {
    //验证方法 按情况 有正则验证走正则 否则非空验证
    // 0 空 -1 不正确 1 验证通过
    if (this.requiredText != '' && this.element.value.$trim() == '') {
        this.status = 0; //无值空状态
        this.warnText = this.requiredText;        
    }
    else if (this.minLength != 0 && this.element.value.$trim().length < this.minLength) {
        this.status = -1; //有值验证失败状态
        this.warnText = this.invalidText;        
    }
    else if (this.validator != '') {
        //validator有值 按正则判断走
        let regex = (this.validator.startsWith('/') ? eval(this.validator) : new RegExp(this.validator));
        if (regex.test(this.element.value)) {
            this.status = 1; //有值验证成功状态
            this.warnText = this.validText;            
        }
        else {
            this.status = -1;
            this.warnText = this.invalidText;            
        }
    }
    else {
        this.status = 1;
        this.warnText = this.validText;        
    }

    if (this.status == 1) {
        this.element.className = this.validClass;
    }
    else {
        this.element.className = this.warnClass;
    }
}

Input.prototype.apply = function() {
    //验证事件
    let input = this;        
    //重新输入时暂时清除 warning
    $x(this.element).on('focus', function(ev) {
        if (input.required && input.warnText != '') {
            input.warnText = '';
        }
        input.element.className = input.focusClass;
    });

    //失去焦点时对值进行检查
    $x(this.element).on('blur', function(ev) {
        if (input.required) {
            input.validate();
        }
        else {
            input.element.className = input.className;
        }
    });

    //输入时对值进行检查
    $x(this.element).on('input', function(ev) {
        if (input.required) {
            input.validate();
        }
    });
}

// 因为没有事件，也没有可用方法，所以自定义选择器没有意义，使用原生的事件和选择器。

Input.initializeAll = function() {
    $x('INPUT').objects.forEach(input => {
        //限制 type 
        if (/^(text)$/i.test(input.type.trim())) {
            new Input(input).apply();
        }        
    });
}

$ready(function() {
    Input.initializeAll();
});