class HTMLCoderElement extends HTMLCustomElement {
    constructor(textArea) {
        super(textArea);

        this.textArea = textArea;
        this.#readOnly = textArea.getAttribute('read-only') ?? 'false';
        if (this.#readOnly != 'nocursor') {
            this.#readOnly = this.#readOnly.toBoolean(false, this);
        }

        this.options = {
            mode: 'text/x-pql',
            indentWithTabs: true,
            smartIndent: true,
            lineWrapping: true, //自动回行
            scrollbarStyle:'null',//不显示竖直滚动条 高度自动 用不到
            lineNumbers: true,
            matchBrackets : true,
            indentUnit: 4,
            cursorHeight: 0.85,
            readOnly: this.readOnly,
            cursorBlinkRate: -1,
            autofocus: false,
            theme: 'qross',
            extraKeys: { 'Ctrl-Enter': this.name + '-save', 'Cmd-Enter': this.name + '-save' }
        };

        //最小行数
        this.#rows = 0;
        this.#limited = false;

        this.#mode = (textArea.getAttribute('coder') || textArea.getAttribute('mode') || 'pql').toLowerCase();
        if (HTMLCoderElement.mineTypes[this.#mode] != null) {
            this.options['mode'] = HTMLCoderElement.mineTypes[this.#mode];
        }
        else {
            this.options['mode'] = this.#mode;
        }

        //预设的验证器  array/object/object-array
        this.validator = textArea.getAttribute('validator') || '';

        for (let attr of textArea.getAttributeNames()) {
            if (attr == 'rows') {                
                this.#rows = textArea.rows;
            }
            else if (attr == 'keys') {
                let keys = textArea.getAttribute(attr).toMap(';', '->');
                for (let key in keys) {
                    let event = keys[key];
                    this.options.extraKeys[key] = event;
                    //var mac = CodeMirror.keyMap.default == CodeMirror.keyMap.macDefault;
                    if (key.startsWith('Ctrl-')) {
                        this.options.extraKeys[key.replace('Ctrl-', 'Cmd-')] = event;
                    }                        
                    CodeMirror.commands[event] = window[event];
                }
            }
            else if (!HTMLCoderElement.reserved.has(attr) && !attr.toLowerCase().endsWith('text')) {
                this.options[attr.toCamel()] = textArea.getAttribute(attr).recognize();
            }                
        }
 
        this.#mirror = CodeMirror.fromTextArea(textArea, this.options);
        this.#frame = textArea.nextElementSibling;
        this.#frame.style.height = 'auto';

        if (this.rows > 0) {
            if (this.#mirror.lineCount() < this.rows) {
                this.#frame.style.height = (this.rows * 25 + 10) + 'px';
                this.#limited = true;
            }
            else {
                this.#frame.style.height = 'auto';
            }

            this.#mirror.on('keyup', function(cm, e) {
                if ((!e.ctrlKey && e.key == 'Enter') || e.key == 'Backspace' || e.key == 'Delete' || (e.ctrlKey && (e.key == 'v' || e.key == 'x'))) {
                    let coder = $s('#' + textArea.id);
                    if (cm.lineCount() == coder.rows) {
                        if (!coder.#limited) {
                            coder.#frame.style.height = (coder.rows * 25 + 10) + 'px';
                            coder.#limited = true;
                        }
                        else {
                            coder.#frame.style.height = 'auto';
                            coder.#limited = false;
                        }
                    }
                    else if (cm.lineCount() < coder.rows) {
                        if (!coder.#limited) {
                            coder.#frame.style.height = (coder.rows * 25 + 10) + 'px';
                            coder.#limited = true;
                        }
                    }
                    else if (cm.lineCount() > coder.rows) {
                        if (coder.#limited) {
                            coder.#frame.style.height = 'auto';
                            coder.#limited = false;
                        }
                    }
                }
            });

            this.#mirror.on('keydown', function(cm, e) {
                if (e.key == 'Enter') {
                    let coder = $coder(textArea.id);
                    if (cm.lineCount() == coder.rows) {
                        if (coder.#limited) {
                            coder.#frame.style.height = 'auto';
                            coder.#limited = false;
                        }
                    }
                }
            });
        }
    }

    #mode = null;
    #rows = null;
    #limited = false;
    #readOnly = null;
    #hintSpan = null;
    #mirror = null;
    #frame = null;

    get nodeName() {
        return 'CODER';
    }

    get tagName() {
        return 'CODER';
    }

    get name() {
        if (this.textArea.id == '') {
            if (this.textArea.name != '') {
                this.textArea.id = this.textArea.name;
            }
            else {
                this.textArea.id = 'Coder_' + String.shuffle(7);
            }            
        }
        if (this.textArea.name == '') {
            this.textArea.name = this.textArea.id;
        }
        
        return this.textArea.name;        
    }

    set name(name) {
        this.textArea.name = name;
        if (this.textArea.id == '') {
            this.textArea.id = name;
        }
    }

    get mode() {
        return this.#mode;
    }

    set mode(mode) {
        mode = mode.toLowerCase();
        this.#mode = mode;
        if (HTMLCoderElement.mineTypes[mode] != null) {
            mode = HTMLCoderElement.mineTypes[mode];
        }        
        this.#mirror.setOption('mode', mode);
    }

    get value() {
        return this.#mirror.getValue();
    }

    set value(value) {
        this.#mirror.setValue(value);
    }

    get code() {
        return this.value;
    }

    set code(code) {
        this.value = code;
    }

    get readOnly() {
        return this.#readOnly;
    }

    set readOnly(readOnly) {
        if (readOnly != 'nocursor' && typeof(readOnly) == 'string') {
            readOnly = readOnly.toBoolean();
        }
        if (readOnly == true || readOnly == 'nocursor') {
            this.#mirror.setOption('readOnly', true);
            this.#mirror.setOption('cursorBlinkRate', -1);
        }
        else {
            this.#mirror.setOption('readOnly', false);
            this.#mirror.setOption('cursorBlinkRate', 530);
        }
    }

    get rows() {
        return this.#rows;
    }

    set rows(rows) {
        this.#rows = rows;
        if (this.#mirror.lineCount() < rows) {
            this.#frame.style.height = (rows * 25 + 10) + 'px';
        }
        else {
            this.#frame.style.height = 'auto';
        }
    }

    get messageDuration() {
        return this.getAttribute('message-duration') ?? this.getAttribute('message');
    }
    
    set messageDuration(duration) {
        this.setAttribute('message-duration', duration);
    }

    get saveText() {
        return this.textArea.getAttribute('save-text') ?? '';
    }

    set saveText(text) {
        this.textArea.setAttribute('save-text', text);
    }

    get savingText() {
        return this.textArea.getAttribute('saving-text') ?? '';
    }

    set savingText(text) {
        this.textArea.setAttribute('saving-text', text);
    }
    
    get savedText() {
        return this.textArea.getAttribute('saved-text') ?? '';
    }

    set savedText(text) {
        this.textArea.setAttribute('saved-text', text);
    }
    
    get requiredText() {
        return this.textArea.getAttribute('required-text') ?? ''; //必填项，不能为空
    }

    set requiredText(text) {
        this.textArea.setAttribute('required-text', text);
    }
    
    get invalidText() {
        return this.textArea.getAttribute('invalid-text') ?? ''; //当输入值不能格式要求时，这里指 validator 验证
    }

    set invalidText(text) {
        this.textArea.setAttribute('invalid-text', text);
    }

    get validText() {
        return this.textArea.getAttribute('valid-text') ?? '';
    }

    set validText(text) {
        this.textArea.setAttribute('valid-text', text);
    }
    
    get successText() {
        return this.textArea.getAttribute('success-text') ?? this.savedText;
    }

    set successText(text) {
        this.textArea.setAttribute('success-text', text);
    }

    get failureText() {
        return this.textArea.getAttribute('failure-text') ?? ''; //后端验证失败后的提醒文字，如语法不正确
    }

    set failureText(text) {
        this.textArea.setAttribute('failure-text', text);
    }

    get exceptionText() {
        return this.textArea.getAttribute('exception-text') ?? '';
    }

    set exceptionText(text) {
        this.textArea.setAttribute('exception-text', text);
    }    

    get hintTextClass() {
        return this.textArea.getAttribute('hint-text-class') ?? 'span-hint';
    }

    set hintTextClass(className) {
        this.textArea.setAttribute('hint-text-class', className);
    }

    get errorTextClass() {
        return this.textArea.getAttribute('error-text-class') ?? 'span-error';
    }

    set errorTextClass(className) {
        this.textArea.setAttribute('error-text-class', className);
    }

    get validTextClass() {
        return this.textArea.getAttribute('valid-text-class') ?? 'span-valid';
    }

    set validTextClass(className) {
        this.textArea.setAttribute('valid-text-class', className);
    }

    get hidden() {
        return this.#frame.hidden;
    }

    set hidden(value) {
        this.#frame.hidden = value;
        this.#hintSpan.hidden = value;
    }

    set hintText(text) {
        if (this.messageDuration != null && window.Message != null) {
            window.Message.blue(text).hideLast().show(this.messageDuration.toFloat(0));
        }
        else {
            if (this.#hintSpan.style.display == 'none') {
                this.#hintSpan.style.display = '';
            }
            this.#hintSpan.innerHTML = text;
            this.#hintSpan.className = this.hintTextClass;
        }
    }

    set errorText(text) {
        if (this.messageDuration != null && window.Message != null) {
            window.Message.red(text).hideLast().show(this.messageDuration.toFloat(0));
        }
        else {
            if (this.#hintSpan.style.display == 'none') {
                this.#hintSpan.style.display = '';
            }
            this.#hintSpan.innerHTML = text;
            this.#hintSpan.className = this.errorTextClass;
        }
    }

    set correctText(text) {
        if (this.messageDuration != null && window.Message != null) {
            window.Message.green(text).hideLast().show(this.messageDuration.toFloat(0));
        }
        else {
            if (this.#hintSpan.style.display == 'none') {
                this.#hintSpan.style.display = '';
            }
            this.#hintSpan.innerHTML = text;
            this.#hintSpan.className = this.validTextClass;
        }
    }

    save() {
        HTMLCoderElement.save(this.#mirror);
    }

    clear() {
        this.value = '';
    }

    copy() {
        this.textArea.select();
        document.execCommand('Copy');
    }

   setOption (option, value) {
        this.options[option] = value;
        this.#mirror.setOption(option, value);
    }
    
    setAttribute(attr, value) {
        if (this[attr] != undefined) {
            this[attr] = value;
        }
        else if (this.options[attr] != undefined) {
            this.options[attr] = value;
            this.#mirror.setOption(attr, value);
        }
        else {
            this.textArea.setAttribute(attr, value);
        }
    }
    
    getAttribute(attr) {
        if (this[attr] != undefined) {
            return this[attr];
        }
        else if (this.options[attr] != undefined) {
            return this.options[attr];
        }
        else {
            return this.textArea.getAttribute(attr);
        }
    }
    
    set (property, value) {
        this.setAttribute(property, value);
        return this;
    }
    
    update (value) {
        this.value = value;
        return this;
    }

    initialize() {
        //save
        CodeMirror.commands[this.name + '-save'] = HTMLCoderElement.save;
        
        let coder = this;
        this.#mirror.on('change', function(cm) {
            coder.hintText = coder.saveText.$p(this);
        });        

        this.#mirror.on('focus', function(cm) {
            if (cm.getOption('readOnly') == false) {
                cm.setOption('cursorBlinkRate', 530);
            }

            coder.dispatch('onfocus');
        });
        this.#mirror.on('blur', function(cm) {
            cm.setOption('cursorBlinkRate', -1);
            HTMLCoderElement.save(cm);

            coder.dispatch('onblur');
        });

        this.#hintSpan = $create('DIV', { id: this.name + '_Hint', className: 'hintTextClass' }, 
                                       { marginTop: '-35px', padding: '5px 10px', textAlign: 'right', position: 'relative',
                                         borderRadius: '3px', fontSize: '0.625rem', display: 'none', 
                                         display: 'none', float: 'right' });
        this.#frame.insertAdjacentElement('afterEnd', this.#hintSpan)

        if (this.textArea.hasAttribute('hidden')) {
            this.#frame.hidden = true;    
        }
        this.textArea.setAttribute('hidden', 'always');
        this.textArea.hidden = true;
        this.#frame.id = this.name + '_Code';
        this.textArea.setAttribute('relative', `#${this.name}_Code,#${this.name}_Hint`);

        if (this.saveText != '') {
            this.hintText = this.saveText;
        }
        
        Event.interact(this, this.textArea);
    }
}

HTMLCustomElement.defineEvents(HTMLCoderElement.prototype, [
    'onsave',
    'onsave+',
    'onfocus',
    'onblur'
]);

HTMLCoderElement.reserved = new Set(['coder', 'class', 'mode', 'readonly', 'read-only', 'validator', "alternative"]);

HTMLCoderElement.mineTypes = {
    'sh': 'text/x-sh',
    'shell': 'text/x-sh',
    'xml': 'text/xml',
    'html': 'text/html',
    'css': 'text/css',
    'javascript': 'text/javascript',
    'json': 'application/json',
    'sql': 'text/x-pql',
    'pql': 'text/x-pql',
    'java': 'text/x-java',
    'scala': 'text/x-scala',
    'python': 'text/x-python',
    'csharp': 'text/x-csharp'
}

HTMLCoderElement.save = function(cm) {
    let coder = $s('#' + cm.getTextArea().id);

    let valid = 1;
    if (coder.value == '') {
        if (coder.requiredText != '') {
            coder.errorText = coder.requiredText.$p(this);
            valid = 0;
        }       
    }
    else if (coder.validator != '') {
        if (coder.mode == 'json') {
            let json = null;
            let value = coder.value.trim();
            
            try {
                json = JSON.parse(coder.value);
            }
            catch (e) {
                valid = -1;
                coder.errorText = e.message;
            }

            if (valid == 1) {
                if (coder.validator == 'array') {
                    if (!(value.startsWith('[') && value.endsWith(']') && json instanceof Array)) {
                        valid = 0;
                    }
                }
                else if (coder.validator == 'object') {
                    if (!(value.startsWith('{') && value.endsWith('}') && json instanceof Object)) {
                        valid = 0;
                    }
                }
                else if (coder.validator == 'object-array') {
                    if (!(value.startsWith('[') && value.endsWith(']') && json instanceof Array)) {
                        valid = 0;
                    }
                    else if (json.length > 0 && !(json[0] instanceof Object)) {
                        valid = 0;
                    }
                }
            }
        }

        if (valid == 1) {
            coder.correctText = coder.validText.$p(this);
        }
        else if (valid == 0) {
            coder.errorText = coder.invalidText.$p(this);
        }
    }

    if (valid == 1 && !coder.readOnly && coder.textArea.value != coder.value) {
        if (coder.dispatch('onsave')) {
            if (coder['onsave+'] != null) {
                if (coder['onsave+'].endsWith('=')) {
                    coder['onsave+'] = coder['onsave+'] + '{value}%';
                }
                coder.hintText = coder.savingText.$p(coder);
                $FIRE(coder, 'onsave+',
                    //data => { 使用匿名函数不能正确传递 this
                    function(data) {
                        this.textArea.value = this.value;
                        this.hintText = this.successText == '' ? this.savedText.$p(this, data) : this.successText.$p(this, data);
                    }, 
                    function(data) {
                        this.errorText = this.failureText.$p(this, data);
                    },
                    function(error) {
                        this.errorText = this.exceptionText == '' ? error : this.exceptionText.$p(this, { data: error, error: error });
                    });
            }
            else {
                coder.textArea.value = coder.value;
            }
        }
    }
}

HTMLCoderElement.initializeAll = function() {
    for (let textArea of document.querySelectorAll('textarea[coder]')) {
		new HTMLCoderElement(textArea).initialize();
    }
}

document.on('post', function() {
    HTMLCoderElement.initializeAll();
});