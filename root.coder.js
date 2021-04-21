class Coder {
    constructor(textArea) {

        this.name = textArea.id;
        if (this.name == '') {
            this.name = 'Coder_' + document.components.size;
            textArea.id = this.name;
        }

        this.textArea = textArea;
        this.$readOnly = (textArea.getAttribute('readOnly') || textArea.getAttribute('read-only') || 'false');
        if (this.$readOnly != 'nocursor') {
            this.$readOnly = this.$readOnly.toBoolean();
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
        this.$rows = 0;
        this.limited = false;
        
        this.onsave = textArea.getAttribute('onsave'); //客户端事件
        this['onsave+'] = textArea.getAttribute('onsave+') || textArea.getAttribute('action') || ''; //服务器端事件
        this.onfocus = textArea.getAttribute('onfocus');
        this.onblur = textArea.getAttribute('onblur');


        this.saveText = textArea.getAttribute('save-text') || textArea.getAttribute('saveText') || '';
        this.savingText = textArea.getAttribute('saving-text') || textArea.getAttribute('savingText') || '';
        this.savedText = textArea.getAttribute('saved-text') || textArea.getAttribute('savedText') || '';
        this.requiredText = textArea.getAttribute('required-text') || textArea.getAttribute('requiredText') || ''; //必填项，不能为空
        this.invalidText = textArea.getAttribute('invalid-text') || textArea.getAttribute('invalidText') || ''; //当输入值不能格式要求时，这里指 validator 验证        
        this.validText = textArea.getAttribute('valid-text') || textArea.getAttribute('validText') || '';
        this.successText = textArea.getAttribute('success-text') || textArea.getAttribute('successText') || this.savedText;
        this.failureText = textArea.getAttribute('failure-text') || textArea.getAttribute('failureText') || ''; //后端验证失败后的提醒文字，如语法不正确
        this.exceptionText = textArea.getAttribute('exception-text') || textArea.getAttribute('exceptionText') || '';

        this.hintTextClass = 'span-hint';
        this.errorTextClass = 'span-error';
        this.validTextClass = 'span-valid';

        this.$mode = (textArea.getAttribute('mode') || textArea.getAttribute('coder') || 'pql').toLowerCase();
        if (Coder.mineTypes[this.$mode] != null) {
            this.options['mode'] = Coder.mineTypes[this.$mode];
        }
        else {
            this.options['mode'] = this.$mode;
        }

        //预设的验证器  array/object/object-array
        this.validator = textArea.getAttribute('validator') || '';

        for (let attr of textArea.getAttributeNames()) {
            if (attr == 'rows') {                
                this.$rows = textArea.rows;
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
            else if (!Coder.reserved.has(attr) && !attr.toLowerCase().endsWith('text')) {
                this.options[attr.toCamel()] = textArea.getAttribute(attr).recognize();
            }                
        }
 
        this.mirror = CodeMirror.fromTextArea(textArea, this.options);
        this.frame = textArea.nextElementSibling;
        this.frame.style.height = 'auto';

        if (this.rows > 0) {
            if (this.mirror.lineCount() < this.rows) {
                this.frame.style.height = (this.rows * 25 + 10) + 'px';
                this.limited = true;
            }

            this.mirror.on('keyup', function(cm, e) {
                if (e.key == 'Backspace' || e.key == 'Delete') {                    
                    let coder = $coder(textArea.id);                   
                    if (cm.lineCount() == coder.rows) {
                        if (!coder.limited) {
                            coder.frame.style.height = (coder.rows * 25 + 10) + 'px';
                            coder.limited = true;
                        }
                        else {
                            coder.frame.style.height = 'auto';
                            coder.limited = false;
                        }
                    }
                    else if (cm.lineCount() < coder.rows) {
                        if (!coder.limited) {
                            coder.frame.style.height = (coder.rows * 25 + 10) + 'px';
                            coder.limited = true;
                        }
                    }
                    else if (cm.lineCount() > coder.rows) {
                        if (coder.limited) {
                            coder.frame.style.height = 'auto';
                            coder.limited = false;
                        }
                    }
                }
            });

            this.mirror.on('keydown', function(cm, e) {
                if (e.key == 'Enter') {
                    let coder = $coder(textArea.id);
                    if (cm.lineCount() == coder.rows) {
                        if (coder.limited) {
                            coder.frame.style.height = 'auto';
                            coder.limited = false;
                        }
                    }
                }
            });
        }

        this.nodeName = 'CODER';
        this.tagName = 'CODER';
        document.tags.add('CODER');
        document.components.set(this.name, this);

        //save
        CodeMirror.commands[this.name + '-save'] = Coder.save;
        
        let coder = this;
        this.mirror.on('change', function(cm) {
            coder.hintText = coder.saveText.$p(this);
        });        

        this.mirror.on('focus', function(cm) {
            if (cm.getOption('readOnly') == false) {
                cm.setOption('cursorBlinkRate', 530);
            }

            Event.execute(coder.name, 'onfocus');
        });
        this.mirror.on('blur', function(cm) {
            cm.setOption('cursorBlinkRate', -1);
            Coder.save(cm);

            Event.execute(coder.name, 'onblur');
        });

        this.hintSpan = $create('DIV', { id: this.name + '_Hint', className: 'hintTextClass' }, 
                                       { marginTop: '-35px', padding: '5px 10px', textAlign: 'right', position: 'relative',
                                         borderRadius: '3px', fontSize: '0.625rem', display: 'none', 
                                         display: 'none', float: 'right' });
        $x(textArea.nextElementSibling).insertBehind(this.hintSpan);
        textArea.setAttribute('hidden', 'always');
        textArea.nextElementSibling.id = this.name + '_Code';
        textArea.setAttribute('relative', `#${this.name}_Code,#${this.name}_Hint`);

        if (this.saveText != '') {
            this.hintText = this.saveText;
        }
    }

    get mode() {
        return this.$mode;
    }

    set mode(mode) {
        mode = mode.toLowerCase();
        this.$mode = mode;
        if (Coder.mineTypes[mode] != null) {
            mode = Coder.mineTypes[mode];
        }        
        this.mirror.setOption('mode', mode);
    }

    get value() {
        return this.mirror.getValue();
    }

    set value(value) {
        this.mirror.setValue( value);
    }

    get readOnly() {
        return this.$readOnly;
    }

    set readOnly(readOnly) {
        if (readOnly != 'nocursor' && typeof(readOnly) == 'string') {
            readOnly = readOnly.toBoolean();
        }
        if (readOnly == true || readOnly == 'nocursor') {
            this.mirror.setOption('readOnly', true);
            this.mirror.setOption('cursorBlinkRate', -1);
        }
        else {
            this.mirror.setOption('readOnly', false);
            this.mirror.setOption('cursorBlinkRate', 530);
        }
    }

    get rows() {
        return this.$rows;
    }

    set rows(rows) {
        this.$rows = rows;
        if (this.mirror.lineCount() < rows) {
            this.frame.style.height = (rows * 25 + 6) + 'px';
        }
        else {
            this.frame.style.height = 'auto';
        }
    }

    set hintText(text) {
        if (this.hintSpan.style.display == 'none') {
            this.hintSpan.style.display = '';
        }
        this.hintSpan.innerHTML = text;
        this.hintSpan.className = this.hintTextClass;
    }

    set errorText(text) {
        if (this.hintSpan.style.display == 'none') {
            this.hintSpan.style.display = '';
        }
        this.hintSpan.innerHTML = text;
        this.hintSpan.className = this.errorTextClass;
    }

    set correctText(text) {
        if (this.hintSpan.style.display == 'none') {
            this.hintSpan.style.display = '';
        }
        this.hintSpan.innerHTML = text;
        this.hintSpan.className = this.validTextClass;
    }
}

$coder = function(name) {
    let coder = $t(name);
    if (coder != null && coder.tagName == 'CODER') {
        return coder;
    }
    else {
        return null;
    }
}

Coder.reserved = new Set(['coder', 'class', 'mode', 'readonly', 'read-only', 'validator']);

Coder.mineTypes = {
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

Coder.prototype.on = function(eventName, func) {
    Event.bind(this.name, eventName, func);
    return this;
}

Coder.save = function(cm) {
    let coder = $coder(cm.getTextArea().id);

    let valid = 1;
    if (coder.value == '') {
        if (coder.requiredText != '') {
            coder.errorText = coder.requiredText.$p(this);
            valid = 0;
        }       
    }
    else {
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
        if (Event.execute(coder.name, 'onsave')) {
            if (coder['onsave+'] != '') {
                coder.hintText = coder.savingText.$p(coder, data);
                $FIRE(coder, 'save', coder['onsave+'],
                    data => {
                        this.textArea.value = this.value;
                        this.hintText = this.successText == '' ? this.savedText.$p(this, data) : this.successText.$p(this, data);
                    }, 
                    data => {
                        this.errorText = this.failureText.$p(this, data);
                    },
                    error => {
                        this.errorText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
                    },
                    function() {

                    });
                $cogo(coder.saveAction + (coder.saveAction.endsWith('=') ? '{value}%' : ''), coder.textArea, coder)
                    .then(data => {
                        
                    });                
            }
            else {
                coder.textArea.value = coder.value;
            }
        }
    }
}

Coder.prototype.setOption = function(option, value) {
    this.options[option] = value;
    this.mirror.setOption(option, value);
}

Coder.prototype.show = function(visible = true) {
    if (visible) {
        this.textArea.nextElementSibling.style.display = '';
        this.textArea.setAttribute('visible', '');
        this.textArea.removeAttribute('hidden');
        this.hintSpan.style.display = '';
        this.hintSpan.setAttribute('visible', '');
        this.hintSpan.removeAttribute('hidden');
    }
    else {
        this.hide();
    }
}

Coder.prototype.hide = function() {
    this.textArea.nextElementSibling.style.display = 'none';
    this.textArea.setAttribute('hidden', '');
    this.textArea.removeAttribute('visible');
    this.hintSpan.style.display = 'none';
    this.hintSpan.setAttribute('hidden', '');
    this.hintSpan.removeAttribute('visible');
}

Coder.initializeAll = function() {
    for (let textArea of document.querySelectorAll('textarea[coder]')) {
		new Coder(textArea);
	}
}

$finish(function() {
    Coder.initializeAll();
});