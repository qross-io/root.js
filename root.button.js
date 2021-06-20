
// 按钮扩展

$enhance(HTMLButtonElement.prototype)
    .declare({
        type: 'normal|switch',
        enabledClass: '', //normal-button blue-button,
        disabledClass: '', //normal-button optional-button,
        watch: '', //监视表单元素的变化，当验证通过时自动启用按钮，只支持逗号分隔的 id 列表

        confirmText: '', //确定提醒文字
        confirmButtonText: 'OK', //确定框确定按钮
        cancelButtonText: 'Cancel', //确定框取消按钮
        confirmTitle: 'Confirm', //确定框标题
        jumpingText: '', //跳转提醒文字
        href: '', //跳转到哪个页面
        clickText: '', //点击按钮后的提示文字

        invalidText: '', //验证不通过的提醒文字 onclick="return false"
        actionText: '', //当开始执行服务器端事件时的提示这也
        successText: '', //执行成功后的提示文字
        failureText: '', //执行失败后的提醒文字
        exceptionText: '', //请求发生错误的提醒文字

        textClass: '',
        errorTextClass: 'error',
        validTextClass: 'correct',

        hint: null,
        callout: null,
        alert: null,

        disableOnClick: true,

        scale: 'normal', //little/small/normal/big/large
        color: 'blue', //prime/green/red/maroon/purple/blue/orange/gray/white

        'onclick-enabled': null,
        'onclick-disabled': null
    })
    .getter({
        'scale': value => value.toLowerCase(),
        'color': value => value.toLowerCase()
    })
    .setter({
        'scale': function(value) {
            this.enabledClass = this.enabledClass.replace(this.scale + '-button', value + '-button');
            this.disabledClass = this.disabledClass.replace(this.scale + '-button', value + '-button');
            this.classList.remove(this.scale + '-button');
            this.classList.add(value + '-button');            
        },
        'color': function(value) {
            this.enabledClass = this.enabledClass.replace(this.color + '-button', value + '-button');
            if (!this.disabled) {
                this.classList.remove(this.color + '-button');
                this.classList.add(value + '-button');
            }            
        }
    })
    .extend('onclick+')
    .define({
        'text': {
            get () {            
                return this.innerHTML;
            },
            set (text) {
                if (text != null && text != '') {
                    this.innerHTML = text;
                }
            }
        },
        'hintText': {
            set (text) {                
                if (this.hintSpan != null) {
                    this.hintSpan.innerHTML = text;
                    if (this.status == 1) {
                        this.hintSpan.className = this.validTextClass;
                    }
                    else if (this.status == 2) {
                        this.hintSpan.className = this.textClass;
                    }
                    else {
                        this.hintSpan.className = this.errorTextClass;
                    }                    
                    this.hintSpan.hidden = text == '';
                }
                
                if (this.status < 2) {
                    if (text != '' && this.callout != null) {
                        Callout(text).position(this, this.callout).show();
                    }

                    if (text != '' && this.alert != null) {
                        if ($root.alert != null) {
                            $root.alert(text, this.confirmButtonText);
                        }
                        else {
                            window.alert(text);
                        }
                    }
                }
            }
        },
        //switch only
        'options': {
            get () {
                if (this._options == null) {
                    let options = this.getAttribute('options');
                    if (options != null) {
                        options = options.trim();
                        if ((options.startsWith('{') && options.endsWith('}')) || (options.startsWith('[') && options.endsWith(']'))) {
                            options = Json.eval(options);
                        }
                        else {
                            options = options.toMap();
                        }
                        if (!(options instanceof Array)) {
                            this._options = [];
                            for (let text in options) {
                                this._options.push({ text: text, value: options[text] });
                            }
                        }
                        else {
                            this._options = options;
                        }
                    }
                    else {
                        this._options = [{ text : 'Enabled', value: 'yes' }, { text: 'Disabled', value: 'no' }];
                    }
                }
                return this._options;
            }
        }
    });

HTMLButtonElement.prototype.onclick_ = null;
HTMLButtonElement.prototype._options = null;
//1 success 0 failure -1 exception 2 action
HTMLButtonElement.prototype.status = 1;
HTMLButtonElement.prototype.relatived = 0;
HTMLButtonElement.prototype.satisfied = 0;
HTMLButtonElement.prototype.relations = null;

HTMLButtonElement.prototype.enable = function() {
    if (this.disabled) {
        this.className = this.enabledClass;
        this.disabled = false;
    }
}

HTMLButtonElement.prototype.disable = function() {
    if (!this.disabled) {
        this.className = this.disabledClass;
        this.disabled = true;
    }
}

//响应用户输入
HTMLButtonElement.prototype.response = function(correct) {
    if (this.relatived > 0) {
        if (correct == 0) {
            correct = -1;
        }
        if (correct > 0) {
            this.satisfied ++;
        }
        else if (this.satisfied > 0) {
            this.satisfied --;
        }
        if (this.satisfied < this.relatived) {
            this.disable();
        }
        else {
            this.enable();
        }
    }
    else {
        this.enable();
    }
}

HTMLButtonElement.prototype.go = function() {

    if (this.disableOnClick) {
        this.disable();
    }    
    this.text = this.clickText.$p(this);

    if (this['onclick+'] != null) {
        this.status = 2;
        this.hintText = this.actionText.$p(this);
        $FIRE(this, 'onclick+',
            function(data) {
                this.status = 1;
                this.hintText = this.successText.$p(this, data);            
                if (this.href != '') {
                    this.text = this.jumpingText.$p(this, data);
                    window.location.href = this.href.$p(this, data);
                }
                else {
                    this.text = this.defaultText;
                    this.enable();
                }
            }, 
            function(data) {
                this.status = 0;
                this.hintText = this.failureText.$p(this, data);            
                this.text = this.defaultText;
                this.enable();
            },
            function(error) {
                this.status = -1;            
                this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
            },
            function() {
                if (this.href == '') {
                    this.enable();
                }
            }
        );
    }
}

HTMLButtonElement.prototype.switch = function() {
    if (this.value == this.options[0].value) {
        this.text = this.options[1].text;
        this.value = this.options[1].value;
        this.className = this.disabledClass;

        Event.execute(this, 'onclick-disabled');
    }
    else {
        this.text = this.options[0].text;
        this.value = this.options[0].value;
        this.className = this.enabledClass;

        Event.execute(this, 'onclick-enabled');
    }
}

HTMLButtonElement.relationByInput = new Map();

HTMLButtonElement.prototype.initialize = function() {

    if (this.enabledClass == '') {
        if (this.className == '') {
            this.classList.add(this.scale + '-button');
            this.classList.add(this.color + '-button');
        }        
        this.enabledClass = this.className;
    }
    else {
        this.className = this.enabledClass;
    }
    
    if (this.disabledClass == '') {
        this.disabledClass = this.scale + '-button optional-button';
    }

    if (this.onclick != null && this['onclick+'] != null) {
        this.onclick_ = this.onclick;
        this.onclick = null;
    }

    if (this.type == 'switch') {
        if (this.value == '' || this.value == this.options[0].value) {
            this.className = this.enabledClass;
            this.text = this.options[0].text;
            this.value = this.options[0].value;            
        }
        else {
            this.className = this.disabledClass;
            this.text = this.options[1].text;
            this.value = this.options[1].value;
        }

        $x(this).on('click', function(ev) {
            if (Event.fire(this, 'onclick_'), ev) {
                if (this['onclick+'] != null) {
                    if (this.disableOnClick) {
                        this.disable();
                    }                    
                    this.switch();
                    $FIRE(this, 'onclick+', 
                        function(data) {                            
                            this.hintText = this.successText.$p(this, data);                            
                        }, 
                        function(data) {                            
                            this.hintText = this.failureText.$p(this, data);                            
                            this.switch();
                        },
                        function(error) {
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
                            this.switch();
                        },
                        function() {
                            this.enable();
                        });
                }
                else {
                    this.switch();
                }
            }
            else {
                this.hintText = this.invalidText.$p(this);
            }
        });
    }
    else if (this['onclick+'] != null)  {

        this.relations = new Set();

        let todo = [];

        if (this.watch != '') {
            this.watch.split(',').map(tag => tag.trim()).forEach(tag => todo.push(tag));
        }
    
        let holders = this['onclick+'].match(/\$\(#[^)]+\)/ig);
        if (holders != null) {
            holders.map(tag => tag.$trim('$(', ')')).forEach(tag => todo.push(tag));
        }

        todo.forEach(tag => {
            if (!HTMLButtonElement.relationByInput.has(tag)) {
                HTMLButtonElement.relationByInput.set(tag, new Set());
            }
            HTMLButtonElement.relationByInput.get(tag).add(this);
            this.relations.add(tag);
        });

        this.relatived = this.relations.size;
        if (this.relatived > 0) {
            this.disable();
        }

        $x(this).on('click', function(ev) {
            if (Event.fire(this, 'onclick_'), ev) {
                if (this.confirmText != '') {
                    if ($root.confirm != null) {
                        let button = this;
                        $root.confirm(this.confirmText.$p(this), this.confirmButtonText, this.cancelButtonText, this.confirmTitle)
                            .on('confirm', function() {                            
                                button.go();      
                            });
                    }
                    else if (window.confirm(this.confirmText.$p(this))) {
                        this.go();         
                    }
                }
                else {
                    this.go();
                }
            }
            else {
                this.hintText = this.invalidText.$p(this);
            }
        });

        if (this.successText != '' || this.failureText != '' || this.exceptionText != '') {
            if (this.hint != null || this.callout == null) {
                if (this.hintSpan == null) {
                    if (this.hint != '') {
                        this.hintSpan = $s(this.hint);
                    }
                    else {
                        this.hintSpan = $create('SPAN', { innerHTML: '', className: this.errorTextClass }, { display: 'none' });
                        $x(this).insertBehind(this.hintSpan);
                    }
                }
            }
        }
    }
    else if (this.getAttribute('href') != null) {
        $x(this).bind('click', function() {
            window.location.href = this.href.$p(this);
        });
    }

    Event.interact(this, this);
}

HTMLButtonElement._observed = 0;
HTMLButtonElement.observe = function() {
    //为每个自定义标签添加监控
    for (let [name, buttons] of HTMLButtonElement.relationByInput) {
        let tag = $s(name);
        
        if (tag != null && tag.$required) {
            buttons.forEach(button => tag.relations.add(button));
            HTMLInputElement.setterX.set('status', function(value) {
                this.relations.forEach(button => button.response(value));
            });
            
            if (tag.status == 1) {
                buttons.forEach(button => button.response(1));
            }
        }
        else {
            buttons.forEach(button => {
                button.satisfied ++;
                if (button.satisfied == button.relatived) {
                    button.enable();
                }
            });
        }            

        HTMLButtonElement.relationByInput.delete(name);        
    }

    HTMLButtonElement._observed += 1;

    if (HTMLButtonElement.relationByInput.size > 0) {
        if (HTMLButtonElement._observed < 10) {
            window.setTimeout(HTMLButtonElement.observe, 200);
        }
        else {
            HTMLButtonElement.relationByInput.forEach((button, input) => {
                console.warn(input + ' may be incorrect.');
            });
        }
    }
}

HTMLButtonElement.initializeAll = function(container) {
    for (let button of $n(container, 'button')) {
        // root 设置为 button 表示组件已初始化
        if (button.getAttribute('root') == null) {
            button.setAttribute('root', 'BUTTON');
            if (document.models != null) {
                Model.boostPropertyValue(button);
            }

            if (button.getAttribute('onclick+') != null || button.getAttribute('watch') != null || button.getAttribute('type') != null || button.getAttribute('href') != null) {
                button.initialize();
            }
        }
    }

    HTMLButtonElement.observe();
}

$finish(function () {
    HTMLButtonElement.initializeAll();
});