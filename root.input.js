//-----------------------------------------------------------------------
// INPUT 标签扩展
//-----------------------------------------------------------------------

HTMLInputElement.valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
HTMLInputElement.checkedDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked');

$enhance(HTMLInputElement.prototype)
    .defineProperties({
        type: {
            get() {
                return this.getAttribute('type');
            },
            set (value) {
                this.setAttribute('type', value);
            }
        },
        $required: {
            get () {
                //required 是原生属性  $required 有更多要求
                return this.required || this.pattern != '' || this.patternIgnoreCase != '' || this.validator != '' || this.requiredText != '' || this.invalidText != '' || this.minLength > 0 || this.min != '' || this.max != '';
            }
        },

        requiredText: '',
        invalidText: '', //当格式不正确时的提醒文字
        validText: '',

        ifEmpty: '',

        successText: '',        
        failureText: '', 
        exceptionText: '',

        focusClass: '', //获得焦点样式
        errorClass: '', //值为空或验证无效时的样式
        validClass: '', //输入值验证成功之后的样式
       
        errorTextClass: 'span-error',
        validTextClass: 'span-valid',

        autosize: false,

        getter: null, //pre-process 获取组件的值时对值进行处理，value 代表文本框的值，如 value.trim()
        setter: null, //post-process 设置组件的值时对值进行处理，value 代表文本框的值            

        positive: false, //number 类型下是否要求正数
        precision: -1,
        pad: false, //是否在小数时自动补 0
        strength: 'weak|strong|complex', //password only
        fit: '', //repeat-password only

        theme: 'switch|checkbox|whether', //switch only,
        
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
        calloutPosition: {
            get() {
                return this.getAttribute('callout-position') ?? this.getAttribute('callout');
            },
            set(position) {
                this.setAttribute('callout-position', position);
            }
        },
        messageDuration: {
            get() {
                return this.getAttribute('message-duration') ?? this.getAttribute('message');
            },
            set(duration) {
                this.setAttribute('message-duration', duration);
            }
        },
        hintElement: {
            get() {
                if (this._hintElement === undefined) {
                    this.hintElement = this.getAttribute('hint') ?? this.getAttribute('hint-element');
                }
                return this._hintElement;
            },
            set(element) {
                if (element == '' || (element == null && this.calloutPosition == null && this.messageDuration == null)) {
                    this._hintElement = $create('SPAN', { innerHTML: '', className: this.errorTextClass });            
                    this.insertAdjacentElement('afterEnd', this._hintElement);
                    this.insertAdjacentHTML('afterEnd', ' &nbsp; ');
                }
                else {
                    this._hintElement = $parseElement(element, 'hintElement');
                }                
            }
        },
        hintText: {
            get () {
                return this.hintElement?.text ?? '';
            },
            set (text) {
                if (this._inputable) {
                    if (this._blured) {                    
                        if (this.hintElement != null) {
                            this.hintElement.text = text;
                            if (this.status != HTMLInputElement.STATUS.VALID) {
                                this.hintElement.removeClass(this.validTextClass).addClass(this.errorTextClass);
                            }
                            else {
                                this.hintElement.removeClass(this.errorTextClass).addClass(this.validTextClass);
                            }
                            this.hintElement.hidden = text == '';
                        }
                        
                        if (text != '' && this.calloutPosition != null) {
                            Callout(text).position(this, this.calloutPosition).show();
                        }

                        if (text != '' && this.messageDuration != null) {
                            window.Message?.[this.status != HTMLInputElement.STATUS.VALID ? 'red' : 'green'](text).show(this.messageDuration.toFloat(0));
                        }
                    }
                }
                else if (text != '') {
                    Callout(text).position(this, this.calloutPosition).show();
                }
            }
        },
        value: {
            get () {
                let value = HTMLInputElement.valueDescriptor.get.call(this);
                if (this.getter != null) {
                    value = (function(exp, value) { return eval(exp); }).call(this, this.getter, value);
                }
                return value;
            },
            set (value) {
                if (this.setter != null) {
                    value = (function(exp, value) { return eval(exp); }).call(this, this.setter, value);
                }
                HTMLInputElement.valueDescriptor.set.call(this, value);
                if (this.$required) {
                    this.validate(true);
                }
            }
        },
        validator: {
            get() {
                return this.getAttribute('validator', '');
            },
            set(validator) {
                this.setAttribute('validator', validator);
            }
        },
        patternIgnoreCase: {
            get() {
                return this.getAttribute('pattern-i') ?? this.getAttribute('pattern-ignore-case', '');
            },
            set(pattern) {
                this.removeAttribute('pattern-ignore-case');
                this.setAttribute('pattern-i', pattern.source ?? pattern);
            }
        },
        checked: {
            get() {
                return HTMLInputElement.checkedDescriptor.get.call(this);
            },
            set(checked) {
                HTMLInputElement.checkedDescriptor.set.call(this, $parseBoolean(checked, true));
            }
        },
         //根据不同的类型选择不同的 iconfont 图标（自动设置）
        icon: {
            get () {
                return this.getAttribute('icon') || '';                
            },
            set (value) {
                this.setAttribute('icon', value);
                if (this.iconA == null) {
                    this.iconA = $create('A', { id: this.id + 'Icon', href: 'javascript:void(0)' }, { 'marginLeft': '-24px' });
                    if (this.type == 'datetime')  {
                        this.iconA.id = this.id + 'Popup_OpenButton';
                    }
                    else if (this.type == 'calendar') {
                        this.iconA.setAttribute('sign', 'CALENDAR-BUTTON');
                    }
                    this.insertAdjacentElement('afterEnd', this.iconA);
                    
                    this.setAttribute('relative', '#' + this.iconA.id);
                }
                else {
                    this.iconA.firstElementChild.remove();
                }

                if (value.startsWith('icon-') && !value.includes('.')) {
                    this.iconA.innerHTML = '<i class="iconfont ' + value + '"></i>';
                }
                else {
                    this.iconA.innerHTML = '<img src="' + value + '" align="absmiddle" />';
                }
            }
        },
        //switch/checkbox only
        options: {
            get () {
                if (this._options == null) {
                    let options = this.getAttribute('options');
                    if (options != null) {
                        options = options.trim();
                        if ((options.startsWith('{') && options.endsWith('}')) || (options.startsWith('[') && options.endsWith(']'))) {
                            this._options = JSON.eval(options);
                        }
                        else {
                            this._options = options.split(',').map(v => v.trim());
                        }
                    }
                    else {
                        this._options = ['yes', 'no'];
                    }
                }
                return this._options;
            }
        },
        readonly: {
            get() {
                return $parseBoolean(this.getAttribute('readonly'), false, this);
            },
            set(readonly) {
                if (typeof(readonly) != 'boolean') {
                    readonly = $parseBoolean(readonly, true, this);
                }

                if (readonly) {
                    this.setAttribute('readonly', '');
                }
                else {
                    this.removeAttribute('readonly');
                }
            }
        },
        disabled: {
            get() {
                return $parseBoolean(this.getAttribute('disabled'), false, this);
            },
            set(disabled) {
                if (typeof(disabled) != 'boolean') {
                    disabled = $parseBoolean(disabled, false, this);
                }

                if (disabled) {
                    this.setAttribute('disabled', '');
                }
                else {
                    this.removeAttribute('disabled');
                }
            }
        },
        enabled: {
            get () {                
                return !this.disabled;
            },
            set (enabled) {
                if (typeof(enabled) != 'boolean') {
                    enabled = $parseBoolean(enabled, true, this);
                }
                this.disabled = !enabled;
            }
        },
        relations: {
            get() {
                if (this._relations == null) {
                    this._relations = new Set();
                }
                return this._relations;
            }
        },
        //pasword only
        fix: {
            get() {
                return this.getAttribute('fix') ?? '';
            }
        }
    })
    .defineEvents('onchange+', 'onmodify', 'onchange-checked', 'onchange-unchecked', 'onkeyenter');

HTMLInputElement.STATUS = {
    "FILLED": 3, //有值初始状态
    "VALUELESS": 2, //无值初始状态
    "VALID": 1, //正确的
    "EMPTY": 0, //空值
    "INCORRECT": -1, //错误的值
    "UNEXPECTED": -2, //不符合预期
    'EXCEPTION': -3 //后端请求出错
}

HTMLInputElement.prototype.defaultClass = null;
HTMLInputElement.prototype._hintElement = undefined;
HTMLInputElement.prototype.iconA = null;
HTMLInputElement.prototype.changed = false; //onblur 中使用
HTMLInputElement.prototype._status = HTMLInputElement.STATUS.VALUELESS; //无值初始状态
HTMLInputElement.prototype._blured = false; //是否已失去过一次焦点
HTMLInputElement.prototype._inputable = true;
HTMLInputElement.prototype._recent = null;
HTMLInputElement.prototype._options = null;
HTMLInputElement.prototype._relations = null; //关联的按钮
HTMLInputElement.prototype._timer = null; //最后一次修改的计时器
HTMLInputElement.prototype._timestamp = null;

//check 是否发起后端检查
HTMLInputElement.prototype.validate = function (check = false) {
    
    let pair = null;

    //验证方法 按情况 有正则验证走正则 否则非空验证    
    if ((this.required || this.requiredText != '') && this.value.trimPlus() == '') {
        this.status = HTMLInputElement.STATUS.EMPTY; //无值空状态        
    }
    else if (this.minLength > 0 && this.value.trimPlus().length < this.minLength) {
        this.status = HTMLInputElement.STATUS.INCORRECT; //有值验证失败状态
    }
    else if (this.pattern != '') {
        this.status = this.validity.patternMismatch ? HTMLInputElement.STATUS.INCORRECT : HTMLInputElement.STATUS.VALID;
    }
    else if (this.patternIgnoreCase != '') {
        this.status = new RegExp(this.patternIgnoreCase, 'i').test(this.value) ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.INCORRECT;        
    }
    else if (this.validator != '') {
        this.status = eval('_ = function(value) { return ' + this.validator + ' }').call(this, this.value) ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.INCORRECT;
    }
    else if (this.type == 'number' || this.type == 'integer' || this.type == 'float') {
        let value = $parseFloat(this.value, 0);
        if ((this.min == '' || value >= $parseFloat(this.min, 0)) && (this.max == '' || value <= $parseFloat(this.max, 0))) {
            this.status = HTMLInputElement.STATUS.VALID;
        }
        else {
            this.status = HTMLInputElement.STATUS.INCORRECT;
        }        
    }
    else if (this.type == 'password') {
        if (this.fit == '') {
            if (this.strength == 'complex') {
                if (this.value.length >= 8 && /[a-z]/.test(this.value) && /[A-Z]/.test(this.value) && /\d/.test(this.value) && /[\~\`\!\@\#\$\%\^\&\*\(\)\_\+\-\=\{\}\[\]\|\\\:\;\"\'\<\>\,\.\?\/]/.test(this.value)) {
                    this.status = HTMLInputElement.STATUS.VALID;
                }
                else {
                    this.status = HTMLInputElement.STATUS.INCORRECT;
                }
            }
            else if (this.strength == 'strong') {
                if (this.value.length >= 6 && /[a-z]/i.test(this.value) && /\d/.test(this.value)) {
                    this.status = HTMLInputElement.STATUS.VALID;
                }
                else {
                    this.status = HTMLInputElement.STATUS.INCORRECT;
                }
            }
            else {
                this.status = HTMLInputElement.STATUS.VALID;
            }

            if (this.value != '' && this.fix != '') {
                let rp = $s(this.fix);
                if (rp.value != '') {
                    rp.status = rp.value == this.value ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.INCORRECT;
                    pair = rp;
                }
            }
        }
        else {
            this.status = $s(this.fit, 'Password field id "' + this.fit + '" is incorrect.')?.value == this.value ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.INCORRECT;          
        }
    }
    else {
        this.status = HTMLInputElement.STATUS.VALID;
    }

    if (this.status == HTMLInputElement.STATUS.VALID) {
        if (check && this['onchange+'] != null) {
            this.disabled = true;
            $FIRE(this, 'onchange+',
                    function(data) {
                        this.hintText = this.successText.$p(this, data);
                        this.className = this.validClass; 
                    }, 
                    function(data) {
                        this.status = HTMLInputElement.STATUS.UNEXCEPTED;
                        this.className = this.errorClass;
                        this.hintText = this.failureText.$p(this, data);
                    },
                    function(error) {
                        this.status = HTMLInputElement.STATUS.EXCEPTION;
                        this.className = this.errorClass;
                        this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                    },
                    function() {
                        this.disabled = false;
                    }
                );
        }
        else {
            this.className = this.validClass;
            if (this.validText == '') {
                this.hintText = this.validText.$p(this);
            }
            if (this.calloutPosition != null) {
                Callout.hide();
            }

            if (pair != null) {
                if (pair.status == HTMLInputElement.STATUS.INCORRECT) {
                    pair.className = pair.errorClass;
                    pair.hintText = pair.invalidText.$p(pair);
                }
            }            
        }
    }
    else if (this.status == HTMLInputElement.STATUS.EMPTY) {        
        this.className = this.errorClass;
        this.hintText = this.requiredText.$p(this);
    }
    else {        
        this.className = this.errorClass;
        this.hintText = this.invalidText.$p(this);
    }
}

HTMLInputElement.prototype.ajust = function() {
    if (this.autosize) {
        let size = this.value.unicodeLength.max(3) + 1;
        if (this.minSize > 0) {
            if (size < this.minSize) {
                size = this.minSize;
            }
        }
        this.size = size;
    }
}

HTMLInputElement.prototype.update = function(value) {
    this.set('value', value);
}

HTMLInputElement.prototype.copy = function() {
    this.select();
    document.execCommand('Copy');
}

HTMLInputElement.prototype.check = function(checked = true) {
    if (this.type == 'checkbox') {
        this.indeterminate = false
        this.checked = checked;
    }
}

HTMLInputElement.prototype.uncheck = function() {
    if (this.type == 'checkbox') {
        this.indeterminate = false
        this.checked = false;
    }
}

HTMLInputElement.prototype.incheck = function() {
    if (this.type == 'checkbox') {
        this.indeterminate = true;
    }
}

HTMLInputElement.prototype.tocheck = function() {
    if (this.type == 'checkbox') {
        this.indeterminate = false;
        this.checked = !this.checked;        
    }
}

HTMLInputElement.prototype.enable = function() {
    this.disabled = false;
}

HTMLInputElement.prototype.disable = function() {
    this.disabled = true;
}

HTMLInputElement.prototype.initializeInputable = function() {

    this.previousValue = this.value;

    let input = this;
    this.minSize = this.getAttribute('size') == null ? 0 : this.size;
    this.ajust();
    
    //验证事件
    //重新输入时暂时清除 warning
    this.on('focus', function(ev) {
        if (this.$required) {
            this.hintElement?.hide();
        }
        this.className = this.focusClass;
    });

    //失去焦点时对值进行检查 - 值不变时走这个逻辑
    this.on('blur', function(ev) {
        if (!this._blured) {
            this._blured = true;
        }

        if (!this.changed) {
            this.hintElement?.show();
            if (this.$required) {                
                if (this.value == '') {
                    if (this.type != 'password' || this.fit == ''  || (this.fit != '' && ($(this.fit)?.value ?? '') != '')) {
                        this.status = HTMLInputElement.STATUS.EMPTY;
                        this.className = this.errorClass;
                        this.hintText = this.requiredText.$p(this);
                    }
                }
                else if (this.status == HTMLInputElement.STATUS.INCORRECT) {
                    this.className = this.errorClass;
                    this.hintText = this.invalidText.$p(this);
                }
                else {
                    this.className = this.validClass;
                }
            }
            else {
                this.className = this.defaultClass;
            }
        }
        else {
            this.changed = false;
        }
    });

    //失去焦点时对值进行检查 - 值改变时走这个逻辑
    this.on('change', function(ev) {
        this.changed = true;

        if (this.type == 'float' || this.type == 'number') {
            let value = this.value;
            if (this.type == 'float' || this.type == 'number') {
                if (this.precision > 0) {
                    if (value.includes('.')) {
                        let digits = value.takeAfter('.');
                        if (digits.length < this.precision) {
                            if (this.pad) {
                                digits = digits.padEnd(this.precision, '0');
                            }                            
                        }
                        else if (digits.length > this.precision) {
                            let v = digits.substring(this.precision, this.precision + 1).toInt();
                            digits = digits.substring(0, this.precision).toInt();
                            if (v > 4) {
                                digits += 1;
                            }
                            digits = String(digits).padStart(this.precision, '0');
                            if (!this.pad) {
                                digits = digits.replace(/0+$/, '');
                            }
                        }
                        value = value.takeBefore('.') + '.' + digits;
                    }
                    else if (this.pad && value != '') {
                        value = value + '.' + ''.padEnd(this.precision, '0');
                    }

                    value = value.replace(/^-?00+\./, $0 => $0.replace(/0+/, '0'));
                }
                else if (this.precision == 0) {
                    if (value.includes('.')) {
                        value = String(Math.round(value.toFloat()));
                    }
                }
            }

            value = value.replace(/^-?00+[1-9]/, $0 => $0.replace(/0+/, ''));

            if (value != this.value) {
                this.value = value;
            }
        }

        if (this.ifEmpty != '' && this.value == '') {
            this.value = this.ifEmpty;
        }

        //初始值不为空时
        if (this.value != this.defaultValue) {
            this._blured = true;
        }

        if (this.$required) {
            this.validate(true);
        }
        else {
            this.className = this.defaultClass;
        }
    });

    this._recent = this.value;
    //输入时对值进行检查    
    this.on('input', function(ev) {
        if (this.value.trim() != this._recent) {
            if (HTMLElement.hasEventListener(this, 'onmodify')) {
                if (this._timer != null) {
                    window.clearTimeout(this._timer);                
                }
                if (this._timestamp == null || new Date().valueOf() - this._timestamp > 250) {
                    this.dispatch('onmodify', { 'event': ev });
                    this._timestamp = new Date().valueOf();
                }
                else {
                    this._timer = window.setTimeout(function() {
                        input.dispatch('onmodify', { 'event': ev });
                    }, 250);
                }            
            }        

            if (this.$required) {
                this.validate(false);
            }

            this.ajust();
            this._recent = this.value;
        }
    });    

    if (this.type == 'integer') {
        this.onkeydown = function(ev) {
            return HTMLInputElement.Key.isInteger(ev, this);
        };
    }
    else if (this.type == 'float') {
        this.onkeydown = function(ev) {
            return HTMLInputElement.Key.isFloat(ev, this);            
        };
    }
    else if (this.type == 'number') {
        this.onkeydown = function(ev) {
            return HTMLInputElement.Key.isNumber(ev, this);
        }
    }
    else if (this.type == 'password') {
        if (this.fit != '') {
            $(this.fit, 'Password field id "' + this.fit + '" is incorrect.')?.setAttribute('fix', '#' + this.id);
        }
    }
    else if (this.type == 'name') {
        this.patternIgnoreCase = /.{2,}/;
    }
    else if (this.type == 'idcard') {
        this.patternIgnoreCase = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])([0-2][1-9]|10|20|30|31)\d{3}[0-9Xx]$/;
        this.maxLength = 18;
        this.style.textTransform = 'uppercase';
    }
    else if (this.type == 'mobile') {
        this.patternIgnoreCase = /^1[3-9]\d{9}$/;
        this.positive = true;
        this.maxLength = 11;
        this.onkeydown = function(ev) {
            return HTMLInputElement.Key.isInteger(ev, this);
        };
    }

    if (this.focusClass == '') {
        this.focusClass = this.className == '' ? 'input-focus' : this.className;
    }
    if (this.errorClass == '') {
        this.errorClass = this.className == '' ? 'input-error' : this.className;
    }
    if (this.validClass == '') {
        this.validClass = this.className == '' ? 'input-valid' : this.className;
    }

    if (this.$required) {
        if (this.className == '') {
            this.className = 'input-required';
        }

        this.defaultClass = this.className;

        if (this.value != '') {
            this._status = HTMLInputElement.STATUS.FILLED; //有值初始状态
            this.validate(false);
        }
    }
    else {
        if (this.className == '') {
            this.className = 'input-optional';
        }

        this.defaultClass = this.className;
    }

    //icon
    if (this.icon == '') {
        if (this.type == 'calendar' || this.type == 'datetime') {
            this.icon = 'icon-calendar';
        }
    }
    else {
        this.icon = this.icon;
    }

    //enter event
    if (this.getAttribute('enter') != null) {
        this.on('keypress', function(ev) {
            if (ev.keyCode == 13 && this.value != this.defaultValue) {
                let enter = this.getAttribute('enter');
                if (enter == '') {
                    this.blur();
                }
                else {
                    window.location.href = enter.$p(this);
                }                
            }
        });
    }

    this.on('keypress', function(ev) {
        if (ev.keyCode == 13) {
            input.dispatch('onkeyenter', { 'event': ev });
        }
    });

    Event.interact(this);

    if (this.hasAttribute('readonly')) {
        this.readonly = this.getAttribute('readonly');
    }
    
    if (this.hasAttribute('disabled')) {
        let disabled = $parseBoolean(this.getAttribute('disabled'), false);
        if (this.disabled != disabled) {
            this.disabled = disabled;
        }
    }
    else if (this.hasAttribute('enabled')) {
        this.enabled = $parseBoolean(this.getAttribute('enabled'), true);
    }

    document.on('load', function() {
        input.dispatch('onload');
    });
}

HTMLInputElement.prototype.initializeCheckable = function() {

    let input = this;
    this._inputable = false;

    if (this.type == 'switch') {
        this.status = HTMLInputElement.STATUS.VALID;
        this.hidden = true;
        let button = $create('IMG',
                                { src: `${$root.images}${this.theme}_${this.value == this.options[0] ? 'on' : 'off'}_default.${this.theme != 'checkbox' ? 'png' : 'gif'}`, align: 'absmiddle' },
                                { cursor: 'default' },
                                { 'sign': 'switch' });
        this.parentNode.insertBefore(button, this);

        button.onmouseover = function (ev) {
            this.src = this.src.replace('default', 'hover');
        }
    
        button.onmouseout = function (ev) {
            this.src = this.src.replace('hover', 'default');
        } 
    
        button.onmousedown = function (ev) {
            if (!input.disabled) {
                this.src = this.src.replace('hover', 'active');                               
                this.style.opacity = 0.5;
            }
        }
    
        button.onmouseup = function (ev) {
            if (!input.disabled) {
                input.value = input.value == input.options[0] ? input.options[1] : input.options[0];
                if (input['onchange+'] != null) {
                    input.disabled = true; 
                    $FIRE(input, 'onchange+',
                        function(data) {                            
                            this.hintText = this.successText.$p(this, data);  
                            button.src = button.src.replace((this.value == this.options[1] ? 'on' : 'off') + '_active', (this.value == this.options[1] ? 'off' : 'on') + '_hover');
                            this.dispatchEvent(new Event('change'))
                            if (this.value == this.options[0]) {
                                this.dispatch('onchange-checked', { 'event': ev });
                            }
                            else {
                                this.dispatch('onchange-unchecked', { 'event': ev });
                            }
                        }, 
                        function(data) {
                            this.hintText = this.failureText.$p(this, data);
                            button.src = button.src.replace('active', 'hover');
                        },
                        function(error) {
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                            button.src = button.src.replace('active', 'hover');
                        },
                        function() {
                            this.disabled = false;
                            button.style.opacity = 1;
                        }
                    );
                }
                else {
                    this.src = this.src.replace((input.value == input.options[1] ? 'on' : 'off') + '_active', (input.value == input.options[1] ? 'off' : 'on') + '_hover');
                    this.style.opacity = 1;
                    input.dispatchEvent(new Event('change'))
                    if (input.value == input.options[0]) {
                        this.dispatch('onchange-checked', { 'event': ev });
                    }
                    else {
                        this.dispatch('onchange-unchecked', { 'event': ev });
                    }
                }
            }            
        } 
    }
    else if (this.type == 'checkbox') {
        //this.checked = this.value == this.options[0];
        this.on('change', function(ev) {
            if (this['onchange+'] != null) {
                this.disabled = true;
                //this.value = this.checked ? this.options[0] : this.options[1];
                $FIRE(this, 'onchange+',
                        function(data) {
                            this.hintText = this.successText.$p(this, data);                            
                            if (this.$required) {
                                this.status = this.checked ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.EMPTY;
                            }
                            if (this.checked) {
                                this.dispatch('onchange-checked', { 'event': ev });
                            }
                            else {
                                this.dispatch('onchange-unchecked', { 'event': ev });
                            }
                        }, 
                        function(data) {
                            this.status = HTMLInputElement.STATUS.UNEXPECTED;
                            this.hintText = this.failureText.$p(this, data);
                        },
                        function(error) {
                            this.status = HTMLInputElement.STATUS.EXCEPTION;
                            this.className = this.errorClass;
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                        },
                        function() {
                            this.disabled = false;
                        }
                    );
            }
            else {
                if (this.$required) {
                    this.status = this.checked ? HTMLInputElement.STATUS.VALID : HTMLInputElement.STATUS.EMPTY;
                }
                if (this.checked) {
                    this.dispatch('onchange-checked', { 'event': ev });
                }
                else {
                    this.dispatch('onchange-unchecked', { 'event': ev });
                }
            }
        });        
    }

    Event.interact(this);

    if (this.hasAttribute('disabled')) {
        this.disabled = this.getAttribute('disabled');
    }
    else if (this.hasAttribute('enabled')) {
        this.enabled = this.getAttribute('enabled');
    }

    if (this.hasAttribute('checked')) {
        this.checked = this.getAttribute('checked');
    }

    document.on('load', function() {
        input.dispatch('onload');
    });
}

HTMLInputElement.prototype.initializeSelectable = function() {

    //未完成
    let input = this;
    this._inputable = false;

    if (this.type == 'stars') {
        let init = this.value.toInt(1);
        this.value = init;
        if (this.size > 5) {
            this.size = 5;
        }

        for (let i = 0; i < this.size; i++) {
            let star = $create('IMG',
                            { src: `${editor.imagesBaseUrl}star_${i < init ? 'enabled' : 'disabled'}.png`, width: editor.zoom, height: editor.zoom, align: 'absmiddle' },
                            { cursor: 'hand', marginLeft: '1px' },
                            { 'sign': 'star', 'value': i + 1, 'state': i < init ? 1 : 0 });        
            element.appendChild(star);

            star.onmouseover = function(ev) {
                this.width = editor.zoom + 1;
                this.height = editor.zoom + 1;
            }

            star.onmouseout = function(ev) {
                this.width = editor.zoom - 1;
                this.height = editor.zoom - 1;
            }

            star.onclick = function(ev) {
                if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
                    editor.editing = true;
                    editor.element = element;

                    let last = element.getAttribute("value").toInt();
                    let after = this.getAttribute("value").toInt();

                    if (after != last) {
                        if (editor.editing && !editor.updating && editor.execute('onupdate', after)) {
                            let stars = element.querySelectorAll('img[sign=star]');
                            if (editor.action != '') {
                                $cogo(editor.action.concatValue(after), element, after)
                                    .then(data => {
                                        if (editor.execute('onfinish', data, after)) {
                                            for (let j = 0; j < stars.length; j++) {
                                                stars[j].src = `${editor.imagesBaseUrl}star_${j < after ? 'enabled' : 'disabled' }.png`;                                    
                                            }
                                            element.setAttribute("value", after);

                                            editor.execute('oncomplete', after);
                                        }
                                    })
                                    .catch(error => {
                                        Callout(error).position(this).show();
                                        editor.execute('onerror', error);
                                    })
                                    .finally(() => {
                                        editor.updating = false;
                                        editor.editing = false;
                                        editor.element = null;
                                    });                                
    
                                this.updating = true;
                            }
                            else {                                
                                for (let j = 0; j < stars.length; j++) {
                                    stars[j].src = `${editor.imagesBaseUrl}star_${j < after ? 'enabled' : 'disabled' }.png`;                                    
                                }
                                element.setAttribute("value", after);

                                editor.execute('oncomplete', after);

                                editor.editing = false;
                                editor.element = null;
                            }
                        }
                    }
                    else {
                        editor.editing = false;
                        editor.element = null;
                    }                    
                }
            }
        }
    }
}

HTMLInputElement.Key = {
    ///		是不是[复制剪切粘贴]操作
    ///		ctrl+x
    ///		ctrl+c
    ///		ctrl+v
    isCopyCutPaste : function (ev) {
        if (ev.ctrlKey) {
            return (ev.keyCode == 88 || ev.keyCode == 67 || ev.keyCode == 86);
        }
        else {
            return false;
        }
    },
    ///		是不是[选择文本]操作
    ///		ctrl+shift+←→ 选择上一个单词下一个单词
    ///		shift+←→ 选择下一个字母上一个字母
    ///		ctrl+shift+home,end 选择光标前面或后面所有
    ///		shift+home,end 选择光标本行前面或后面所有
    ///		ctrl+a 选择所有
    isSelect : function (ev) {
        if (ev.shiftKey || (ev.ctrlKey && ev.shiftKey)) {
            return (ev.keyCode >= 35 && ev.keyCode <= 40);
        }
        else if (ev.ctrlKey && !ev.shiftKey) {
            return ev.keyCode == 65;
        }
        else {
            return false;
        }
    },
    ///		是不是[移动光标]操作
    ///		ctrl+←→ 移动到上一个单词下一个单词
    ///		←→ 移动到下一个字母上一个字母
    ///		ctrl+home,end 移动到段落开始或结尾
    ///		home,end 行动到行开始或结尾
    isMove : function (ev) {
        return (ev.keyCode >= 35 && ev.keyCode <= 40);
    },
    ///		是不是[删除文本]操作
    ///		ctrl+backspace 删除前一单词
    ///		backspace,insert,delete 删除
    ///		shift+del删除整行
    isDelete : function (ev) {
        if (ev.ctrlKey) {
            return ev.keyCode == 8;
        }
        else if (ev.shiftKey) {
            return ev.keyCode == 46;
        }
        else {
            return ev.keyCode == 8 || ev.keyCode == 45 || ev.keyCode == 46;
        }
    },
    isEdit : function (ev) {
        return HTMLInputElement.Key.isSelect(ev) || HTMLInputElement.Key.isMove(ev) || HTMLInputElement.Key.isDelete(ev) || ev.keyCode == 9 || ev.keyCode == 13 || HTMLInputElement.Key.isCopyCutPaste(ev);
    },
    isInteger : function (ev, input) {
        // -
        if (ev.keyCode == 189 || ev.keyCode == 109) {
            return !input.positive && input.value == '';
        }
        // 0-9
        else if (!ev.shiftKey && ((ev.keyCode >= 48 && ev.keyCode <= 57) || (ev.keyCode >= 96 && ev.keyCode <= 105))) {
            return true;
        }
        else {
            return HTMLInputElement.Key.isEdit(ev);
        }
    },
    isFloat: function (ev, input) {
        // -
        if (ev.keyCode == 189 || ev.keyCode == 109) {
            return !input.positive && input.value == '';
        }
        // .
        else if (ev.keyCode == 110 || ev.keyCode == 190) {
            return input.precision != 0 && /\d$/.test(input.value) && !input.value.includes('.');
        }
        // 0-9 
        else if (!ev.shiftKey && ((ev.keyCode >= 48 && ev.keyCode <= 57) || (ev.keyCode >= 96 && ev.keyCode <= 105))) {
            return true;
        }
        else {
            return HTMLInputElement.Key.isEdit(ev);
        }
    },
    isNumber: function(ev, input) {
        // -
        if (ev.keyCode == 189 || ev.keyCode == 109) {
            return !this.positive && this.value == '';
        }
        // .
        else if (ev.keyCode == 110 || ev.keyCode == 190) {
            return input.precision != 0;
        }
        // e +
        else if (ev.keyCode == 69 || ev.keyCode == 107 || (ev.shiftKey && ev.keyCode == 187)) {
            return false;
        }
        else {
            return true;
        }
    }
};

HTMLInputElement.initializeAll = function(container) {
    (container ?? document).querySelectorAll('INPUT').forEach(input => {
        if (!input.hasAttribute('root-input')) {
            input.setAttribute('root-input', '');
            HTMLElement.boostPropertyValue(input);            

            if (/^(text|password|number|float|integer|mobile|idcard|name|search|calendar|datetime|email)$/i.test(input.type)) {            
                input.initializeInputable();
            }
            else if (/^(switch|checkbox)$/i.test(input.type)) {
                input.initializeCheckable();
            }
            else if (/^(stars)$/i.test(input.type)) {
                input.initializeSelectable();
            }
        }
    });
}

document.on('post', function() {
    HTMLInputElement.initializeAll();
});