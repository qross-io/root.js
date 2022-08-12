
// 按钮扩展

$enhance(HTMLButtonElement.prototype)
    .defineProperties({
        type: 'normal|switch|confirm',
        watch: '', //监视表单元素的变化，当验证通过时自动启用按钮，只支持逗号分隔的 id 列表

        confirmText: '', //确定提醒文字
        confirmButtonText: 'OK', //确定框确定按钮
        confirmButtonClass: 'normal-button prime-button',
        cancelButtonText: 'Cancel', //确定框取消按钮
        cancelButtonClass: 'normal-button gray-button',
        confirmTitle: 'Confirm', //确定框标题
        jumpingText: '', //跳转提醒文字
        href: '', //跳转到哪个页面
        clickText: '', //点击按钮后的提示文字

        invalidText: '', //验证不通过的提醒文字 onclick="return false"
        actionText: '', //当开始执行服务器端事件时的提示这也
        successText: '', //执行成功后的提示文字
        failureText: '', //执行失败后的提醒文字
        exceptionText: '', //请求发生错误的提醒文字

        textClass: '', //默认提醒文字的样式
        errorTextClass: 'error',
        validTextClass: 'correct',

        alert: null,

        disableOnClick: true,
        enableOnSuccess: true,
        enableOnFailure: true,
        enableOnException: true,

        //switch only
        enabledClass: '', //normal-button blue-button,
        enabledText: 'Enabled',
        enabledValue: 'yes',
        disabledClass: '', //normal-button optional-button,
        disabledText: 'Disabled',
        disabledValue: 'no',

        scale: {
            get () {
                return Enum('normal|little|small|medium|big|large').validate(this.getAttribute('scale'));
            },
            set (value) {
                this.setAttribute('scale', value);

                this.enabledClass = this.enabledClass.replace(this.scale + '-button', value + '-button');
                this.disabledClass = this.disabledClass.replace(this.scale + '-button', value + '-button');
                this.classList.remove(this.scale + '-button');
                this.classList.add(value + '-button');                 
            }
        },
        color: {
            get() {
                return Enum('blue|prime|green|red|maroon|purple|orange|gray|white').validate(this.getAttribute('color'));
            },
            set(value) {
                this.setAttribute('color', value);

                this.enabledClass = this.enabledClass.replace(this.color + '-button', value + '-button');
                if (!this.disabled) {
                    this.classList.remove(this.color + '-button');
                    this.classList.add(value + '-button');
                }
            }
        },
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
        'hintElement': {
            get() {
                if (this._hintElement === undefined) {
                    this.hintElement = this.getAttribute('hint') ?? this.getAttribute('hint-element');
                }
                return this._hintElement;
            },
            set(element) {
                this._hintElement = $parseElement(element, 'hintElement');
            }
        },
        'calloutPosition': {
            get() {
                return this.getAttribute('callout-position') ?? this.getAttribute('callout');
            },
            set(position) {
                this.setAttribute('callout-position', position);
            }
        },
        'messageDuration': {
            get() {
                return this.getAttribute('message-duration') ?? this.getAttribute('message');
            },
            set(duration) {
                this.setAttribute('message-duration', duration);
            }
        },
        'hintText': {
            set (text) {                
                if (this.hintElement != null) {
                    this.hintElement.innerHTML = text;
                    if (this.status == 'success') {
                        this.hintElement.removeClass(this.textClass, this.errorTextClass).addClass(this.validTextClass);
                    }
                    else if (this.status == 'acting') {
                        this.hintElement.removeClass(this.errorTextClass, this.validTextClass).addClass(this.textClass);
                    }
                    else {
                        this.hintElement.removeClass(this.textClass, this.validTextClass).addClass(this.errorTextClass);
                    }                    
                    this.hintElement.hidden = text == '';
                }
                
                if (this.status != 'acting') {
                    if (text != '') {
                        if (this.calloutPosition != null) {
                            Callout(text).position(this, this.calloutPosition).show();
                        }

                        if (this.messageDuration != null) {
                            window.Message?.[this.status != 'success' ? 'red' : 'green'](text).show(this.messageDuration.toFloat(0));
                        }

                        if (this.alert != null) {
                            $root.alert?.(text) ?? window.alert(text);
                        }
                    }                    
                }
            }
        },
        'disabled': {
            get() {
                return $parseBoolean(this.getAttribute('disabled'), false);
            },
            set(disabled) {
                if (typeof(disabled) != 'boolean') {
                    disabled = $parseBoolean(enabled, true, this);
                }
                if (disabled) {
                    this.setAttribute('disabled', '');
                    if (this.type != 'switch') {
                        this.className = this.disabledClass;
                    }
                }
                else {
                    this.removeAttribute('disabled');
                    if (this.type != 'switch') {
                        this.className = this.enabledClass;
                    }
                }
            }
        },
        'enabled': {
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
        'relations': {
            get() {
                if (this._relations == null) {
                    this._relations = new Map();
                }
                return this._relations;
            }
        },
        'satisfied': {
            get() {
                return [...this.relations.values()].filter(v => v == 0).length == 0;
            }
        }
    })
    .defineEvents('onclick+', 'onclick-enabled', 'onclick-disabled', 'onclick-confirm', 'onclick-cancel'); //for switch & confirm

HTMLButtonElement.prototype.onclick_ = null; // onclick 属性的值
HTMLButtonElement.prototype._hintElement = undefined;
HTMLButtonElement.prototype.status = 'success';
HTMLButtonElement.prototype._relations = null;

HTMLButtonElement.prototype.enable = function() {
    if (this.disabled) {
        this.disabled = false;
    }

    if (this.type == 'confirm') {
        this.slideIn(-100);
    }
}

HTMLButtonElement.prototype.disable = function() {
    if (!this.disabled) {
        this.disabled = true;
    }
}

HTMLButtonElement.prototype.show = function() {
    if (this.hidden) {
        this.hidden = false;
    }
    if (this.type == 'confirm') {
        this.previousElementSibling.hidden = true;
        this.nextElementSibling.hidden = true;
    }
}

HTMLButtonElement.prototype.hide = function() {
    if (!this.hidden) {
        this.hidden = true;
    }
    if (this.type == 'confirm') {
        this.previousElementSibling.hidden = true;
        this.nextElementSibling.hidden = true;
    }
}

//响应用户输入
HTMLButtonElement.prototype.response = function(input, correct) {
    if (this.relations.size > 0) {

        this.relations.set(input, correct > 0 ? 1 : 0);

        if (this.satisfied) {
            this.enable();
        }
        else {            
            this.disable();
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
        this.status = 'acting';
        this.hintText = this.actionText.$p(this);
        $FIRE(this, 'onclick+',
            function(data) {
                this.status = 'success';
                this.hintText = this.successText.$p(this, data);            
                if (this.href != '') {
                    this.text = this.jumpingText.$p(this, data);
                    window.location.href = this.href.$p(this, data);
                }
                else {
                    this.text = this.defaultText;
                    if (this.enableOnSuccess) {
                        this.enable();
                    }                    
                }
            }, 
            function(data) {
                this.status = 'failure';
                this.hintText = this.failureText.$p(this, data);            
                this.text = this.defaultText;
                if (this.enableOnFailure) {
                    this.enable();
                }                
            },
            function(error) {
                this.status = 'exception';
                this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                this.text = this.defaultText;
                if (this.enableOnException) {
                    this.enable();
                }                
            }
        );
    }
}

HTMLButtonElement.prototype.switch = function() {
    if (this.value == this.enabledValue) {
        this.text = this.disbaledText;
        this.value = this.disabledValue;
        this.className = this.disabledClass;

        this.dispatch('onclick-disabled', { 'event': ev });
    }
    else {
        this.text = this.enabledText;
        this.value = this.enabledValue;
        this.className = this.enabledClass;

        this.dispatch('onclick-enabled', { 'event': ev });
    }
}

// input -> buttons
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

    if (this.successText != '' || this.failureText != '' || this.exceptionText != '') {
        if (this.hintElement == null && this.calloutPosition == null && this.alert == null && this.messageDuration == null) {
            this.hintElement = $create('SPAN', { innerHTML: '', className: this.errorTextClass }, { marginLeft: '30px' });
            this.insertAdjacentElement('afterEnd', this.hintElement);            
        }
    }

    if (this.type == 'switch') {
        if (this.text == this.enabledValue || this.value == this.enabledValue || this.text == this.enabledText) {
            this.className = this.enabledClass;
            this.text = this.enabledText;
            this.value = this.enabledValue;
        }
        else {
            this.className = this.disabledClass;
            this.text = this.disabledText;
            this.value = this.disabledValue;
        }

        this.on('click', function(ev) {
            if (Event.fire(this, 'onclick_'), ev) {
                if (this['onclick+'] != null) {
                    if (this.disableOnClick) {
                        this.disabled = true;
                    }                    
                    this.switch(ev);
                    $FIRE(this, 'onclick+', 
                        function(data) {                            
                            this.hintText = this.successText.$p(this, data);                            
                        }, 
                        function(data) {                            
                            this.hintText = this.failureText.$p(this, data);                            
                            this.switch(ev);
                        },
                        function(error) {
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                            this.switch(ev);
                        },
                        function() {
                            this.disabled = false;
                        });
                }
                else {
                    this.switch(ev);
                }
            }
            else {
                this.hintText = this.invalidText.$p(this);
            }
        });
    }
    else if (this.type == 'confirm') {
        let button = this;
        let confirm = $create('BUTTON', { innerHTML: this.confirmButtonText, className: this.confirmButtonClass });
        let cancel = $create('BUTTON', { innerHTML: this.cancelButtonText, className: this.cancelButtonClass });
        
        this.insertAdjacentElement('beforeBegin', confirm);
        this.insertAdjacentHTML('beforeBegin', '&nbsp;');
        this.insertAdjacentElement('afterEnd', cancel);
        this.insertAdjacentHTML('afterEnd', '&nbsp;');

        if (confirm.offsetWidth < cancel.offsetWidth) {
            confirm.style.width = cancel.offsetWidth + 'px';
        }
        else {
            cancel.style.width = confirm.offsetWidth + 'px';
        }
        
        confirm.hidden = true;
        cancel.hidden = true;

        this.style.position = 'absolute';
        this.style.marginLeft = (- this.offsetWidth / 2) + 'px';

        this.on('click', function() {
            button.slideOut(100);
            confirm.slideIn(-100);
            cancel.slideIn(120);
        });

        confirm.on('click', function(ev) {

            confirm.slideOut(-120);
            cancel.slideOut(120);

            if (Event.fire(button, 'onclick_'), ev) {
                if (button['onclick+'] != null) {
                    button.hintText = button.actionText.$p(button);
                    button.disable();
                    $FIRE(button, 'onclick+',
                        function(data) {
                            this.hintText = this.successText.$p(this, data);            
                            if (this.href != '') {
                                window.location.href = this.href.$p(this, data);
                            }
                            else if (button.enableOnSuccess) {
                                this.enable();
                            }
                        }, 
                        function(data) {
                            this.enable();
                            this.hintText = this.failureText.$p(this, data);                            
                        },
                        function(error) {
                            this.enable();
                            this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });                            
                        }
                    );
                }

                button.dispatch('onclick-confirm', { event: ev });
            }            
        });

        cancel.on('click', function(ev) {
            confirm.slideOut(-120);
            cancel.slideOut(120);
            button.slideIn(-100);

            button.dispatch('onclick-cancel', { event: ev });            
        });
    }
    else if (this['onclick+'] != null || this.hasAttribute('watch'))  {

        let todo = [];

        if (this.watch != '') {
            this.watch.split(',').map(tag => tag.trim()).forEach(tag => todo.push(tag));
        }
    
        if (this['onclick+'] != null) {
            /\$\(#[^)]+\)/ig.findAllIn(this['onclick+'])
                .map(tag => tag.trimPlus('$(', ')')).forEach(tag => todo.push(tag));
        }

        todo.forEach(tag => {
            if (!HTMLButtonElement.relationByInput.has(tag)) {
                HTMLButtonElement.relationByInput.set(tag, new Set());
            }
            HTMLButtonElement.relationByInput.get(tag).add(this);
            this.relations.set(tag, 0);
        });

        if (this.relations.size > 0) {
            this.disable();
        }

        if (this['onclick+'] != null) {
            this.on('click', function(ev) {
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
        }
    }
    else if (this.getAttribute('href') != null) {
        this.on('click', function() {
            window.location.href = this.href.$p(this);
        });
    }

    Event.interact(this);

    if (this.hasAttribute('disabled')) {
        this.disabled = $parseBoolean(this.getAttribute('disabled'), false, this);
    }
    else if (this.hasAttribute('enabled')) {
        this.enabled = $parseBoolean(this.getAttribute('enabled'), true, this);
    }
}

HTMLButtonElement._observed = 0;
HTMLButtonElement.observe = function() {
    //为每个自定义标签添加监控
    for (let [name, buttons] of HTMLButtonElement.relationByInput) {
        let tag = $s(name);
        
        if (tag != null && (tag.$required ?? tag.required)) {
            buttons.forEach(button => tag.relations.add(button));
            window[tag.constructor.name].setterX.set('status', function(value) {
                this.relations.forEach(button => button.response('#' + this.id, value));
            });
            
            if (tag.status == 1) {
                buttons.forEach(button => button.response(name, 1));
            }
        }
        else {
            buttons.forEach(button => {
                button.relations.set(name, 1);
                if (button.satisfied) {
                    button.enable();
                }
            });
        }            

        HTMLButtonElement.relationByInput.delete(name);        
    }

    //retry times
    HTMLButtonElement._observed += 1;

    if (HTMLButtonElement.relationByInput.size > 0) {
        if (HTMLButtonElement._observed < 10) {
            window.setTimeout(HTMLButtonElement.observe, 200);
        }
        else {
            [...HTMLButtonElement.relationByInput.keys()].forEach(input => {
                console.warn('Selector "' + input + '" may be incorrect.');
            });
        }
    }
}

HTMLButtonElement.initializeAll = function(container) {
    for (let button of (container ?? document).querySelectorAll('button')) {
        // root 设置为 button 表示组件已初始化
        if (!button.hasAttribute('root-button')) {            
            button.setAttribute('root-button', '');

            HTMLElement.boostPropertyValue(button);            

            if (button.hasAttribute('onclick+') || button.hasAttribute('watch') || button.hasAttribute('type') || button.hasAttribute('href')) {
                button.initialize();
            }
            else {
                Event.interact(button);
            }
        }
    }

    HTMLButtonElement.observe();
}

document.on('load', function () {    
    HTMLButtonElement.initializeAll();    
});