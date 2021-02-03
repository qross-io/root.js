
// 提交按钮扩展

class Button {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'Button_' + document.components.size,
    
            className: 'normal-button blue-button',
            disabledClass: 'normal-button optional-button',
       
            action: '', //要执行的 PQL 语句或要请求的接口
            watch: '', //监视表单元素的变化，当验证通过时自动启用按钮，只支持逗号分隔的 id 列表

            confirmText: '', //确定提醒文字
            confirmButtonText: 'OK', //确定框确定按钮
            cancelButtonText: 'Cancel', //确定框取消按钮
            confirmTitle: 'Confirm', //确定框标题
            jumpingText: '', //跳转提醒文字
            jumpTo: '', //当动作action完成后要跳转到哪个页面
            actionText: '', //点击按钮后的提示文字
            successText: '', //执行成功后的提示文字
            failedText: '', //执行失败后的提醒文字
            errorText: '', //请求发生错误的提醒文字 
            
            onclick: null, //function(ev) { },
            onsuccess: null, // function(result) { },
            onfail: null, //function(result) { },
            onerror: null, //function(error) { },
            oncomplete: null //function(error) { },
        })
        .elementify(element => {
            this.element = element;
            this.defaultText = this.text;
            if (this.className == '') {
                this.className = 'normal-button blue-button';
                this.element.className = this.className;
                
            }            
            this.element.removeAttribute('onclick');
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
        if (text != null && text != '') {
            if (this.element.nodeName == 'INPUT') {
                this.element.value = text;
            }
            else {
                this.element.innerHTML = text;
            }
        }
    }

    get disabled() {
        return this.element.disabled;
    }

    set disabled(disabled) {
        if (!disabled) {
            if (this.element.disabled) {
                this.element.className = this.className;
                this.element.disabled = false;
            }
        }
        else {
            if (!this.element.disabled) {
                this.element.className = this.disabledClass;
                this.element.disabled = true;
            }
        }
    }
}

Button.prototype.relatived = 0;
Button.prototype.satisfied = 0;
Button.prototype.relations = new Set();

//响应用户输入
Button.prototype.response = function(correct) {
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
        this.disabled = (this.satisfied < this.relatived);        
    }
    else {
        this.disabled = false;
    }
}

// input id -> [button1, button2]
Button.relationByInput = new Map();

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
                    button.element.className = button.className;
                }
            }

            //一般数据会返回数据表受影响的行数
            if ($parseBoolean(data, true)) {
                button.text = button.successText;            
                button.execute('onsuccess', data);
                if (button.jumpTo != '') {
                    button.text = button.jumpingText;
                    window.location.href = button.jumpTo.$p(data);
                }
                else {
                    button.text = button.defaultText;
                    button.element.className = button.className;
                }
            }
            else {
                button.text = button.failedText;
                button.execute('onfail', data);
                button.element.className = button.className;
            }
        })
        .catch(error => {
            button.execute('onerror', error);
            button.text = button.errorText;            
            console.error(error);
        })
        .finally(() => {
            button.execute('oncomplete');
            button.disabled = false;
        });
}

Button.prototype.initialize = function() {
    
    let todo = [];

    if (this.watch != '') {
        this.watch.split(',').map(tag => tag.trim()).forEach(tag => todo.push(tag));
    }

    if (this.action != '') {
        let holders = this.action.match(/\$\(#[^)]+\)/ig);
        if (holders != null) {
            holders.map(tag => tag.$trim('$(', ')')).forEach(tag => todo.push(tag));
        }        
    }

    todo.forEach(tag => {
        if (!Button.relationByInput.has(tag)) {
            Button.relationByInput.set(tag, new Set());
        }
        Button.relationByInput.get(tag).add(this.name);
        this.relations.add(tag);
    });

    this.relatived = this.relations.size;
    if (this.relatived > 0) {
        this.disabled = true;
    }

    let button = this;
    $x(button.element).bind('click', function(ev) {
        if (button.execute('click', ev)) {
            if (button.confirmText != '') {
                if ($root.confirm != null) {
                    $root.confirm(button.confirmText, button.confirmButtonText, button.cancelButtonText, button.confirmTitle)
                        .on('confirm', function() {                            
                            button.go();      
                        })
                }
                else if (window.confirm(button.confirmText)) {
                    button.go();         
                }
            }
            else {
                button.go();
            }
        }
    });
}

Button.observe = function() {
    //为每个自定义标签添加监控
    for (let [name, buttons] of Button.relationByInput) {
        let tag = $t(name);
        if (tag != null) {
            if (tag.required) {
                Object.defineProperty(tag, 'status', {
                    get: function() {
                        return this._status == null ? 2 : this._status;
                    },
                    set: function(value) {
                        if (this._status == null) {
                            this._status = 0;
                        }
                        if (this._status > 1) {
                            this._status -= 2;
                        }
                        if (value != this._status) {
                            buttons.forEach(button => $t(button).response(value));
                        }                
                        this._status = value;
                    }
                });
                
                if (tag.status == 1) {
                    buttons.forEach(button => $t(button).response(1));
                }
            }
            else {
                buttons.forEach(name => {
                    let button = $button(name);
                    button.satisfied ++;
                    if (button.satisfied == button.relatived) {
                        button.disabled = false;
                    }
                });
            }

            Button.relationByInput.delete(name);
        }
    }

    if (Button.relationByInput.size > 0) {
        window.setTimeout(Button.observe, 200);
    }
}

Button.initializeAll = function () {
    for (let button of $a('input[type=submit],input[type=image],button[action],input[type=button][action],button[watch],input[type=button][watch]')) {
        // root 设置为 button 表示组件已初始化
        if (button.getAttribute('root') == null) {
            button.setAttribute('root', 'BUTTON');
            new Button(button).initialize();            
        }
    }

    Button.observe();
}

$finish(function () {
    Button.initializeAll();
});

/*
观察者算法逻辑
1. 在 Input 元素上添加监控逻辑，新建 status 属性，并赋值为`origin`
2. Button 初始化时先生成 Input -> [Button1, Button2] 表
3. 构建 Button - [Input1, Input2] 列表，用于统计 Button 的 relation 值
3. Input 值更新时，更新 status 状态
4. 当 status 状态更新时，修改 每个 button 的 satisfied 属性
5. 当 satisfied == relatived 时，启用按钮
6. 当 satisfied < relatived 时，停用按钮
7. Button必须在所有表单元素的下方
*/