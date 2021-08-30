class Coder {
    constructor(textArea) {

        this.name = textArea.id;
        if (this.name == '') {
            this.name = 'Coder_' + document.components.size;
            textArea.id = this.name;
        }

        this.textArea = textArea;
        this.$readOnly = textArea.getAttribute('readonly') ?? textArea.getAttribute('read-only') ?? 'false';
        if (this.$readOnly != 'nocursor') {
            this.$readOnly = this.$readOnly.toBoolean(false, this);
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
        this['onsave+'] = textArea.getAttribute('onsave+'); //服务器端事件
        this['onsave+success'] = textArea.getAttribute('onsave+success');
        this['onsave+failure'] = textArea.getAttribute('onsave+failure');
        this['onsave+exception'] = textArea.getAttribute('onsave+exception');
        this['onsave+completion'] = textArea.getAttribute('onsave+completion');
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
            else {
                this.frame.style.height = 'auto';
            }

            this.mirror.on('keyup', function(cm, e) {
                if ((!e.ctrlKey && e.key == 'Enter') || e.key == 'Backspace' || e.key == 'Delete' || (e.ctrlKey && (e.key == 'v' || e.key == 'x'))) {
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
        this.nodeType = 0;
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
        this.frame.insertAdjacentElement('afterEnd', this.hintSpan)

        if (textArea.hidden) {
            this.frame.hidden = true;    
        }
        textArea.setAttribute('hidden', 'always');
        textArea.hidden = true;
        this.frame.id = this.name + '_Code';
        textArea.setAttribute('relative', `#${this.name}_Code,#${this.name}_Hint`);

        if (this.saveText != '') {
            this.hintText = this.saveText;
        }
        
        Event.interact(this, textArea);
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
        this.mirror.setValue(value);
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
            this.frame.style.height = (rows * 25 + 10) + 'px';
        }
        else {
            this.frame.style.height = 'auto';
        }
    }

    get hidden() {
        return this.frame.hidden;
    }

    set hidden(value) {
        this.frame.hidden = value;
        this.hintSpan.hidden = value;
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

Coder.reserved = new Set(['coder', 'class', 'mode', 'readonly', 'read-only', 'validator', "alternative"]);

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
    Event.bind(this, eventName, func);
    return this;
}

Coder.prototype.save = function() {
    Coder.save(this.mirror);
}

Coder.prototype.clear = function() {
    this.value = '';
}

Coder.prototype.copy = function() {
    this.textArea.select();
    document.execCommand('Copy');
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
        if (Event.execute(coder.name, 'onsave')) {
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
                        this.errorText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
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

Coder.prototype.setAttribute = function(attr, value) {
    if (this[attr] != undefined) {
        this[attr] = value;
    }
    else if (this.options[attr] != undefined) {
        this.options[attr] = value;
        this.mirror.setOption(attr, value);
    }
    else {
        this.textArea.setAttribute(attr, value);
    }
}

Coder.prototype.getAttribute = function(attr) {
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

Coder.prototype.set = function(property, value) {
    this.setAttribute(property, value);
}

Coder.prototype.update = function(value) {
    this.value = value;
}

Coder.initializeAll = function() {
    for (let textArea of document.querySelectorAll('textarea[coder]')) {
		new Coder(textArea);
    }
}

document.on('post', function() {
    Coder.initializeAll();
});