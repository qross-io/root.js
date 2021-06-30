//-----------------------------------------------------------------------
// www.qross.io
//-----------------------------------------------------------------------
// root.editor.js
// Realtime text editing on page. 


HTMLElement.prototype.editor = null;
HTMLElement.prototype.edit = function(ev) {
    if ('SPAN,A,P,DIV,FONT,B,I,LABEL,H1,H2,H3,H4,H5,H6'.$includes(this.nodeName)) {
        if (this.editor.editable && !this.editor.editing && this.editor.execute('onedit', this.editor, ev)) {
            this.editor.editing = true;
            Editor[this.editor.typeName].edit(this.editor, this);
        }
    }
}

class Editor {

    constructor(elementOrSettings) {

        this.controllerAttributes = new Object();

        $initialize(this)
            .with(elementOrSettings)
            .declare({

                editable$: true,
                inputType: 'text|textarea|integer|decimal|percent|select', //linktext|star|starbutton
                allowEmpty: false,

                kilo: false,
                placeHolder: '',

                showEditIcon: true,
                editIcon: 'icon-edit',
                showButtons: false, //button, link, icon, button-link,  button-icon
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                confirmButtonClass: 'small-compact-button blue-button',
                cancelButtonClass: 'editor-link-button',

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
                options: function(options) {
                    switch(this.editorType) {
                        case 'select':
                            if (typeof(options) == 'string') {
                                if (options.includes('&')) {
                                    return options.toMap('&', '=');
                                }
                                else if (options.isObjectString()) {
                                    return Json.eval(options)                                
                                }
                                else if (options.startsWith('#')) {
                                    let select = $s(options);
                                    if (select != null && select.nodeName == 'SELECT') {
                                        options = new Object();
                                        for (let i = 0; i < select.options.length; i++) {
                                            options[select.options[i].text] = select.options[i].value;
                                        }
                                    }    
                                    return options;                                
                                }
                                else {
                                    return options.$trim('[', ']').toMap(',');
                                }
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
                this.element = element;
                element.getAttributeNames().forEach(attr => {
                    if (/^(input|select|textarea)-/i.test(attr)) {
                        attr = attr.substring(5);
                        if (attr.startsWith('-')) {
                            attr = attr.substring(1);
                        }
                        if (attr == 'class') {
                            attr = 'className';
                        }
                        this.controllerAttributes[attr.toCamel()] = element.getAttribute('attr');
                    }
                })
            });        
    }

    get editable () {
        return $parseBoolean(this.editable$.$p(this.element, this), this.editable$value);
    }

    set editable (editable) {
        this.editable$ = editable;
    }

    get editing () {
        return this.$editing;
    }

    set editing (editing) {
        if (this.showEditIcon) {
            this.element.nextElementSibling.hidden = editing;
        }
        if (!editing) {
            this.controller = null;
        }
        this.$editing = editing;
    }

    get typeName() {
        return this.inputType.toUpperCase();
    }

    get value() {
        return this.controller?.value || this.element.textContent;
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

//保存配置的元素, 可编辑的元素
Editor.prototype.element = null;
Editor.prototype.controller = null;
/// <value type="Boolean">是否正在编辑</value>
Editor.prototype.$editing = false;
/// <value type="Boolean">是否正在更新</value>
Editor.prototype.updating = false;

Editor.prototype.getAttribute = function(name) {
    if (name.startsWith('input-') || name.startsWith('select-') || name.startsWith('textarea-')) {
        return this.controllerAttributes[this.name.takeAfter('-').toCamel()];
    }
    else {
        return this[name];
    }    
}

Editor.prototype.initialize = function() {

    if (this.element.textContent == '') {
        this.setPlaceHolder(this.element);
    }

    if (this.showEditIcon) {
        if (/\.(jpg|jpeg|png|gif)$/i.test(this.editIcon)) {
            this.element.insertAdjacentHTML('afterEnd', `<img src="${this.editIcon}" align="absmiddle" class="editor-icon-edit" style="margin-left: 5px;" />`);
        }
        else {
            this.element.insertAdjacentHTML('afterEnd', `<i class="iconfont ${this.editIcon} editor-icon-edit" style="margin-left: 5px;"></i>`);
        }

        $x(this.element.nextElementSibling).on('click', function(ev) {            
            this.previousElementSibling.edit(ev);
        });
    }
    else if (this.element.getAttribute('edit-on') == null) {
        this.element.setAttribute('edit-on', 'click');
    }

    Event.interact(this.element, this.element);
}

Editor.prototype.setPlaceHolder = function(element) {
    if (this.placeHolder == '') {
        if (element.getAttribute('placeholder') != null) {
            this.placeHolder = element.getAttribute('placeholder');
        }
    }

    if (this.placeHolder != '') {
        element.innerHTML = '';
        $x(element).append('SPAN', { innerHTML: this.placeHolder }, { color: '#808080' }, { 'sign': 'placeholder' });
    }
    else {
        element.innerHTML = '&nbsp;';
    }
}

Editor.prototype.initializeControllerAttributes = function(controller) {
    for (let name in this.controllerAttributes) {
        if (controller[name] !== undefined) {
            controller[name] = this.controllerAttributes[name];
        }
        else {
            controller.setAttribute(name, this.controllerAttributes[name]);
        }
    }
}

Editor.prototype.appendButtons = function(element) {
    let confirmButton = $create('BUTTON', { innerHTML: this.confirmButtonText, className: this.confirmButtonClass }, { marginLeft: '5px' });
    confirmButton.onclick = function(ev) {
        element.editor.update();
        ev.stopPropagation();
    }
    element.appendChild(confirmButton);

    let cancelButton = $create('A', { innerHTML: this.cancelButtonText, href: 'javascript:void(0)', className: this.cancelButtonClass }, { marginLeft: '8px' });
    cancelButton.onclick = function(ev) {
        element.editor.cancel();
        ev.stopPropagation();
    }
    element.appendChild(cancelButton);
}

Editor.prototype.update = function(ev) {    
    Editor[this.typeName].update(this, this.element);    
}

Editor.prototype.cancel = function(ev) {    
    Editor[this.typeName].cancel(this, this.element);
}

Editor.TEXT = {

    editInPrompt: function(editor, element) {
        if (editor.promptText != '') {
            if ($root.prompt != null) {
                $root.prompt()
                    .on('open', function() {
                        
                    })
                    .on('confirm', function() {

                    })
                    .on('cancel', function() {

                    })
                    .on('close', function() {

                    })
            }
            else {
                let after = window.prompt(editor.promptText);
                if (after != null) {
                    editor.update(element.textContent, after);
                }
                else {
                    editor.cancel();
                }                
            }
        }
    },

    edit: function (editor, element) {
         
        let before = element.querySelector('SPAN[sign=placeholder]') == null ? element.textContent : '';
        let textBox = $create('INPUT', { type: 'text', value: before, defaultValue: before, autosize: true });
        editor.initializeControllerAttributes(textBox);
        textBox.initializeInputable?.();
        editor.controller = textBox;

        //绑定事件不支持 return，只能直接指定
        textBox.onkeydown = function (ev) {
            // Enter
            if (ev.keyCode == 13) {
                editor.update();
                return false;
            }
            // ESC
            else if (ev.keyCode == 27) {
                editor.cancel();
                return false;
            }
        }

        if (!editor.showButtons) {
            textBox.onblur = function (ev) {
                editor.update();
            }
        }

        textBox.size = textBox.value.$length(3) + 2;
        textBox.onkeyup = function (ev) {
            this.size = this.value.$length(3) + 2;
        }

        element.innerHTML = '';
        element.appendChild(textBox);

        if (editor.showButtons) {
            editor.appendButtons(element);
        }

        textBox.focus();
    },

    update: function(editor, element) {
        if (editor.controller != null && editor.controller.value != editor.controller.defaultValue) {
            
            let after = editor.controller.value;
            if (editor.editing && editor.execute('onchange', after)) {
                //update
                if (editor['onchange+'] != null) {
                    editor.disabled = true;
                    editor.updating = true;
    
                    $FIRE(editor, 'onchange+',
                        function(data) {
                            if (after == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {
                                element.innerHTML = after;
                            }
                        }, 
                        function(data) {
                            element.innerHTML = before;
                        },
                        function(error) {
                            Callout(error).position('up', element).show();
                            editor.controller.disabled = false;
                            editor.controller.focus();
                        },
                        function() {
                            editor.updating = false;
                            editor.editing = false;
                        }
                    );
                }
                else {
                    //needn't updating, but will update display text  
                    if (after == '') {
                        editor.setPlaceHolder(element);
                    }
                    else {
                        element.innerHTML = after;
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
            editor.cancel();
        }
    },

    cancel: function(editor, element) {
        //cancel                    
        if (editor.editing && !editor.updating && editor.execute('oncancel')) {
            if (editor?.controller.defaultValue == '') {
                editor.setPlaceHolder(element);
            }
            else {
                element.innerHTML = editor.controller.defaultValue;
            }
            editor.editing = false;
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

    $x(element).bind(editor.editOn, function (ev) {
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

Editor['integer'] = function (editor, element) {

    let value = element.textContent.trim().toInt(editor.minValue);
    if (editor.minValue != '') {
        if (value < editor.minValue) {
            value = editor.minValue;
        }
    }
    if (editor.maxValue != '') {
        if (value > editor.maxValue) {
            value = editor.maxValue;
        }
    }
    element.innerHTML = editor.kilo ? value.kilo() : value;
    if (element.innerHTML == '') {
        editor.setPlaceHolder(element);
    }

    $x(element).bind(editor.editOn, function (ev) {

        //edit
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {

            editor.editing = true;

            let before = element.querySelector('SPAN[sign=placeholder]') == null ?  element.textContent.toInt(editor.minValue) : '';
            let textBox = $create('INPUT', { type: 'text', value: before, defaultValue: before, className: editor.inputClass });
            if (editor.maxLength > 0) {
                textBox.maxLength = editor.maxLength;
            }

            //添加事件不好使，只能直接指定
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
                    return Editor.Key.isEdit(ev) || Editor.Key.isInteger(ev);
                }
            }

            textBox.onblur = function (ev) {
                if (this.value != this.defaultValue) {
                    //update
                    let after = this.value.trim();
                    if (editor.minLength > 0 && after.length < editor.minLength) {
                        editor.execute('onfail', this.value);
                        this.focus();
                        return false;
                    }
                    if (editor.minValue != '') {
                        after = after.toInt(editor.minValue);
                        if (after < editor.minValue) {
                            after = editor.minValue;
                        }
                    }
                    if (editor.maxValue != '') {
                        after = after.toInt(0);
                        if (after > ediotr.maxValue) {
                            after = editor.maxValue;
                        }
                    }
                    this.value = after;

                    if (editor.editing && editor.execute('onchange', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.concatValue(after), element, after)
                                .then(data => {
                                    if (editor.execute('onchange+success', data, after)) {
                                        element.innerHTML = (editor.kilo ? after.kilo() : after);
                                        if (element.innerHTML == '') { 
                                            editor.setPlaceHolder(element);
                                        }

                                        editor.execute('onchange+completion', after);
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
                            element.innerHTML = editor.kilo ? after.kilo() : after;
                            if (element.innerHTML == '') { 
                                editor.setPlaceHolder(element);
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
                        element.innerHTML = editor.kilo ? this.defaultValue.kilo() : this.defaultValue;
                        if (element.innerHTML == '') { 
                            editor.setPlaceHolder(element);
                         }
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

            textBox.focus();
        }
    }); 
}

Editor['decimal'] = function (editor, element) {

    let value = element.textContent.trim().toFloat(editor.minValue);
    if (editor.minValue != '') {
        if (value < editor.minValue) {
            value = editor.minValue;
        }
    }
    if (editor.maxValue != '') {
        if (value > editor.maxValue) {
            value = editor.maxValue;
        }
    }
    element.innerHTML = editor.kilo ? value.kilo() : value;

    $x(element).bind(editor.editOn, function (ev) {
        //edit
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {

            editor.editing = true;

            let before = element.textContent.toFloat(editor.minValue);
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
                    let after = this.value.trim();
                    if (editor.minLength > 0 && after.length < editor.minLength) {
                        editor.execute('onfail', this.value);
                        this.focus();
                        return false;
                    }
                    if (editor.minValue != '') {
                        after = after.toFloat(editor.minValue);
                        if (after < editor.minValue) {
                            after = editor.minValue;
                        }
                    }
                    if (editor.maxValue != '') {
                        after = after.toFloat(0);
                        if (after > ediotr.maxValue) {
                            after = editor.maxValue;
                        }
                    }
                    this.value = after;
                    
                    if (editor.editing && editor.execute('onchange', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.concatValue(after), element, after)
                                .then(data => {
                                    if (editor.execute('onchange+success', data, after)) {
                                        element.innerHTML = (editor.kilo ? after.kilo() : after);
                                        if (element.innerHTML == '') { 
                                            editor.setPlaceHolder(element);
                                        }

                                        editor.execute('onchange+completion', after);
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
                            element.innerHTML = editor.kilo ? after.kilo() : after;
                            if (element.innerHTML == '') { 
                                editor.setPlaceHolder(element);
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
                        element.innerHTML = editor.kilo ? this.defaultValue.kilo() : this.defaultValue;
                        if (element.innerHTML == '') {
                            editor.setPlaceHolder(element);
                        }
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

            textBox.focus();
        }
    });
}

Editor['percent'] = function (editor, element) {

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

    $x(element).bind(editor.editOn, function (ev) {
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

Editor['select'] = function (editor, element) {

    //auto convert value to text
    let value = element.textContent.trim();
    for (let name in editor.options) {
        if (value == name || value == editor.options[name]) {
            element.setAttribute('value', editor.options[name]);
            element.innerHTML = name;
            break;
        }
    }
    if (element.getAttribute('value') == null) {
        element.setAttribute('value', value);
    }

    $x(element).bind(editor.editOn, function (ev) {
        if (editor.editable && !editor.editing) {
            
            let before = element.textContent.trim();
            if (editor.execute('onedit', element, ev)) {
                editor.editing = true;

                let select = $create('SELECT', { className: editor.selectClass });
                for (let name in editor.options) {
                    select.options[select.options.length] = new Option(name, editor.options[name]);
                    if (name == before || editor.options[name] == element.getAttribute('value')) {
                        select.options[select.options.length - 1].selected = true;
                    }
                }
                element.setAttribute('text', before); //for cancel

                select.onkeydown = function (ev) {
                    if (ev.keyCode == 27) {
                        this.blur();
                        return false;
                    }
                }
                select.onchange = function (ev) {
                    //update
                    let afterText = this.options[this.selectedIndex].text;
                    let afterValue = this.value;
                    if (editor.editing && editor.execute('onchange', afterValue, element)) {
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.concatValue(afterValue), element, afterValue)
                                .then(data => {
                                    if (editor.execute('onchange+success', data, afterValue, element)) {
                                        element.setAttribute('value', afterValue);
                                        element.innerHTML = ''; //must set empty first
                                        element.innerHTML = afterText;

                                        editor.execute('onchange+completion', afterValue, element);
                                    }
                                    else {
                                        select.disabled = false;
                                        select.focus();
                                    }
                                })
                                .catch(error => {
                                    Callout(error).position(this).show();
                                    editor.execute('onchange+failure', status, statusText);
                                    select.disable = true;
                                    select.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                });                            

                            editor.updating = true;
                        }
                        else {
                            element.setAttribute('value', afterValue);
                            element.innerHTML = ''; //must set empty first
                            element.innerHTML = afterText;

                            editor.execute('onchange+completion', value, element);

                            editor.editing = false;
                        }
                    }
                    else {
                        return false;
                    }
                }

                select.onblur = function (ev) {
                    //cancel
                    if (editor.editing && !editor.updating) {
                        element.innerHTML = element.getAttribute('text');                        
                        editor.editing = false;
                    }
                }
                
                element.innerHTML = '';
                element.appendChild(select);
                select.focus();
            }
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
    $a('editor').forEach(editor => {
        $a(editor.getAttribute('bindings')).forEach(element => {
            element.editor = new Editor(element);
            element.editor.initialize();
        });
    });

    //initialize from element
    $a('[editable]').forEach(element => {
        element.editor = new Editor(element);
        element.editor.initialize();            
    });
}

$finish(function () {
    Editor.initializeAll();
});