
// INPUT 标签扩展

HTMLInputElement.valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

$enhance(HTMLInputElement.prototype)
    .declare({
        requiredText: '',
        invalidText: '',
        validText: '',

        validator: '',
        focusClass: 'input-focus-class', //获得焦点样式
        warnClass: 'input-warn-class', //值为空或验证无效时的样式
        validClass: 'input-valid-class', //输入值验证成功之后的样式
        warnTextClass: 'span-warn-class',
        validTextClass: 'span-valid-class',

        get: null, //pre-process 获取组件的值时对值进行处理，value 代表文本框的值，如 value.trim()
        set: null, //post-process 设置组件的值时对值进行处理，value 代表文本框的值            
        preventInjection: null, //防止SQL注入攻击，当获取值是将单引号替换成两个单引号

        icon: null //根据不同的类型选择不同的 iconfont 图标（自动设置）
    })
    .setter({
        'validator': function(value) {
            this.validate();
        }
    })
    .define({
        required: {
            get () {
                return this.requiredText != '' || this.invalidText != '' || this.element.minLength > 0;
            }
        },
        status: {
            get () {
                return this._status;
            },
            set (value) {                
                if (value != this._status) {
                    if (HTMLInputElement.setterX.has('status')) {
                        NativeElement.executeAopFunction(this, HTMLInputElement.setterX.get('status'), value);                        
                    }
                    this._status = value;
                }                
            }
        },
        warnText: {
            get () {
                return this.warnSpan != null ? this.warnSpan.innerHTML : '';
            },
            set (text) {
                if (this.warnSpan != null) {
                    this.warnSpan.innerHTML = text;
                    this.warnSpan.className = (this.status != 1 ? this.warnTextClass : this.validTextClass);
                }
            }
        },
        value: {
            get () {
                let value = HTMLInputElement.valueDescriptor.get.call(this); //this.value
                if (this.preventInjection != null) {
                    value = value.replace(/'/g, '\'\'');
                }
                if (this.get != null) {
                    value = function(exp, value) { return eval(exp); }.call(this, this.get, value);
                }
                return value;
            },
            set (value) {
                if (this.set != null) {            
                    value = function(exp, value) { return eval(exp); }.call(this, this.set, value);
                }
                //this.value = value;
                HTMLInputElement.valueDescriptor.set.call(this, value);                
            }
        }        
    });

HTMLInputElement.prototype.warnSpan = null;
HTMLInputElement.prototype._status = 2; //无值初始状态
   
HTMLInputElement.prototype.validate = function () {
    //验证方法 按情况 有正则验证走正则 否则非空验证
    // 0 空 -1 不正确 1 验证通过
    if (this.requiredText != '' && this.value.$trim() == '') {
        this.status = 0; //无值空状态
        this.warnText = this.requiredText;        
    }
    else if (this.minLength > 0 && this.value.$trim().length < this.minLength) {
        this.status = -1; //有值验证失败状态
        this.warnText = this.invalidText;        
    }
    else if (this.validator != '') {
        //validator有值 按正则判断走
        let regex = (this.validator.startsWith('/') ? eval(this.validator) : new RegExp(this.validator));
        if (regex.test(this.value)) {
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
        this.className = this.validClass;
    }
    else {
        this.className = this.warnClass;
    }
}
    
HTMLInputElement.prototype.initialize = function() {
    if (this.required) {
        if (this.className == '') {
            this.className = 'input-required-class';
        }
        this.warnSpan = $create('SPAN', { innerHTML: '', className: this.warnTextClass });
        $x(this).insertBehind(this.warnSpan);

        if (this.value != '') {
            this._status = 3; //有值初始状态
            this.validate();
        }
    }
    else {
        if (this.className == '') {
            this.className = 'input-optional-class';
        }
    }

    //验证事件
    //重新输入时暂时清除 warning
    $x(this).on('focus', function(ev) {
        if (this.required && this.warnText != '') {
            this.warnText = '';
        }
        this.className = this.focusClass;
    });

    //失去焦点时对值进行检查
    $x(this).on('blur', function(ev) {
        if (this.required) {
            this.validate();
        }
        else {
            this.className = this.className;
        }
    });

    //输入时对值进行检查
    $x(this).on('input', function(ev) {
        if (this.required) {
            this.validate();
        }
    });
}

$ready(function() {
    $a('INPUT').forEach(input => {
        //限制类型 text
        if (/^(text)$/i.test(input.type)) {                        
            if (input.getAttribute('root') == null) {
                input.setAttribute('root', 'INPUT');
                input.initialize();
            }            
        }        
    });
});