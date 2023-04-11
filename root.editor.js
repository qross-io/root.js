//-----------------------------------------------------------------------
// www.qross.io
//-----------------------------------------------------------------------
// root.editor.js
// Realtime text editing on page. 


HTMLElement.prototype.editor = null;
HTMLElement.prototype.edit = function(ev) {
    if ('SPAN,A,P,DIV,FONT,B,I,LABEL,H1,H2,H3,H4,H5,H6,TD,TH'.includes(this.nodeName)) {
        if (this.editor.editable && !this.editor.editing && this.editor.dispatch('onedit', { 'editor': this.editor, 'ev': ev })) {
            this.editor.editing = true;
            if (this.editor.editInPrompt) {
                HTMLEditorAttribute[this.editor.typeName].editInPrompt(this.editor, this);
            }
            else {
                HTMLEditorAttribute[this.editor.typeName].edit(this.editor, this);
            }
        }
    }
}

class HTMLEditorAttribute extends HTMLCustomAttribute {

    constructor(element) {
        super(element)

        if (this.type == 'select') {
            this.#typeName = 'SELECT';
        }
        else if (this.type == 'textarea') {
            this.#typeName = 'TEXTAREA';
        }

        if (element.nodeName == 'COL') {
            this.editButtonStyle = 'none';
            this.confirmButtonStyle = 'none';
            this.cancelButtonStyle = 'none';
        }

        element.getAttributeNames().forEach(attr => {
            if (/^(input|select|textarea)-/i.test(attr)) {
                this.#controllerAttributes[attr.takeAfter('-').toCamel()] = element.getAttribute(attr);
            }
        });

        if (this.kilo) {
            if (!'number,integer,float'.includes(this.type)) {
                this.kilo = false;
            }
        }

        if (element.hasAttribute('edit-on')) {
            this.#editOn = Enum('click|dblclick').validate(element.getAttribute('edit-on'));
            element.removeAttribute('edit-on');
        }

        Event.interact(this.element, this.element);
    }

    #controllerAttributes = new Object()
    #bindings = [];

    get controllerAttributes() {
        return this.#controllerAttributes;
    }

    get bindings() {
        return this.#bindings;
    }

    get editable () {
        return $parseBoolean(this.getAttribute('editable'), true, this);
    }

    set editable (editable) {
        this.setAttribute('editable', editable);
        this.editButton?.show(this.editable);                
    }

    get value() {
        return this.controller?.value ?? this.element.text;
    }

    //linktext|star|starbutton
    //text|textarea|integer|number|select
    get type() {
        return Enum('text|textarea|integer|number|select').validate(this.getAttribute('editor-type') ?? this.getAttribute('type', ''));
    }

    set type(type) {
        this.setAttribute('editor-type', type);
    }

    #typeName = 'INPUT';

    get typeName() {
        return this.#typeName;
    }

    #editOn = 'click';

    get editOn() {
        return this.#editOn;
    }

    get allowEmpty() {
        return $parseBoolean(this.getAttribute('allow-empty'), false, this);
    }

    set allowEmpty(value) {
        this.setAttribute('allow-empty', value);
    }

    get placeHolder() {
        return this.getAttribute('place-holder', '');
    }

    set placeHolder(holder) {
        this.setAttribute('place-holder', holder);
    }

    get kilo() {
        return $parseBoolean(this.getAttribute('kilo'), false, this);
    }

    set kilo(kilo) {
        this.setAttribute('kilo', kilo);
    }

    get editButtonStyle() {
        return Enum('text|none|button').validate(this.getAttribute('edit-button-style'));
    }

    set editButtonStyle(style) {
        this.setAttribute('edit-button-style', style);
    }

    get editButtonIcon() {
        return this.getAttribute('edit-button-icon', 'icon-edit');
    }

    set editButtonIcon(icon) {
        this.setAttribute('edit-button-icon', icon);
    }

    get editButtonText() {
        return this.getAttribute('edit-button-text', '');
    }

    set editButtonText(text) {
        this.setAttribute('edit-button-text', text);
    }

    get editButtonClass() {
        return this.getAttribute('edit-button-class', '');
    }

    set editButtonClass(className) {
        this.setAttribute('edit-button-class', className);
    }

    get confirmButtonStyle() {
        return Enum('button|none|text').validate(this.getAttribute('confirm-button-style'));
    }

    set confirmButtonStyle(style) {
        this.setAttribute('confirm-button-style', style);
    }

    get confirmButtonText() {
        return this.getAttribute('confirm-button-text', 'OK');
    }

    set confirmButtonText(text) {
        this.setAttribute('confirm-button-text', text);
    }

    get confirmButtonIcon() {
        return this.getAttribute('confirm-button-icon', '');
    }

    set confirmButtonIcon(icon) {
        this.setAttribute('confirm-button-icon', icon);
    }

    get confirmButtonClass() {
        return this.getAttribute('confirm-button-class', '');
    }

    set confirmButtonClass(className) {
        this.setAttribute('confirm-button-class', className);
    }

    get cancelButtonStyle() {
        return Enum('text|none|button').validate(this.getAttribute('cancel-button-style'));
    }

    set cancelButtonStyle(style) {
        this.setAttribute('cancel-button-style', style);
    }

    get cancelButtonText() {
        return this.getAttribute('cancel-button-text', 'Cancel');
    }

    set cancelButtonText(text) {
        this.setAttribute('cancel-button-text', text);
    }

    get cancelButtonIcon() {
        return this.getAttribute('cancel-button-icon', '');
    }

    set cancelButtonIcon(icon) {
        this.setAttribute('cancel-button-icon', icon);
    }

    get cancelButtonClass() {
        return this.getAttribute('cancel-button-class', '');
    }

    set cancelButtonClass(className) {
        this.setAttribute('cancel-button-class', className);
    }

    get editInPrompt() {
        return $parseBoolean(this.getAttribute('edit-in-prompt'), false, this);
    }

    set editInPrompt(prompt) {
        this.setAttribute('edit-in-prompt', prompt);
    }

    get promptText() {
        return this.getAttribute('prompt-text', '');
    }

    set promptText(text) {
        this.setAttribute('prompt-text', text);
    }

    get promptTitle() {
        return this.getAttribute('prompt-title', '');
    }

    set promptTitle(text) {
        this.setAttribute('prompt-title', text);
    }

    #options = null;

    get options() {
        if (this.#options == null) {
            this.options = this.getAttribute('options');
        }
        return this.#options;
    }

    set options(options) {
        if (this.type != 'select' || options == null) {
            this.#options = { };
        }
        else {
            if (typeof(options) == 'string') {
                this.#options = options.toMap();
            }
            else {
                this.#options = options;
            }
        }
    }

    get successText() {
        return this.getAttribute('success-text') ?? this.controller?.successText ?? '';
    }

    set successText(text) {
        this.setAttribute('success-text', text);
    }

    get failureText() {
        return this.getAttribute('failure-text') ?? this.controller?.failureText ?? '';
    }

    set failureText(text) {
        this.setAttribute('failure-text', text);
    }

    get exceptionText() {
        return this.getAttribute('exception-text') ?? this.controller?.exceptionText ?? 'Exception: {error}';
    }

    set exceptionText(text) {
        this.setAttribute('exception-text', text);
    }

    get calloutPosition() {
        return this.getAttribute('callout-position') ?? this.getAttribute('callout') ?? this.controller?.calloutPosition;
    }

    set calloutPosition(position) {
        this.setAttribute('callout-position', position);
    }

    #value = '';

    get value() {
        return this.controller?.value ?? this.#value;
    }

    set value(value) {
        this.#value = value;
    }

    controller = null;

    #editing = false;
    #updating = false;

    get editing() {
        return this.#editing;
    }

    set editing(bool) {
        this.#editing = bool;
    }

    get updating() {
        return this.#updating;
    }

    set updating(bool) {
        this.#updating = bool;
    }

    #editButton = null;
    #confirmButton = null;
    #cancelButton = null;

    get editButton() {
        return this.#editButton;
    }

    set editButton(button) {
        this.#editButton = button;
    }

    get confirmButton() {
        return this.#confirmButton;
    }

    set confirmButton(button) {
        this.#confirmButton = button;
    }

    get cancelButton() {
        return this.#cancelButton;
    }

    set cancelButton(button) {
        this.#cancelButton = button;
    }

    apply (...elements) {

        HTMLEditorAttribute.defineEvents(this.element);

        elements.forEach(element => {
            if (typeof(element) == 'string') {
                $$(element).forEach(e => {
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
                    this.editButton = HTMLEditorAttribute.getButton(this.editButtonStyle, this.editButtonIcon, this.editButtonText, this.editButtonClass);
                    if (this.editButton != null) {
                        binding.insertAdjacentElement('afterEnd', this.editButton);
                        this.editButton.on('click', function(ev) {
                            binding.edit(ev);
                        });
                    }
                    this.editButton.hidden = !this.editable;
                }
    
                Event.watch(binding, 'edit-on', this.editOn);
    
                HTMLEditorAttribute[this.typeName].initialize(this, binding);
            }
        });
    }

    setPlaceHolder (element) {
        if (this.placeHolder == '') {
            this.placeHolder = element.getAttribute('place-holder', '');
        }
    
        if (this.placeHolder != '') {
            element.classList.add('editor-placeholder');
            element.innerHTML = this.placeHolder;
        }
        else {
            element.innerHTML = '&nbsp;';
        }
    }

    hidePlaceHolder(element) {
        element.$('span[sign=placeholder]')?.hide();
    }

    initializeControllerAttributes (controller) {
        for (let name in this.controllerAttributes) {
            controller.set(name, this.controllerAttributes[name]);            
        }
    }

    appendButtons (element) {
        let confirmButton = HTMLEditorAttribute.getButton(this.confirmButtonStyle, this.confirmButtonIcon, this.confirmButtonText, this.confirmButtonClass || 'small-compact-button blue-button');
        if (confirmButton != null) {
            confirmButton.onclick = function(ev) {
                element.editor.update(element);
                ev.stopPropagation();
            }
            element.appendChild(confirmButton);
        } 
    
        let cancelButton = HTMLEditorAttribute.getButton(this.cancelButtonStyle, this.cancelButtonIcon, this.cancelButtonText, this.cancelButtonClass || 'editor-link-button');
        if (cancelButton != null) {
            cancelButton.onclick = function(ev) {
                element.editor.cancel(element, ev);
                ev.stopPropagation();
            }
            element.appendChild(cancelButton);
        }
    }

    update (element, ev, after) {    
        HTMLEditorAttribute[this.typeName].update(this, element, after, ev);
    }
    
    cancel (element, ev) {    
        HTMLEditorAttribute[this.typeName].cancel(this, element, ev);
    }
}

// onedit 开始编辑之前触发, 支持 return
// oneditcancel 取消之前触发，支持 return
// oneditconfirm 或 ontextchange 更新之前，支持 return false

HTMLEditorAttribute.defineEvents = function(element) {
    HTMLCustomAttribute.defineEvents('EDITOR', element, ['onedit', 'oneditconfirm', 'oneditcancel', ['ontextchange', 'onTextChanged'], ['ontextchange+', 'onTextChanged+']]);    
}


HTMLEditorAttribute.getButton = function(style, icon, text, className) {
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

String.prototype.concatValue = function(value) {
    let str = this.toString();
    if (str.endsWith('=')) {
        return str + encodeURIComponent(value)
    }
    else {
        return str;
    }
}

HTMLEditorAttribute.INPUT = {
    initialize: function(editor, element) {
        if (element.innerHTML == '' || element.innerHTML == '&nbsp;') {
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
                    editor.controller = $('#PromptTextBox');
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

        // textBox.size = textBox.value.unicodeLength.max(3) + 2;
        // textBox.onkeyup = function (ev) {
        //     this.size = this.value.unicodeLength.max(3) + 2;
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
            if (editor.editing && editor.dispatch('ontextchange', { 'text': after, 'value': after }) && editor.dispatch('oneditconfirm', { 'text': after , 'value': after })) {
                //update
                if (editor.element['ontextchange+'] != null) {
                    editor.controller.disabled = true;
                    editor.updating = true;
    
                    $FIRE(editor.element, 'ontextchange+',
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

                            $('#PromptPopup')?.close?.();
                            if (editor.successText != '') {
                                Callout(editor.successText.$p(editor.element, data)).position(element, editor.calloutPosition).show();
                            }

                            editor.controller =  null;

                            editor.value = after;
                        }, 
                        function(data) {
                            editor.controller.disabled = false;
                            editor.controller.focus();
                            let text = editor.failureText.$p(editor.element, data);
                            if (text != '') {
                                if (editor.editInPrompt && $root.prompt != null) {
                                    $('#PromptTextBox').status = HTMLInputElement.STATUS.UNEXPECTED;
                                    $('#PromptTextBox').hintText = text;
                                }
                                else {
                                    Callout(text).position(editor.element, editor.calloutPosition).show();
                                }
                            }
                        },
                        function(error) {                            
                            editor.controller.disabled = false;
                            editor.controller.focus();
                            let text = editor.exceptionText.$p(editor.element, { data: error, error: error }) || `Exception: ${error}`;
                            if (editor.editInPrompt && $root.prompt != null) {
                                $('#PromptTextBox').status = HTMLInputElement.STATUS.EXCEPTION;
                                $('#PromptTextBox').hintText = text;
                            }
                            else {
                                Callout(text).position(editor.element, editor.calloutPosition).show();
                            }                            
                        },
                        function() {                            
                            editor.updating = false;
                            editor.editing = false;                            
                        },
                        element,
                        { 'text': after, 'value': after }
                    );
                }
                else {
                    //needn't updating, but will update display text  
                    if (after == '') {
                        editor.setPlaceHolder(element);
                    }
                    else {
                        //element.innerHTML = '';
                        element.innerHTML = editor.kilo ? after.toFloat().kilo() : after;
                    }

                    if (editor.editButtonStyle != 'none') {
                        element.nextElementSibling.hidden = false;
                    }
    
                    editor.value = after;
                    editor.editing = false;                    
                }
            }
        }
        else {
            editor.cancel(element);
        }
    },    
    cancel: function(editor, element) {
                   
        if (editor.editing && !editor.updating && editor.dispatch('oneditcancel')) {
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

HTMLEditorAttribute.SELECT = {
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
            if (editor.editing && editor.dispatch('ontextchange', { 'text': afterText, 'value': afterValue })  && editor.dispatch('oneditconfirm', { 'text': afterText, 'value': afterValue })) {
                element.setAttribute('text', afterText);
                element.setAttribute('value', afterValue);
                if (editor.element['ontextchange+'] != null) {
                    editor.controller.disabled = true;
                    editor.updating = true;

                    $FIRE(editor.element, 'ontextchange+',
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

                            element.controller = null;

                            editor.value = afterValue;

                            if (editor.successText != '') {
                                Callout(editor.successText.$p(editor.element, data)).position(element, editor.calloutPosition).show();
                            }
                        }, 
                        function(data) {
                            Callout(editor.failureText.$p(editor.element, data)).position(element, 'up').show();

                            element.setAttribute('text', beforeText);
                            element.setAttribute('value', beforeValue);

                            element.innerHTML = '';
                            element.innerHTML = element.getAttribute('text');
                        },
                        function(error) {
                            Callout(editor.exceptionText.$p(editor.element, { data: error, error: error }) || `Exception: ${error}`).position(element, 'up').show();

                            editor.controller.disabled = false;
                            editor.controller.focus();
                        },
                        function() {
                            editor.updating = false;
                            editor.editing = false;
                        },
                        element,
                        { 'text': afterText, 'value': afterValue }
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

                    editor.value = afterValue;
                    editor.editing = false;
                }
            }
        }
        else {
            editor.cancel(element);
        }
    },

    cancel: function(editor, element) {

        if (editor.editing && !editor.updating && editor.dispatch('oneditcancel')) {
            editor.editing = false;

            if (element.getAttribute('text') == '') {
                editor.setPlaceHolder(element);
            }
            else {
                element.innerHTML = element.getAttribute('text');
            }

            editor.controller.remove();
            editor.controller = null;
            
            if (editor.editButtonStyle != 'none') {
                element.nextElementSibling.hidden = false;
            }
        }
    }
}

HTMLEditorAttribute.TEXTAREA = {
    textToHtml: function(text) {
        return text.replace(/\n/g, '<br>').replace(/\t/g, '&nbsp; &nbsp; ').replace(/  /g, '&nbsp; ')
    },
    initialize: function(editor, element) {
        element.innerHTML = element.textContent.trim();
        if (element.innerHTML == '') {
            editor.setPlaceHolder(element);
        }
        else {
            element.innerHTML = HTMLEditorAttribute.TEXTAREA.textToHtml(element.textContent);
        }
    },
    editInPrompt: function(editor, element) {

    },
    edit: function (editor, element) {
            let before = element.classList.contains('editor-placeholder') ? '' : element.innerHTML.replace(/&nbsp;/g, ' ')
                                                                                                    .replace(/<br>/g, '\r\n')
                                                                                                    .replace(/\&lt;/g, '<')
                                                                                                    .replace(/\&gt;/g, '>')
                                                                                                    .replace(/&amp;/g, '&'); //html decode
            let textArea = $create('TEXTAREA', { value: before, defaultValue: before, rows: 5 }, { width: '96%', resize: 'none', overflow: 'hidden' });
            editor.initializeControllerAttributes(textArea);
            editor.controller = textArea;

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
                editor.update(element, ev);
            }

            element.classList.remove('editor-placeholder');
            element.innerHTML = '';
            element.appendChild(textArea);

            textArea.focus();
    },
    update: function (editor, element, after) {

        if (editor.controller != null && editor.controller.value != editor.controller.defaultValue) {
            if (after == undefined) {
                after = editor.controller.value;
            }            
            if (editor.editing && editor.dispatch('ontextchange', { 'text': after, 'value': after }) && editor.dispatch('oneditconfirm', { 'text': after , 'value': after })) {
                
                if (editor.element['ontextchange+'] != null) {
                    editor.controller.disabled = true;
                    editor.updating = true;

                    $FIRE(editor.element, 'ontextchange+',
                        function(data) {
                            //finish                            
                            if (after == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {
                                element.innerHTML = HTMLEditorAttribute.TEXTAREA.textToHtml(after);
                            }

                            editor.value = after;

                            if (editor.editButtonStyle != 'none') {
                                element.nextElementSibling.hidden = false;
                            }
                            
                            if (editor.successText != '') {
                                Callout(editor.successText.$p(editor.element, data)).position(element, editor.calloutPosition).show();
                            }
                        }, 
                        function(data) {
                            editor.controller.disabled = false;
                            editor.controller.focus();

                            Callout(editor.failureText.$p(editor.element, data)).position(element, editor.calloutPosition).show();
                        },
                        function(error) {    
                            editor.controller.disabled = false;
                            editor.controller.focus();

                            Callout(editor.exceptionText.$p(editor.element, { data: error, error: error }) || `Exception: ${error}`).position(element, editor.calloutPosition).show();
                        },
                        function() {
                            editor.updating = false;
                            editor.editing = false;                            
                        },
                        element,
                        { 'text': after, 'value': after }
                    );
                }
                else {
                    //needn't updating, but will update display text  
                    if (after == '') {
                        editor.setPlaceHolder(element);
                    }
                    else {
                        element.innerHTML = HTMLEditorAttribute.TEXTAREA.textToHtml(after);
                    }

                    editor.value = after;
                    editor.editing = false;
                }
            }
            else {
                return false;
            }
        }
        else {               
           this.cancel(editor, element);
        }
    },
    cancel: function (editor, element) {
        if (editor.editing && !editor.updating && editor.dispatch('oneditcancel')) {
            editor.editing = false;

            if (editor.controller.defaultValue == '') {
                editor.setPlaceHolder(element);
            }
            else {
                element.innerHTML = '';
                element.innerHTML = HTMLEditorAttribute.TEXTAREA.textToHtml(editor.controller.defaultValue);
            }
            editor.controller.remove();
            editor.controller = null;
            
            if (editor.editButtonStyle != 'none') {
                element.nextElementSibling.hidden = false;
            }
        }        
    }
}

HTMLEditorAttribute.reapplyAll = function() {
    for (let component of document.components.values()) {
        if (component.tagName == 'EDITOR') {
            component.apply();
        }
    }

    for (let table of $$('table[data]')) {
        for (let col of table.cols) {
            if (col.editor != null) {
                col.ediotr.apply();
            }
        }
    }
}

HTMLEditorAttribute.initializeAll = function () {

    // <editor bindings="selector" />
    // <tag editable />
    $$('editor,[editable]').forEach(element => {
        if (element.nodeName != 'COL' && !element.hasAttribute('root-editor')) {
            element.setAttribute('root-editor', '');
            new HTMLEditorAttribute(element).apply(element.getAttribute('bindings') ?? element);        
        }
    });
}

document.on('post', function () {
    HTMLEditorAttribute.initializeAll();
});