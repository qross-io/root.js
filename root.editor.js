//-----------------------------------------------------------------------
// www.qross.io
//-----------------------------------------------------------------------
// root.editor.js
// Realtime text editing on page. 


HTMLElement.prototype.editor = null;
HTMLElement.prototype.edit = function(ev) {
    if ('SPAN,A,P,DIV,FONT,B,I,LABEL,H1,H2,H3,H4,H5,H6,TD,TH'.$includes(this.nodeName)) {
        if (this.editor.editable && !this.editor.editing && this.editor.execute('onedit', this.editor, ev)) {
            this.editor.editing = true;
            if (this.editor.editInPrompt) {
                Editor[this.editor.typeName].editInPrompt(this.editor, this);
            }
            else {
                Editor[this.editor.typeName].edit(this.editor, this);
            }            
        }
    }
}

class Editor {

    constructor(elementOrSettings) {

        this.controllerAttributes = new Object();
        this.bindings = [];

        $initialize(this)
            .with(elementOrSettings)
            .declare({
                editable$: true,
                editorType: null, //linktext|star|starbutton
                type: this.editorType ?? 'text', //text|textarea|integer|number|select
                allowEmpty: false,

                kilo: false,
                placeHolder: '',

                editButtonStyle: 'text|none|button',
                editButtonIcon: 'icon-edit',
                editButtonText: '',
                editButtonClass: '',
                confirmButtonClass: '',
                confirmButtonStyle: 'button|none|text',
                confirmButtonIcon: '',
                confirmButtonText: 'OK',
                confirmButtonClass: '',
                cancelButtonStyle: 'text|none|button',
                cancelButtonIcon: '',
                cancelButtonText: 'Cancel',                
                cancelButtonClass: '',

                editInPrompt: false,
                promptText: '',
                promptTitle: '',

                onedit: null, //function(element, ev) { }; //开始编辑之前触发, 支持return
                oncancel: null, //function(ev) { } 取消之前触发，支持return
                onchange: null, //更新之前，支持 return false
                'onchange+': null, //function(value) { };
                'onchange+success': null,
                'onchange+failure': null,
                'onchange+exception': null,
                'onchange+completion': null,

                //select - { text: value, text: value, text: value }  | #select
                _map: null,
                options: function(options) {
                    if (options == null) {
                        options = this._map;
                    }
                    switch(this.type) {
                        case 'select':
                            if (typeof(options) == 'string') {
                                return options.toMap();                                
                            }
                            else if (options == null) {
                                return { 'EMPTY': 'EMPTY' };                            
                            }
                            else {
                                return options;
                            }                        
                        default:
                            return null;
                    }                
                }
            })
            .elementify(element => {
                if (this.type == 'select') {
                    this.typeName = 'SELECT';
                }
                else if (this.type == 'textarea') {
                    this.typeName = 'TEXTAREA';
                }

                this.element = element;
                if (element.nodeName == 'COL') {
                    this.editButtonStyle = 'none';
                    this.confirmButtonStyle = 'none';
                    this.cancelButtonStyle = 'none';
                }
                element.getAttributeNames().forEach(attr => {
                    if (/^(input|select|textarea)-/i.test(attr)) {
                        this.controllerAttributes[attr.takeAfter('-').toCamel()] = element.getAttribute(attr);
                    }
                });

                if (this.kilo) {
                    if (!'number,integer,float'.includes(this.type)) {
                        this.kilo = false;
                    }
                }

                this['edit-on'] = this.element.getAttribute('edit-on') || 'click';
                this.element.removeAttribute('edit-on');
                Event.interact(this, element);
            });        
    }

    get editable () {
        return $parseBoolean(this.editable$.$p(this.element, this), this.editable$value);
    }

    set editable (editable) {
        this.editable$ = editable;
        if (this.editButton != null) {
            this.editButton.hidden = false;
        }        
    }

    get value() {
        return this.controller?.value ?? this.element.textContent;
    }
}

String.prototype.concatValue = function(value) {
    let str = this.toString();
    if (str.endsWith('=')) {
        return str + encodeURIComponent(value)
    }
    else {
        return str;
    }
}

Editor.prototype.typeName = 'INPUT';
//保存配置的元素, 可编辑的元素
Editor.prototype.element = null;
Editor.prototype.controller = null;
/// <value type="Boolean">是否正在编辑</value>
Editor.prototype.editing = false;
/// <value type="Boolean">是否正在更新</value>
Editor.prototype.updating = false;

Editor.prototype.editButton = null;
//Editor.prototype.confirmButton = null;
//Editor.prototype.cancelButton = null;

Editor.prototype.getAttribute = function(name) {
    if (name.startsWith('input-') || name.startsWith('select-') || name.startsWith('textarea-')) {
        return this.controllerAttributes[this.name.takeAfter('-').toCamel()];
    }
    else {
        return this[name];
    }    
}

Editor.getButton = function(style, icon, text, className) {
    let content = '';    
    let button = null;

    if (icon != '') {
        if (/\.(jpg|jpeg|png|gif)$/i.test(icon)) {
            content = `<img src="${icon}" align="absmiddle" class="editor-icon-edit" />`;
        }
        else {
            content = `<i class="iconfont ${icon} editor-icon-edit"></i>`;
        }
    }

    if (text != '') {
        if (content != '') {
            content += ' ' + text;
        }
        else {
            content = text;
        }
    }
    
    if (content != '') {
        if (style == 'button') {       
            button = $create('BUTTON', { innerHTML: content, className: className }, { marginLeft: '6px' });
        }
        else if (style == 'text') {
            button = $create('A', { innerHTML: content, href: 'javascript:void(0)', className: className }, { marginLeft: '6px' });
        }
    }

    return button;
}

Editor.prototype.apply = function(...elements) {

    elements.forEach(element => {
        if (typeof(element) == 'string') {
            $a(element).forEach(e => {
                this.bindings.push(e);
            });
        }
        else {
            this.bindings.push(element);
        }
    });    

    if (this.bindings.length == 0 && this.element.nodeName != 'COL') {
        console.warn('No element to apply editor, please check "bindings" property.');
    }

    this.bindings.forEach(binding => {
        if (binding != null && !binding.hasAttribute('editor-bound')) {
            binding.editor = this;            
            binding.setAttribute('editor-bound', '');

            if (binding.textContent == '') {
                this.setPlaceHolder(binding);
            }

            if (this.editButtonStyle != 'none') {
                this.editButton = Editor.getButton(this.editButtonStyle, this.editButtonIcon, this.editButtonText, this.editButtonClass);
                if (this.editButton != null) {
                    binding.insertAdjacentElement('afterEnd', this.editButton);
                    this.editButton.on('click', function(ev) {
                        binding.edit(ev);
                    });
                }
                this.editButton.hidden = !this.editable;
            }

            Event.watch(binding, 'edit-on', this['edit-on']);

            Editor[this.typeName].initialize(this, binding);
        }
    });
}

Editor.prototype.setPlaceHolder = function(element) {
    if (this.placeHolder == '') {
        if (element.getAttribute('placeholder') != null) {
            this.placeHolder = element.getAttribute('placeholder');
        }
    }

    if (this.placeHolder != '') {
        element.innerHTML = '';
        element.appendChild($create('SPAN', { innerHTML: this.placeHolder }, { color: '#808080' }, { 'sign': 'placeholder' }));
    }
    else {
        element.innerHTML = '&nbsp;';
    }
}

Editor.prototype.initializeControllerAttributes = function(controller) {
    for (let name in this.controllerAttributes) {
        let actual = name != 'class' ? name : 'className';
        if (controller[actual] !== undefined) {
            controller[actual] = this.controllerAttributes[name];
        }
        else {
            controller.setAttribute(actual, this.controllerAttributes[name]);
        }
    }
}

Editor.prototype.appendButtons = function(element) {
    let confirmButton = Editor.getButton(this.confirmButtonStyle, this.confirmButtonIcon, this.confirmButtonText, this.confirmButtonClass || 'small-compact-button blue-button');
    if (confirmButton != null) {
        confirmButton.onclick = function(ev) {
            element.editor.update(element);
            ev.stopPropagation();
        }
        element.appendChild(confirmButton);
    } 

    let cancelButton = Editor.getButton(this.cancelButtonStyle, this.cancelButtonIcon, this.cancelButtonText, this.cancelButtonClass || 'editor-link-button');
    if (cancelButton != null) {
        cancelButton.onclick = function(ev) {
            element.editor.cancel(element, ev);
            ev.stopPropagation();
        }
        element.appendChild(cancelButton);
    }
}

Editor.prototype.update = function(element, ev, after) {    
    Editor[this.typeName].update(this, element, after);
}

Editor.prototype.cancel = function(element, ev) {    
    Editor[this.typeName].cancel(this, element);
}

Editor.INPUT = {
    initialize: function(editor, element) {
        if (element.innerHTML == '') {
            editor.setPlaceHolder(element);
        }
        else if (editor.kilo) {
            element.innerHTML = element.innerHTML.toFloat(0).kilo();
        }
    },

    editInPrompt: function(editor, element) {
        let value = element.textContent;
        if (editor.kilo) {
            value = value.replaceAll(',', '');
        }
        if ($root.prompt != null) {                
            $root.prompt(editor.promptText, {
                    ...editor.controllerAttributes,
                    type: editor.type,
                    value: value,
                    defaultValue: value
                }, 
                {
                    "text": editor.confirmButtonText,
                    "class": editor.confirmButtonClass,
                    "icon": editor.confirmButtonIcon
                }, {
                    "text": editor.cancelButtonText,
                    "class": editor.cancelButtonClass,
                    "icon": editor.cancelButtonIcon
                }, editor.promptTitle)
                .on('confirm', function(ev) {
                    editor.controller = $s('#PromptTextBox');
                    if (editor.controller.status == 1) {
                        editor.update(element, ev);
                    }
                    return false;
                })
                .on('cancel', function(ev) {
                    editor.cancel(element);
                })
                .on('close', function(ev) {
                    if (editor.editing) {
                        editor.cancel(element);
                    }                    
                })
        }
        else {
            let after = window.prompt(editor.promptText, value);
            if (after != null) {
                editor.update(element, null, after);
            }
            else {
                editor.cancel(element);
            }                
        }        
    },

    edit: function (editor, element) {
        let before = element.querySelector('SPAN[sign=placeholder]') == null ? element.textContent : '';
        if (editor.kilo) {
            before = before.replaceAll(',', '');
        }
        let textBox = $create('INPUT', { type: editor.type, value: before, defaultValue: before });
        editor.initializeControllerAttributes(textBox);
        textBox.initializeInputable?.();
        editor.controller = textBox;

        //绑定事件不支持 return，只能直接指定
        textBox.onkeydown = function (ev) {
            // Enter
            if (ev.keyCode == 13) {
                editor.update(element, ev);
                return false;
            }
            // ESC
            else if (ev.keyCode == 27) {
                editor.cancel(element, ev);        
                return false;
            }
            else if (editor.type == 'integer') {
                return HTMLInputElement.Key?.isInteger(ev, this) ?? true;
            }
            else if (editor.type == 'float') {
                return HTMLInputElement.Key?.isFloat(ev, this) ?? true;
            }
            else if (this.type == 'number') {
                return HTMLInputElement.Key?.isNumber(ev, this) ?? true;
            }
        }

        if (editor.editButtonStyle != 'none') {
            element.nextElementSibling.hidden = true;
        }

        if (editor.confirmButtonStyle == 'none') {
            textBox.onblur = function (ev) {
                editor.update(element, ev);
            }
        }

        // textBox.size = textBox.value.$length(3) + 2;
        // textBox.onkeyup = function (ev) {
        //     this.size = this.value.$length(3) + 2;
        // }

        element.innerHTML = '';
        element.appendChild(textBox);

        if (editor.confirmButtonStyle != 'none') {
            editor.appendButtons(element);
        }

        textBox.focus();
    },

    update: function(editor, element, after) {
        if (editor.controller != null && editor.controller.value != editor.controller.defaultValue) {
            if (after == undefined) {
                after = editor.controller.value;
            }            
            if (editor.editing && editor.execute('onchange', after)) {
                //update
                if (editor['onchange+'] != null) {
                    editor.controller.disabled = true;
                    editor.updating = true;
    
                    $FIRE(editor, 'onchange+',
                        function(data) {
                            if (after == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {
                                element.innerHTML = editor.kilo ? after.toFloat().kilo() : after;
                            }
                            if (editor.editButtonStyle != 'none') {
                                element.nextElementSibling.hidden = false;
                            }
                            editor.editing = false;
                            $s('#PromptPopup')?.close?.();
                        }, 
                        function(data) {
                            editor.controller.disabled = false;
                            editor.controller.focus();
                            let text = editor.controller.failureText.$p(editor.controller, data);
                            if (text != '') {
                                if (editor.editInPrompt && $root.prompt != null) {
                                    $s('#PromptTextBox').status = $input.status.unexpected;
                                    $s('#PromptTextBox').hintText = text;
                                }
                                else {
                                    Callout(text).position(element, 'up').show();
                                }
                            }
                        },
                        function(error) {                            
                            editor.controller.disabled = false;
                            editor.controller.focus();
                            let text = editor.controller.exceptionText.$p(editor.controller, error) || `Exception: ${error}`;
                            if (editor.editInPrompt && $root.prompt != null) {
                                $s('#PromptTextBox').status = $input.status.exception;
                                $s('#PromptTextBox').hintText = text;
                            }
                            else {
                                Callout(text).position(element, 'up').show();
                            }                            
                        },
                        function() {
                            editor.updating = false;
                        },
                        element
                    );
                }
                else {
                    //needn't updating, but will update display text  
                    if (after == '') {
                        editor.setPlaceHolder(element);
                    }
                    else {
                        element.innerHTML = editor.kilo ? after.toFloat().kilo() : after;
                    }

                    if (editor.editButtonStyle != 'none') {
                        element.nextElementSibling.hidden = false;
                    }
    
                    editor.editing = false;
                }
            }
        }
        else {
            if (!editor.editInPrompt) {
                editor.cancel(element);
            }
        }
    },    
    cancel: function(editor, element) {
        //cancel                    
        if (editor.editing && !editor.updating && editor.execute('oncancel')) {
            editor.editing = false;

            if (!editor.editInPrompt) {
                if (editor.controller.defaultValue == '') {
                    editor.setPlaceHolder(element);
                }
                else {
                    element.innerHTML = editor.kilo ? editor.controller.defaultValue.toFloat().kilo() : editor.controller.defaultValue;
                }
                editor.controller = null;
                
                if (editor.editButtonStyle != 'none') {
                    element.nextElementSibling.hidden = false;
                }
            }
        }
    }
}

Editor.SELECT = {
    initialize: function(editor, element) {
        //auto convert value to text
        let value = element.textContent.trim();
        for (let name in editor.options) {
            if (value == name || value == editor.options[name]) {
                element.setAttribute('text', name);
                element.setAttribute('value', editor.options[name]);
                element.innerHTML = name;
                break;
            }
        }
        if (!element.hasAttribute('value')) {
            element.setAttribute('text', value);
            element.setAttribute('value', value);
        }
    },

    edit: function(editor, element) {
        let before = element.textContent.trim();
        let select = $create('SELECT', { className: editor.selectClass });
        for (let name in editor.options) {
            select.options[select.options.length] = new Option(name, editor.options[name]);
            if (name == before || editor.options[name] == element.getAttribute('value')) {
                select.options[select.options.length - 1].selected = true;
            }
        }
        editor.initializeControllerAttributes(select);
        //editor.controllerAttributes.type != null)  扩展 SELECT 的样式在这意义不大 原生 type="select-one"，需要 getAttribute('type')
        editor.controller = select;

        select.onkeydown = function (ev) {
            if (ev.keyCode == 27) {
                editor.cancel(element, ev);
                return false;
            }
        }

        if (editor.editButtonStyle != 'none') {
            element.nextElementSibling.hidden = true;
        }

        if (editor.confirmButtonStyle == 'none') {
            select.onchange = function (ev) {
                editor.update(element, ev);
            }

            select.onblur = function (ev) {
                //cancel
                if (editor.editing && !editor.updating) {
                    element.innerHTML = element.getAttribute('text');                        
                    editor.editing = false;
                }
            }
        }
        
        element.innerHTML = '';
        element.appendChild(select);

        if (editor.confirmButtonStyle != 'none') {
            editor.appendButtons(element);
        }

        select.focus();
    },

    update: function(editor, element) {
        if (editor.controller != null && editor.controller.value != element.getAttribute('value')) {
            //update
            let beforeText = element.getAttribute('text');
            let beforeValue = element.getAttribute('value');
            let afterText = editor.controller.options[editor.controller.selectedIndex].text;
            let afterValue = editor.controller.value;
            if (editor.editing && editor.execute('onchange', afterValue)) {
                element.setAttribute('text', afterText);
                element.setAttribute('value', afterValue);
                if (editor['onchange+'] != null) {
                    editor.controller.disabled = true;
                    editor.updating = true;

                    $FIRE(editor, 'onchange+',
                        function(data) {
                            element.innerHTML = ''; //must set empty first
                            if (afterText == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {                                
                                element.innerHTML = afterText;
                            }
                            if (editor.editButtonStyle != 'none') {
                                element.nextElementSibling.hidden = false;
                            }
                        }, 
                        function(data) {
                            Callout('Failed: ' + data).position(element, 'up').show();
                            element.setAttribute('text', beforeText);
                            element.setAttribute('value', beforeValue);
                            element.innerHTML = '';
                            element.innerHTML = element.getAttribute('text');
                        },
                        function(error) {
                            Callout('Exception: ' + error).position(element, 'up').show();
                            editor.controller.disabled = false;
                            editor.controller.focus();
                        },
                        function() {
                            editor.updating = false;
                            editor.editing = false;
                        },
                        element
                    );
                }
                else {
                    element.innerHTML = ''; //must set empty first
                    if (afterText == '') {
                        editor.setPlaceHolder(element);
                    }
                    else {                                
                        element.innerHTML = afterText;
                    }
                    editor.execute('onchange+completion', value, element);
                    editor.editing = false;
                }
            }
        }
        else {
            editor.cancel(element);
        }
    },

    cancel: function(editor, element) {

        if (editor.editing && !editor.updating && editor.execute('oncancel')) {
            editor.editing = false;

            if (element.getAttribute('text') == '') {
                editor.setPlaceHolder(element);
            }
            else {
                element.innerHTML = element.getAttribute('text');
            }
            editor.controller = null;
            
            if (editor.editButtonStyle != 'none') {
                element.nextElementSibling.hidden = false;
            }
        }
    }
}

Editor.TEXTAREA = function (editor, element) {

    function textToHtml(text) {
        return text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp; &nbsp; ').replace(/  /g, '&nbsp; ')
    }

    element.innerHTML = element.textContent.trim();
    if (element.innerHTML == '') {
        editor.setPlaceHolder(element);
    }
    else {
        element.innerHTML = textToHtml(element.textContent);
    }

    element.on(editor.editOn, function (ev) {
        //edit
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {

            editor.editing = true;

            let before = element.querySelector('SPAN[sign=placeholder]') == null ? element.innerHTML.replace(/&nbsp;/g, ' ')
                                                                                                    .replace(/<br>/g, '\r\n')
                                                                                                    .replace(/\&lt;/g, '<')
                                                                                                    .replace(/\&gt;/g, '>')
                                                                                                    .replace(/&amp;/g, '&') : ''; //html decode
            let textArea = $create('TEXTAREA', { value: before, defaultValue: before, rows: 5, className: editor.inputClass }, { width: '100%', resize: 'none', overflow: 'hidden' });
            if (editor.maxLength > 0) {
                textArea.maxLength = editor.maxLength;
            }

            //添加事件不支持return，只能直接指定
            textArea.onkeydown = function (ev) {
                // Enter
                if (ev.ctrlKey) {
                    if (ev.keyCode == 13) {
                        this.blur();
                        return false;
                    }                    
                }
                // ESC
                else if (ev.keyCode == 27) {
                    this.value = this.defaultValue;
                    this.blur();
                    return false;
                }
            }

            textArea.onfocus = function (ev) {
                if (this.scrollTop > 0) {
                    this.style.height = this.offsetHeight + this.scrollTop + 'px';
                }
            }

            textArea.onkeyup = function (ev) {
                if (this.scrollTop > 0) {
                    this.style.height = this.offsetHeight + this.scrollTop + 'px';
                }
            }

            textArea.onblur = function (ev) {
                if (this.value != this.defaultValue) {
                    let after = this.value;
                    if (after == '') {
                        editor.execute('onempty', ev);
                        if (!editor.allowEmpty) {
                            this.focus();
                            return false;
                        }                        
                    }
                    if (editor.minLength > 0 && after.length < editor.minLength) {
                        editor.execute('onfail', after);
                        this.focus();
                        return false;                        
                    }
                    
                    if (editor.editing && editor.execute('onchange', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            
                            $cogo(editor.action.concatValue(after), element, after)
                                .then(data => {
                                    //finish
                                    if (editor.execute('onchange+success', data, after)) {
                                        if (after == '') {
                                            editor.setPlaceHolder(element);
                                        }
                                        else {
                                            element.innerHTML = textToHtml(after);
                                        }

                                        editor.execute('onchange+completion', after);
                                    }
                                    else {
                                        textArea.disabled = false;
                                        textArea.focus();
                                    }
                                })
                                .catch(error => {
                                    Callout(error).position(this).show();
                                    editor.execute('onchange+failure', error);
                                    textArea.disabled = false;
                                    textArea.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                });                            

                            this.updating = true;
                        }
                        else {
                            //needn't updating, but will update display text  
                            if (after == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {
                                element.innerHTML = textToHtml(after);
                            }

                            editor.execute('onchange+completion', after);

                            editor.editing = false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    //cancel                    
                    if (editor.editing && !editor.updating && editor.execute('oncancel', ev)) {
                        if (this.defaultValue == '') {
                            editor.setPlaceHolder(element);
                        }
                        else {
                            element.innerHTML = textToHtml(this.defaultValue);
                        }
                        editor.editing = false;
                    }
                }
            }

            element.innerHTML = '';
            element.appendChild(textArea);

            textArea.focus();
        }
    });
}

Editor.PERCENT = function (editor, element) {

     //will lost precision if use /100
    function percent(value) {

        if (typeof (value) == 'string') {
            value = value.toFloat(0);
        }
        value = value.toString()

        let minus = '';
        if (value.startsWith('-')) {
            minus = '-';
            value = value.substring(1);
        }

        if (value.includes('.')) {
            let integer = value.substring(0, value.indexOf('.'));
            let decimal = value.substring(value.indexOf('.') + 1);

            if (integer.length <= 2) {
                value = '0.' + integer.padStart(2, '0') + decimal;
            }
            else {
                value = integer.substring(0, integer.length - 2) + '.' + integer.substring(2) + decimal;
            }
        }
        else {
            if (value.length == 1) {
                if (value == '0') {
                    minus = '';
                }
                else {
                    value = '0.0' + value;
                }
            }
            else {
                let integer = value.substring(0, value.length - 2);
                if (integer == '') {
                    integer = '0';
                }
                let decimal =  value.substring(value.length - 2)
                if (decimal == '00') {
                    value = integer
                }
                else if (decimal.endsWith('0')) {
                    value = integer + '.' + decimal.substring(0, 1);
                }
                else {
                    value = integer + '.' + decimal;
                }
            }
        }

        return minus + value;
    }

     //will lost precision if use *100
    function centuple(value) {

        if (typeof (value) == 'string') {
            value = value.toFloat(0);
        }
        value = value.toString();

        let minus = '';
        if (value.startsWith('-')) {
            minus = '-';
            value = value.substring(1);
        }

        if (value.includes('.')) {
            let integer = value.substring(0, value.indexOf('.'));
            let decimal = value.substring(value.indexOf('.') + 1);

            if (decimal.length <= 2) {
                decimal = decimal.padEnd(2, '0');
                value = integer + decimal;
            }
            else {
                value = integer + decimal.substring(0, 2) + '.' + decimal.substring(2);
            }

            while((value.indexOf('.') > 1 || value.indexOf('.') == -1) && value.startsWith('0')) {
                value = value.replace(/^0/, '');
            }
        }
        else {
            if (value != '0') {
                value += '00';
            }
        }

        return minus + value;
    }

    if (!element.innerHTML.endsWith('%')) {
        let value = centuple(element.textContent);
        element.innerHTML = (editor.kilo ? value.kilo() : value) + '%';
    }

    element.on(editor.editOn, function (ev) {
        //edit
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {

            editor.editing = true;

            let before = element.innerHTML.toFloat(0);
            let textBox = $create('INPUT', { type: 'text', value: before, defaultValue: before, className: editor.inputClass });
            if (editor.maxLength > 0) {
                textBox.maxLength = editor.maxLength;
            }

            textBox.onkeydown = function (ev) {
                // Enter
                if (ev.keyCode == 13) {
                    this.blur();
                    return false;
                }
                // ESC
                else if (ev.keyCode == 27) {
                    this.value = this.defaultValue;
                    this.blur();
                    return false;
                }
                else {
                    return Editor.Key.isEdit(ev) || Editor.Key.isDecimal(ev, this.value);
                }
            }

            textBox.onblur = function (ev) {
                if (this.value != this.defaultValue) {
                    //update
                    let afterText = this.value.trim();
                    let afterValue = percent(this.value);
                    if (editor.minValue != '') {
                        afterValue = afterValue.toFloat(editor.minValue);
                        if (afterValue < editor.minValue) {
                            afterValue = editor.minValue;
                            afterText = centuple(afterValue);
                        }
                    }
                    if (editor.maxValue != '') {
                        afterValue = afterValue.toFloat(0);
                        if (afterValue > ediotr.maxValue) {
                            afterValue = editor.maxValue;
                            afterText = centuple(afterValue);
                        }
                    }
                    this.value = afterText;

                    if (editor.editing && editor.execute('onchange', afterText)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.concatValue(after), element, after)
                                .then(data => {
                                    if (editor.execute('onchange+success', data, afterValue)) {
                                        element.innerHTML = (editor.kilo ? afterText.kilo() : afterText) + '%';

                                        editor.execute('onchange+completion', afterText);
                                    }
                                    else {
                                        textBox.disabled = false;
                                        textBox.focus();
                                    }
                                })
                                .catch(error => {
                                    Callout(error).position(this).show();
                                    editor.execute('onchange+failure', error);
                                    textBox.disable = true;
                                    textBox.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                });                            

                            this.updating = true;
                        }
                        else {
                            element.innerHTML = (editor.kilo ? afterText.kilo() : afterText) + '%';

                            editor.execute('onchange+completion', afterText);

                            editor.editing = false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                else {
                    //cancel
                    if (editor.editing && !editor.updating && editor.execute('oncancel', ev)) {
                        element.innerHTML = (editor.kilo ? this.defaultValue.kilo() : this.defaultValue) + '%';
                        editor.editing = false;
                    }
                }
            }

            textBox.size = textBox.value.$length(4);
            textBox.onkeyup = function (ev) {
                this.size = this.value.$length(4);
            }

            element.innerHTML = '';
            element.appendChild(textBox);
            element.appendChild(document.createTextNode('%'));

            textBox.focus();
        }
    });
}

Editor.reapplyAll = function() {
    for (let component of document.components.values()) {
        if (component.tagName == 'EDITOR') {
            component.apply();
        }
    }

    for (let table of $a('table[data]')) {
        for (let col of table.cols) {
            if (col.editor != null) {
                col.ediotr.apply();
            }
        }
    }
}

Editor.initializeAll = function () {

    // <editor bindings="selector" />
    // <tag editable />
    $a('editor,[editable]').forEach(element => {
        if (element.nodeName != 'COL' && !element.hasAttribute('root-editor')) {
            element.setAttribute('root-editor', '');
            new Editor(element).apply(element.getAttribute('bindings') ?? element);        
        }
    });
}

document.on('post', function () {
    Editor.initializeAll();
});