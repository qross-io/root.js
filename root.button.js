
// 提交按钮扩展

$enhance(HTMLButtonElement.prototype)
    .declare({
        enabledClass: 'normal-button blue-button',
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
        exceptionText: '' //请求发生错误的提醒文字
    })
    .describe({
        onActionSuccess: null, // function(result) { },
        onActionFail: null, //function(result) { },
        onActionException: null, //function(error) { },
        onActionComplete: null //function() { },
    })
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
        }
    });


HTMLButtonElement.prototype.relatived = 0;
HTMLButtonElement.prototype.satisfied = 0;
HTMLButtonElement.prototype.relations = new Set();

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

    this.disable();

    let button = this;    

    button.text = button.actionText;

    $cogo(button.action, button.element)
        .then(data => {
            //一般数据会返回数据表受影响的行数
            if ($parseBoolean(data, true)) {
                button.text = button.successText;            
                button.execute('onActionSuccess', data);
                if (button.jumpTo != '') {
                    button.text = button.jumpingText;
                    window.location.href = button.jumpTo.$p(data);
                }
                else {
                    button.text = button.defaultText;
                    button.enable();
                }
            }
            else {
                button.text = button.failedText;
                button.execute('onActionFail', data);
                button.enable();
            }
        })
        .catch(error => {
            button.execute('onActionException', error);
            button.text = button.exceptionText;            
            console.error(error);
        })
        .finally(() => {
            button.execute('onActionComplete');
            if (button.jumpTo == '') {
                button.enable();
            }            
        });
}

HTMLButtonElement.relationByInput = new Map();

HTMLButtonElement.prototype.initialize = function() {
    
    if (this.className == '') {
        this.className = this.enabledClass;
    }
    else {
        this.enabledClass = this.className;
    }   
    
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
        if (this.confirmText != '') {
            if ($root.confirm != null) {
                let button = this;
                $root.confirm(this.confirmText, this.confirmButtonText, this.cancelButtonText, this.confirmTitle)
                    .on('confirm', function() {                            
                        button.go();      
                    })
            }
            else if (window.confirm(this.confirmText)) {
                this.go();         
            }
        }
        else {
            this.go();
        }
    });
}

HTMLButtonElement.observe = function() {
    //为每个自定义标签添加监控
    for (let [name, buttons] of HTMLButtonElement.relationByInput) {
        let tag = $s(name);        
        if (tag != null && tag.required) {
            HTMLInputElement.setterX.set('status', function(value) {
                buttons.forEach(button => button.response(value));
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

    if (HTMLButtonElement.relationByInput.size > 0) {
        window.setTimeout(HTMLButtonElement.observe, 200);
    }
}

$finish(function () {
    for (let button of $a('button[action],button[watch]')) {
        // root 设置为 button 表示组件已初始化
        if (button.getAttribute('root') == null) {
            button.setAttribute('root', 'BUTTON');
            button.initialize();
        }
    }

    HTMLButtonElement.observe();
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