
$coder = function(name) {
    let coder = $t(name);
    if (coder != null && coder.tagName == 'CODER') {
        return coder;
    }
    else {
        return null;
    }
}

class Coder {
    constructor(textArea) {

        this.name = textArea.id;
        if (this.name == '') {
            this.name = 'Coder_' + document.components.size;
            textArea.id = this.name;
        }

        this.textArea = textArea;
        this.$readOnly = (textArea.getAttribute('read-only') || textArea.getAttribute('readOnly') || 'false');
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

        this.method = textArea.getAttribute('method') || 'GET';
        this.action = textArea.getAttribute('action') || '';
        this.data = textArea.getAttribute('data') || '';

        this.saveText = textArea.getAttribute('save-text') || '';
        this.updatingText = textArea.getAttribute('updating-text') || '';
        this.savedText = textArea.getAttribute('saved-text') || '';

        this.$mode = (textArea.getAttribute('mode') || 'pql').toLowerCase();
        if (Coder.mineTypes[this.$mode] != null) {
            this.options['mode'] = Coder.mineTypes[this.$mode];
        }
        else {
            this.options['mode'] = this.$mode;
        }

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
            else if (!Coder.reserved.has(attr)) {
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
        this.mirror.on('blur', Coder.save);
        CodeMirror.commands[this.name + '-save'] = Coder.save;
        if (this.saveText != '') {
            textArea.parentNode.appendChild($create('DIV', { id: this.name + '_SaveHint', innerHTML: this.saveText },
                                                           { marginTop: '-30px', padding: '5px 6px', textAlign: 'right', position: 'relative', borderRadius: '3px', fontSize: '12px', color: '#A0A0A0', display: 'none' },
                                                           { 'save-text': this.saveText, 'updating-text': this.updatingText, 'saved-text': this.savedText }));
            this.mirror.on('change', function(cm) {
                let div = $s('#' + cm.getTextArea().id + '_SaveHint');
                if (div.style.display == 'none') {
                    div.style.display = '';
                }
                if (div.innerHTML != div.getAttribute('save-text')) {
                    div.innerHTML = div.getAttribute('save-text');
                }
            });
        }

        this.mirror.on('focus', function(cm) {
            if (cm.getOption('readOnly') == false) {
                cm.setOption('cursorBlinkRate', 530);
            }            
        });
        this.mirror.on('blur', function(cm) {
            cm.setOption('cursorBlinkRate', -1);
        });
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
            this.frame.style.height = (rows * 25 + 6) + 'px';
        }
        else {
            this.frame.style.height = 'auto';
        }
    }
}

Coder.reserved = new Set(['coder', 'class', 'action', 'method', 'data', 'mode', 'readonly', 'read-only', 'save-text', 'updating-text', 'saved-text']);

Coder.mineTypes = {
    'sh': 'text/x-sh',
    'shell': 'text/x-sh',
    'xml': 'text/xml',
    'html': 'text/html',
    'css': 'text/css',
    'javascript': 'text/javascript',
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

//事件
Coder.prototype.onsave = null;

Coder.save = function(cm) {
    let coder = $coder(cm.getTextArea().id);
    if (!coder.readOnly && coder.textArea.value != coder.value) {
        if (Event.execute(coder.name, 'onsave')) {
            if (coder.action != '') {
                $ajax(coder.method, coder.action, coder.data)
                    .parseDataURL(coder.textArea, coder.value)
                    .send(
                        function(url, data) {
                            $x('#' + coder.name + '_SaveHint').html(coder.updatingText);
                        }
                    )
                    .complete(
                        function(req) {
                            
                        })
                    .error(
                        function (status, statusText) {
                            
                        })
                    .success(
                        function (result) {
                            coder.textArea.value = coder.value;
                            $x('#' + coder.name + '_SaveHint').html(coder.savedText);
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

Coder.initializeAll = function() {
    for (let textArea of document.querySelectorAll('textarea[coder]')) {
		new Coder(textArea);
	}
}

$finish(function() {
    Coder.initializeAll();
});