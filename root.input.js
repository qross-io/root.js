
// INPUT 标签扩展

HTMLInputElement.valueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

$enhance(HTMLInputElement.prototype)
    .declare({
        hint: null, //selector
        callout: null,
        requiredText: '',
        invalidText: '', //当格式不正确时的提醒文字
        validText: '',

        successText: '',        
        failureText: '', 
        exceptionText: '',

        validator: '',

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
        fit: '', //password only

        theme: 'switch|checkbox|whether', //switch only,
        
        onmodify: null,
        'onchange-checked': null,
        'onchange-unchecked': null
    })
    .getter({
        'strength': value => value.toUpperCase(),
        'precision': value => $parseInt(value, 0),
        'pad': value => $parseBoolean(value, false)
    })
    .extend('onchange+')
    .define({
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
                return this.required || this.pattern != '' || this.validator != '' || this.requiredText != '' || this.invalidText != '' || this.minLength > 0 || this.min != '' || this.max != '';
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
        hintText: {
            get () {
                return this.hintSpan != null ? this.hintSpan.innerHTML : '';
            },
            set (text) {
                if (this._inputable) {
                    if (this._blured) {                    
                        if (this.hintSpan != null) {
                            this.hintSpan.innerHTML = text;
                            this.hintSpan.className = (this.status != 1 ? this.errorTextClass : this.validTextClass);
                            this.hintSpan.style.display = text == '' ? 'none' : '';
                        }
                        
                        if (text != '' && this.callout != null) {
                            Callout(text).position(this, this.callout).show();
                        }                    
                    }
                }
                else if (text != '') {
                    Callout(text).position(this, this.callout == null ? 'upside' : this.callout).show();
                }
            }
        },
        value: {
            get () {
                let value = HTMLInputElement.valueDescriptor.get.call(this);
                if (this.getter != null) {
                    value = function(exp, value) { return eval(exp); }.call(this, this.getter, value);
                }
                return value;
            },
            set (value) {
                if (this.setter != null) {            
                    value = function(exp, value) { return eval(exp); }.call(this, this.setter, value);
                }
                HTMLInputElement.valueDescriptor.set.call(this, value);
                if (this.$required) {
                    this.validate(true);
                }
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
                    $x(this).insertBehind(this.iconA);
                    
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
                            this._options = Json.eval(options);
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
        }
    });

HTMLInputElement.prototype.defaultClass = null;
HTMLInputElement.prototype.hintSpan = null;
HTMLInputElement.prototype.iconA = null;
HTMLInputElement.prototype._status = 2; //无值初始状态
HTMLInputElement.prototype._blured = false; //是否已失去过一次焦点
HTMLInputElement.prototype._inputable = true; //是否已失去过一次焦点
HTMLInputElement.prototype._recent = null;
HTMLInputElement.prototype._options = null;
HTMLInputElement.prototype.relations = null; //关联的按钮

HTMLInputElement.prototype._timer = null; //最后一次修改的计时器
HTMLInputElement.prototype._timestamp = null;
   
HTMLInputElement.prototype.validate = function (toCheck = false) {
    //验证方法 按情况 有正则验证走正则 否则非空验证
    // 0 empty -1 incorrectd 1 valid -2 不符合预期
    if ((this.required || this.requiredText != '') && this.value.$trim() == '') {
        this.status = 0; //无值空状态       
    }
    else if (this.minLength > 0 && this.value.$trim().length < this.minLength) {
        this.status = -1; //有值验证失败状态
    }
    else if (this.pattern != '') {
        this.status = this.validity.patternMismatch ? -1 : 1;
    }
    else if (this.validator != '') {
        this.status = new RegExp(this.validator, 'i').test(this.value) ? 1 : -1;        
    }
    else if (this.type == 'number' || this.type == 'integer' || this.type == 'float') {
        let value = $parseFloat(this.value, 0);
        if ((this.min == '' || value >= $parseFloat(this.min, 0)) && (this.max == '' || value <= $parseFloat(this.max, 0))) {
            this.status = 1;
        }
        else {
            this.status = -1;
        }        
    }
    else if (this.type == 'password') {
        if (this.fit == '') {
            if (this.strength == 'complex') {
                if (this.value.length >= 8 && /[a-z]/.test(this.value) && /[A-Z]/.test(this.value) && /\d/.test(this.value) && /[\~\`\!\@\#\$\%\^\&\*\(\)\_\+\-\=\{\}\[\]\|\\\:\;\"\'\<\>\,\.\?\/]/.test(this.value)) {
                    this.status = 1;
                }
                else {
                    this.status = -1;
                }
            }
            else if (this.strength == 'strong') {
                if (this.value.length >= 6 && /[a-z]/i.test(this.value) && /\d/.test(this.value)) {
                    this.status = 1;
                }
                else {
                    this.status = -1;
                }
            }
            else {
                this.status = 1;
            }
        }
        else {
            let pwd = $s(this.fit);
            if (pwd == null) {
                console.error('Password field id "' + this.fit + '" is incorrect.');
                this.status = -1;
            }
            else {
                this.status = pwd.value == this.value ? 1 : -1;
            }            
        }
    }
    else {
        this.status = 1;
    }

    if (this.status == 1) {
        if (toCheck && this['onchange+'] != null) {
            this.disabled = true;
            $FIRE(this, 'onchange+',
                    function(data) {
                        this.hintText = this.successText.$p(this, data);
                        this.className = this.validClass; 
                    }, 
                    function(data) {
                        this.status = -2;
                        this.className = this.errorClass;
                        this.hintText = this.failureText.$p(this, data);
                    },
                    function(error) {
                        this.status = -1;
                        this.className = this.errorClass;
                        this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
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
            if (this.callout != null) {
                Callout.hide();
            }
        }
    }
    else if (this.status == 0) {        
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
        let size = this.value.$length(3) + 1;
        if (this.minSize > 0) {
            if (size < this.minSize) {
                size = this.minSize;
            }
        }
        this.size = size;
    }
}

HTMLInputElement.prototype.set = function(attr, value) {
    if (attr != null) {
        if (this[attr] != null) {
            this[attr] = value;
            if (attr == 'value') {
                this.ajust();
            }
        }
        else if (this[attr.toCamel()] != null) {
            this[attr.toCamel()] = value;
        }
        else {
            this.setAttribute(attr, value);
        }
    }    
}

HTMLInputElement.prototype.update = function(value) {
    this.set('value', value);
}

HTMLInputElement.prototype.copy = function() {
    this.select();
    document.execCommand('Copy');
}

HTMLInputElement.prototype.initializeInputable = function() {

    this.relations = new Set();

    let input = this;
    this.minSize = this.getAttribute('size') == null ? 0 : this.size;
    this.ajust();
    
    //验证事件
    //重新输入时暂时清除 warning
    $x(this).on('focus', function(ev) {
        if (this.$required && this.hintText != '') {
            this.hintText = '';
        }
        this.className = this.focusClass;
    });

    //失去焦点时对值进行检查
    $x(this).on('change', function(ev) {
        if (!this._blured) {
            this._blured = true;
        }

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
                            let v = digits.substr(this.precision, 1).toInt();
                            digits = digits.substr(0, this.precision).toInt();
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

        if (this.$required) {
            this.validate(true);
        }
        else {
            this.className = this.defaultClass;
        }
    });

    this._recent = this.value;
    //输入时对值进行检查    
    $x(this).on('input', function(ev) {
        if (this.value.trim() != this._recent) {
            if (this.onmodify != null || (this.id != '' && this.events.has('onmodify'))) {
                if (this._timer != null) {
                    window.clearTimeout(this._timer);                
                }
                if (this._timestamp == null || new Date().valueOf() - this._timestamp > 250) {
                    Event.execute(this, 'onmodify', ev);
                    this._timestamp = new Date().valueOf();
                }
                else {
                    this._timer = window.setTimeout(function() {
                        Event.execute(input, 'onmodify', ev);
                    }, 250);
                }            
            }        

            if (this.$required) {
                this.validate();
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
    else if (this.type == 'name') {
        this.validator = /.{2,}/;
    }
    else if (this.type == 'idcard') {
        this.validator = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        this.maxLength = 18;
        this.style.textTransform = 'uppercase';
    }
    else if (this.type == 'mobile') {
        this.validator = /^1[3-9]\d{9}$/i;
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

        if (this.hint != null || this.callout == null) {
            if (this.hintSpan == null) {
                if (this.hint != null && this.hint != '') {
                    this.hintSpan = $s(this.hint);
                }
                else {
                    this.hintSpan = $create('SPAN', { innerHTML: '', className: this.errorTextClass }, { display: 'none' });
                    $x(this).insertBehind(this.hintSpan);
                }
            }
        }

        this.defaultClass = this.className;

        if (this.value != '') {
            this._status = 3; //有值初始状态
            this.validate();
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
        $x(this).on('keypress', function(ev) {
            if (ev.keyCode == 13 && this.value != this.defaultValue) {
                window.location.href = this.getAttribute('enter').$p(this);
            }
        });
    }

    Event.interact(this, this);
    $complete(function() {
        Event.execute(input, 'onload');
    });
}

HTMLInputElement.prototype.initializeCheckable = function() {

    this.relations = new Set();

    let input = this;
    this._inputable = false;

    if (this.type == 'switch') {
        this.status = 1;
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
                            Event.dispatch(this, 'change');
                            if (this.value == this.options[0]) {
                                Event.execute(this, 'onchange-checked');
                            }
                            else {
                                Event.execute(this, 'onchange-unchecked');
                            }
                        }, 
                        function(data) {
                            this.hintText = this.failureText.$p(this, data);
                            button.src = button.src.replace('active', 'hover');
                        },
                        function(error) {
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
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

                    Event.dispatch(input, 'change');
                    if (input.value == input.options[0]) {
                        Event.execute(input, 'onchange-checked');
                    }
                    else {
                        Event.execute(input, 'onchange-unchecked');
                    }
                }
            }            
        } 
    }
    else if (this.type == 'checkbox') {
        this.checked = this.value == this.options[0];
        $x(this).on('change', function() {
            if (this['onchange+'] != null) {
                this.disabled = true;
                this.value = this.checked ? this.options[0] : this.options[1];
                $FIRE(this, 'onchange+',
                        function(data) {
                            this.hintText = this.successText.$p(this, data);                            
                            if (this.$required) {
                                this.status = this.checked ? 1 : 0;
                            }
                            if (this.checked) {
                                Event.execute(this, 'onchange-checked');
                            }
                            else {
                                Event.execute(this, 'onchange-unchecked');
                            }
                        }, 
                        function(data) {
                            this.status = -2;
                            this.hintText = this.failureText.$p(this, data);
                        },
                        function(error) {
                            this.status = -1;
                            this.className = this.errorClass;
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
                        },
                        function() {
                            this.disabled = false;
                        }
                    );
            }
            else {
                if (this.$required) {
                    this.status = this.checked ? 1 : 0;
                }
                if (this.checked) {
                    Event.execute(this, 'onchange-checked');
                }
                else {
                    Event.execute(this, 'onchange-unchecked');
                }
            }
        });        
    }

    Event.interact(this, this);
    $complete(function() {
        Event.execute(input, 'onload');
    });
}

HTMLInputElement.prototype.initializeSelectable = function() {

    this.relations = new Set();
    
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
    $n(container, 'INPUT').forEach(input => {
        if (input.getAttribute('root') == null) {
            if (/^(text|password|number|float|integer|mobile|idcard|name|search|calendar|datetime)$/i.test(input.type)) {            
                input.setAttribute('root', 'INPUT');                
                input.initializeInputable();
            }
            else if (/^(switch|checkbox)$/i.test(input.type)) {
                input.setAttribute('root', 'INPUT');                
                input.initializeCheckable();
            }
            else if (/^(stars)$/i.test(input.type)) {
                input.setAttribute('root', 'INPUT');                
                input.initializeSelectable();
            }
        }
    });
}

$finish(function() {
    HTMLInputElement.initializeAll();
});