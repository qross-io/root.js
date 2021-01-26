
class Button {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'Button_' + document.components.size,
            confirmText: '',
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            confirmTitle: 'Confirm',
            jumpingText: 'Jumping...',
            jumpTo: '',
    
            enabledClass: '',
            disabledClass: '',
    
            enabledOnComplete: false,
    
            action: '', //要执行的PQL语句或要请求的接口
            actionText: '',
            finishText: '',
            
            onpress: function(ev) { },
            onrelease: function(ev) { },
            onfinish: function(result) { }
        })
        .elementify(element => {
            this.element = element;
            this.defaultText = element.innerHTML || element.value;
        });
    }

    get text() {
        if (this.element.nodeName == 'INPUT') {
            return this.element.value;
        }
        else {
            return this.element.innerHTML;
        }
    }

    set text(text) {
        if (text != null) {
            if (this.element.nodeName == 'INPUT') {
                this.element.value = text;
            }
            else {
                this.element.innerHTML = text;
            }
        }
    }
}


$button = function(name) {
    let button = $t(name);
    if (button.tagName == 'BUTTON') {
        return button;
    }
    else {
        return null;
    }
}

Button.prototype.go = function() {

    this.element.disabled = true;
    if (this.disabledClass != '') {
        this.element.className = this.disabledClass;
    }

    let button = this;    

    button.text = button.actionText;

    $cogo(button.action, button.element)
        .then(data => {
            if (button.enableOnComplete) {
                button.element.disabled = false;
                if (button.disabledClass != '') {
                    button.element.className = button.enabledClass;
                }
            }

            button.text = button.finishText;
            button.execute('onfinish', result);

            if (button.jumpTo != '') {
                button.text = button.jumpingText;
                window.location.href = button.jumpTo.$p(button.element);
            }
        });
}

Button.prototype.initialize = function() {
    let button = this;
    $x(button.element).bind('click', function(ev) {
        if (button.execute('onpress', ev)) {
            if (button.confirmText != '') {
                if ($root.confirm != null) {
                    $root.confirm(button.confirmText, button.confirmButtonText, button.cancelButtonText, button.confirmTitle)
                        .on('confirm', function() {
                            if (button.execute('onrelease', ev)) {
                                button.go();
                            }                            
                        })
                }
                else if (window.confirm(button.confirmText)) {
                    if (button.execute('onrelease', ev)) {
                        button.go();
                    }                    
                }
            }
            else {
                if (button.execute('onrelease', ev)) {
                    button.go();
                }
            }
        }
    });
}

// root 设置为 button 表示组件已初始化
Button.apply = function(...elements) {
    $x(...elements).objects.forEach(button => {
        button.setAttribute('root', 'button');
        new Button(button).initialize();
    });
}

Button.initializeAll = function () {
    for (let button of $a('button[action],input[type=button][action]')) {
        if (button.getAttribute('root') == null) {
            Button.apply(button);
        }
    }
}

$finish(function () {
    Button.initializeAll();
});