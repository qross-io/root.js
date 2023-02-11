
HTMLTextAreaElement.prototype.cursor = 0;

$enhance(HTMLTextAreaElement.prototype)
    .defineEvents('onmatch')
    .defineProperties({

        'readonly': {
            get() {
                return $parseBoolean(this.getAttribute('readonly'), false, this);
            },
            set(readonly) {
                if (typeof(readonly) != 'boolean') {
                    readonly = $parseBoolean(readonly, true, this);
                }

                if (readonly) {
                    this.setAttribute('readonly', '');
                }
                else {
                    this.removeAttribute('readonly');
                }
            }
        },
        'disabled': {
            get() {
                return $parseBoolean(this.getAttribute('disabled'), false, this);
            },
            set(disabled) {
                if (typeof(disabled) != 'boolean') {
                    disabled = $parseBoolean(disabled, false, this);
                }

                if (disabled) {
                    this.setAttribute('disabled', '');
                }
                else {
                    this.removeAttribute('disabled');
                }
            }
        },
        'enabled': {
            get () {                
                return !this.disabled;
            },
            set (enabled) {
                if (typeof(enabled) != 'boolean') {
                    enabled = $parseBoolean(enabled, true, this);
                }
                this.disabled = !enabled;
            }
        },
        'selection': {
            get() {
                if (this.selectionStart != this.selectionEnd) {
                    return this.value.substring(this.selectionStart, this.selectionEnd);
                }
                else {
                    return '';
                }
            },
            set(text) {
                let index = this.value.indexOf(text);
                if (index > -1) {
                    this.selectRange(index, index + text.length);
                }
            }
        },
        'status': {
            get () {
                return this._status;
            },
            set (value) {                
                if (value != this._status) {
                    if (HTMLTextAreaElement.setterX.has('status')) {
                        NativeElement.executeAopFunction(this, HTMLTextAreaElement.setterX.get('status'), value);                        
                    }
                    this._status = value;
                }                
            }
        },
        'relations': {
            get() {
                if (this._relations == null) {
                    this._relations = new Set();
                }
                return this._relations;
            }
        }
    });

HTMLTextAreaElement.STATUS = {
    "FILLED": 3, //有值初始状态
    "VALUELESS": 2, //无值初始状态
    "VALID": 1, //正确的
    "EMPTY": 0, //空值
    "INCORRECT": -1 //错误的值
};

HTMLTextAreaElement.prototype._status = HTMLTextAreaElement.STATUS.VALUELESS; //无值初始状态
HTMLTextAreaElement.prototype._relations = null;

HTMLTextAreaElement.prototype.find = function(strOrRegex, reset = false) {
    if (typeof(strOrRegex) == 'string' || !strOrRegex.global) {
        strOrRegex = new RegExp(strOrRegex, 'g');
    }
    if (reset) {
        this.cursor = 0;
    }
    if (strOrRegex instanceof RegExp) {
        strOrRegex.lastIndex = this.cursor;
        let m = strOrRegex.exec(this.value);
        if (m != null) {
            this.selectRange(m.index, strOrRegex.lastIndex);
            this.cursor = strOrRegex.lastIndex;                        
        }
        else {
            this.selectRange(0, 0);
            this.cursor = 0;
        }

        this.dispatch('onmatch', { matched: this.cursor != 0 });
    }
    
    return this;
}

HTMLTextAreaElement.prototype.findAll = function(strOrRegex) {
    let result = [];
    if (typeof(strOrRegex) == 'string' || !strOrRegex.global) {
        strOrRegex = new RegExp(strOrRegex, 'g');
    }
    if (strOrRegex instanceof RegExp) {
        let m = null;
        do {
            m = strOrRegex.exec(this.value);            
            if (m != null) {
                result.push({
                    group: [...m],
                    start: m.index,
                    end: m.index + m[0].length
                });
            }
        }
        while (m != null)
    }

    if (result.length > 0) {
        this.selectRange(result[0].index, result[0].lastIndex);

        this.dispatch('onmatch', { matched: true });
    }

    return result;
}

HTMLTextAreaElement.prototype.selectRange = function(beginPosition, endPosition) {
    this.focus();
    this.setSelectionRange(beginPosition, endPosition);
    this.scrollToSelection();
}

HTMLTextAreaElement.prototype.setCursorPosition = function(position) {
    this.selectRange(position, position);    
}

HTMLTextAreaElement.prototype.scrollToSelection = function() {
    if (this.selectionEnd > this.selectionStart) {
        let totalLines = this.value.match(/\n/g)?.length ?? 0 + 1;
        let lineHeight = this.scrollHeight / totalLines;
        let currentLines = this.value.take(this.selectionStart).match(/\n/g)?.length ?? 0 + 1;
        this.scrollTop = lineHeight * (currentLines - 3);
    }
    else {
        this.scrollTop = 0;
    }
}

HTMLTextAreaElement.prototype.replace = function(strOrRegex, replacement) {
    this.value = this.value.replace(strOrRegex, replacement);
}

HTMLTextAreaElement.prototype.replaceAll = function(strOrRegex, replacement) {
    this.value = this.value.replaceAll(strOrRegex, replacement);
}

HTMLTextAreaElement.prototype.initialize = function() {
    
    if (this.value != '') {
        this._status = HTMLTextAreaElement.STATUS.FILLED; //有值初始状态
        if (this.required) {
            this.status = HTMLTextAreaElement.STATUS.VALID;
        }
    }

    this.on('input,change', function(ev) {
        if (this.required) {
            this.status = this.value != '' ? HTMLTextAreaElement.STATUS.VALID : HTMLTextAreaElement.STATUS.EMPTY;
        }        
    });

    if (this.hasAttribute('readonly')) {
        this.readonly = this.getAttribute('readonly');
    }

    if (this.hasAttribute('disabled')) {
        this.disabled = this.getAttribute('disabled');
    }
    else if (this.hasAttribute('enabled')) {
        this.enabled = this.getAttribute('enabled');
    }
}

HTMLTextAreaElement.initializeAll = function(container) {
    (container ?? document).querySelectorAll('TEXTAREA').forEach(textarea => {
        if (!textarea.hasAttribute('root-textarea')) {
            textarea.setAttribute('root-textarea', '');
            
            HTMLElement.boostPropertyValue(textarea);
            
            textarea.initialize();

            Event.interact(textarea);
        }
    });
}

document.on('post', function() {
    HTMLTextAreaElement.initializeAll();    
});