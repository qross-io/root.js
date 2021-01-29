
class Button {
    constructor(element) {
        $initialize(this)
        .with(element)
        .declare({
            name: 'Button_' + document.components.size,
            confirmText: '', //确定提醒文字
            confirmButtonText: 'OK', //确定框确定按钮
            cancelButtonText: 'Cancel', //确定框取消按钮
            confirmTitle: 'Confirm', //确定框标题
            jumpingText: 'Jumping...', //跳转提醒文字
            jumpTo: '', //当动作action完成后要跳转到哪个页面
    
            className: '',
            disabledClass: '',
    
            enabledOnComplete: false,
   
            action: '', //要执行的PQL语句或要请求的接口
            watch: '', //监视表单元素的变化，当验证通过时自动启用按钮，只支持逗号分隔的 id 列表

            actionText: '',
            successText: '',
            errorText: '',
            
            onsuccess: function(result) { },
            onerror: function(error) { },
            oncomplete: function(error) { },
        })
        .elementify(element => {
            this.element = element;            

            this.defaultText = this.text;
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

//响应用户输入
Button.prototype.response = function(correct) {
    if (this.relatived > 0) {
        this.satisfied += correct;
        this.disabled = (this.satisfied < this.relatived);        
    }
    else {
        this.disabled = false;
    }
}

// input id -> [button1, button2]
Button.relationByInput = new Map();
// button id -> [input1, input2, input3]
Button.relationByButton = new Map();

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

            button.text = button.successText;
            button.execute('onsuccess', result);

            if (button.jumpTo != '') {
                button.text = button.jumpingText;
                window.location.href = button.jumpTo.$p(data);
            }
        })
        .catch(error => {
            button.execute('onerror', error);
        })
        .finally(() => {
            button.execute('oncomplete');
        });
}

Button.prototype.initialize = function() {
    
    let todo = [];

    if (this.watch != '') {
        todo.concat(this.watch.split(',').map(tag => tag.trim()))
            
    }

    if (this.action != '') {
        todo.concat(this.action.match(/\$\(#[^)]+\)/ig).map(tag => tag.$trim('$(', ')')));
    }

    if (!Button.relationByButton.has(this.name)) {
        Button.relationByButton.set(this.name, new Set());
    }

    todo.forEach(tag => {
        if (!Button.relationByInput.has(tag)) {
            Button.relationByInput.set(tag, new Set());
        }
        Button.relationByInput.get(tag).add(this.name);
        Button.relationByButton.get(this.name).add(tag);
    });

    this.relatived = Button.relationByButton.get(this.name).size;


    let button = this;
    $x(button.element).bind('click', function(ev) {
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
    });
}

Button.initializeAll = function () {
    for (let button of $a('button[action],input[type=button][action],button[watch],input[type=button][watch]')) {
        // root 设置为 button 表示组件已初始化
        if (button.getAttribute('root') == null) {
            button.setAttribute('root', 'BUTTON');
            new Button(button).initialize();            
        }
    }

    //为每个自定义标签添加监控
    for (let [tag, buttons] of Button.relationByInput) {
        Object.definePropertiy($t(tag), 'status', {
            get: function() {
                return this._status == null ? 'origin' : this._status;
            },
            set: function(value) {
                if (this._status == null) {
                    this._status = 'origin';
                }
                if (value != this._status) {
                    if (value == 'correct') {
                        buttons.forEach(button => button.response(1));
                    }
                    else if (this._status == 'correct') {
                        buttons.forEach(button => button.response(-1));
                    }
                }                
                this._status = value;
            }
        }); 
    }    
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