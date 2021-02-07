//-----------------------------------------------------------------------
// www.qross.io
//-----------------------------------------------------------------------
// root.editor.js
// Realtime text editing on page. 


Editor = function(elementOrSettings) {

    $initialize(this)
        .with(elementOrSettings)
        .declare({
            //显示TreeView的元素ID
            name: 'Editor_' + document.components.size,
            editable: true,
            imagesBaseUrl: function(imagesBaseUrl) {
                if (imagesBaseUrl == null) {
                    imagesBaseUrl = '';
                }
                if (imagesBaseUrl == '') {
                    if (this.tag != null && this.tag.nodeName == 'COL') {
                        imagesBaseUrl = this.tag.parentNode.parentNode.getAttribute('imagesBaseUrl') || '';
                    }
            
                    if (imagesBaseUrl == '') {
                        imagesBaseUrl = $root.home + "images/";
                    }
                }
                return imagesBaseUrl;
            },
            dataType: function(dataType) {
                dataType = dataType == null ? 'TEXT' : dataType.toUpperCase();
                if (!/^(TEXT|TEXTAREA|LINKTEXT|INTEGER|DECIMAL|PERCENT|SELECT|CHECKBOX|CHECKBUTTON|SWITCH|SWITCHBUTTON|STAR|STARBUTTON)$/.test(dataType)) {
                    dataType = 'TEXT';
                }
                return dataType;
            },
            /// <value type="String">处理用户输入字符串的url地址(如 handle?id=1&text= 或 handle?id={0}&text=), 支持占位符{attr}(元素的属性名, 取到元素的属性值)、{n}(如果绑定元素是td, 数字序号代码同行中的单元格式序号, 可取到对应单元格内的元素)占位符</value>
            action: '',

            allowEmpty: true,
            validator: function(validator) {
                if (typeof (validator) == 'string' && validator != '') {
                    return new RegExp(validator);
                }
                else {
                    return '';
                }
            },
            kilo: false,
            autoScaling: false,
            placeHolder: '',

            //switch - [yes,no]
            //select - { text: value, text: value, text: value }  | #select
            //switchbutton - [ {text: 'enabled', value: 'yes', class: 'new'}, {text: 'enabled', value: 'yes', class: 'old'} ]
            //starbutton - [ {text: 'enabled', value: 'yes', enabledClass: 'new1', disabledClass: 'old' }, { text: 'enabled', value: 'yes', class: 'new2' }, ... ]
            options: function(options) {
                switch(this.dataType) {
                    case 'SELECT':
                        if (typeof(options) == 'string') {
                            if (options.includes('&')) {
                                return options.toMap('&', '=');
                            }
                            else if (options.isObjectString()) {
                                return Json.eval(options)                                
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
                    case 'SWITCH':
                        if (typeof(options) == 'string') {
                            if (options.isArrayString()) {
                                return Json.eval(options);
                            }
                            else {
                                return options.$trim('{', '}').toArray(',');
                            }
                        }
                        else if (options == null) {
                            return ['yes', 'no'];
                        }
                        else {
                            return options;
                        }
                    case 'SWITCHBUTTON':
                        if (typeof(options) == 'string') {
                            return Json.eval(options);
                        }
                        else if (options == null) {
                            return [{ text: 'Enabled', value: 'yes' }, { text: 'Disabled', value: 'no' }];
                        }
                        else {
                            return options;
                        }
                    case 'CHECKBUTTON':
                        if (typeof(options) == 'string') {
                            return Json.eval(options);
                        }
                        else {
                            return options;
                        }
                    case 'CHECKBOX':
                        if (typeof(options) == 'string') {
                            if (options.isArrayString()) {
                                return Json.eval(options);
                            }
                            else {
                                return options.$trim('{', '}').toArray(',');
                            }
                        }
                        else if (options == null) {
                            return ['yes', 'no'];
                        }
                        else {
                            return options;
                        }
                    case 'STARBUTTON':
                        if (typeof(options) == 'string') {
                            return Json.eval(options);
                        }
                        else {
                            return options;
                        }
                    default:
                        return null;
                }                
            },

            
            maxValue: function(maxValue) {
                return maxValue == null ? '' : $parseInt(maxValue, 0);
            },
            minValue: function(minValue) {
                if (minValue == null) {
                    return this.allowEmpty ? '' : 0;
                }
                else {
                    return $parseInt(minValue, 0);
                }
            },
            maxLength: function(maxLength) {
                maxLength = $parseInt(maxLength, 0);
                if (this.maxValue != '' && maxLength == 0) {
                    maxLength = this.maxValue.toString().length;
                }
                return maxLength;
            },
            minLength: function(minLength) {
                minLength = $parseInt(minLength, this.allowEmpty ? 0 : 1);
                if (this.minValue != '' && this.minLength == 0) {
                    minLength = this.minValue.toString().length;
                }
                return minLength;
            },
            //switch only
            theme: function(theme) {
                return theme == null ? 'switch' : theme.toLowerCase();
            },
            //star only
            pcs: 5,
            //star & switch only
            zoom: 16,

            editOn: 'dblclick',
            selector: '',

            inputClass: '', //文本框样式
            selectClass: '' //选择框样式
        })
        .elementify(element => {
            element.setAttribute('root', 'EDITOR');
            this.tag = element;
        });
}

$editor = function(name) {
    let editor = $t(name);
    if (editor != null && editor.tagName == 'EDITOR') {
        return editor;
    }
    else {
        return null;
    }
}

//保存配置的元素
Editor.prototype.tag = null;
//正在编辑的元素
Editor.prototype.element = null;
//所有可以编辑的元素
Editor.prototype.elements = null;
//已绑定的可编辑元素
Editor.prototype.bindings = new Set();

/// <value type="String|Function">开始编辑之前触发, 支持return</value>
Editor.prototype.onedit = function(element, ev) { };
/// <value type="String|Function">取消之前触发，支持return</value>
Editor.prototype.oncancel = function(ev) { };
/// <value type="String|Function">当值为空时触发, 不支持return</value>
Editor.prototype.onempty = function(ev) { };
/// <value type="String|Function">验证失败时触发, 不支持return</value>
Editor.prototype.onfail = function(value) { };
/// <value type="String|Function">更新之前触发, 支持return</value>
Editor.prototype.onupdate = function(value) { };
/// <value type="String|Function">更新时发生错误触发, 不支持return</value>
Editor.prototype.onerror = function(error) { };
/// <value type="String|Function">更新完成之后触发, 支持return</value>
Editor.prototype.onfinish = function(result, value) { };
/// <value type="String|Function">所有工作完成之后触发</value>
Editor.prototype.oncomplete = function(value) { };

/// <value type="Boolean">是否正在编辑</value>
Editor.prototype.editing = false;
/// <value type="Boolean">是否正在更新</value>
Editor.prototype.updating = false;

String.prototype.$parseDataURL = function(text = '', value = '') {
    
    let url = this.toString();
    
    if (value == '') {
        value = text;
    }

    url = url.replace(/\{text\}/ig, encodeURIComponent(text));
    url = url.replace(/\{value\}/ig, encodeURIComponent(value));

    if (url.endsWith('=')) {
        url += encodeURIComponent(value);
    }

    return url;
}

Editor.prototype.apply = function(...elements) {

    if (elements != null && elements.length > 0) {
        this.elements = elements.length == 1 ? elements[0] : elements;
    }

    this.bindings.clear(); //每次apply都重新获取可编辑元素
    if (typeof (this.elements) == 'string') {
        $a(this.elements).forEach(element => this.bindings.add(element));
    }
    else  if (this.elements instanceof Array) {
        this.elements.forEach(element => {
            if (typeof(element) == 'string') {
                this.bindings.add($s(element));
            }
            else {
                this.bindings.add(element);
            }
        });
    }
    else {
        this.bindings.add(this.elements);
    }

    if (this.bindings.length == 0) {
        console.warn('no element to apply editor, please check "elements" property.');
    }

    this.bindings.forEach(binding => {
        if (this.selector != '') {
            binding = binding.querySelector(this.selector);
        }
        if (binding != null && binding.getAttribute('editor-bound') == null) {
            Editor[this.dataType](this, binding);
            binding.setAttribute('editor-bound', 'yes');
        }
    });    

    return this;
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

Editor['TEXT'] = function (editor, element) {
    //trim
    element.innerHTML = element.textContent.trim();
    if (element.innerHTML == '') { 
        editor.setPlaceHolder(element);
    }

    //bind event
    $x(element).bind(editor.editOn, function (ev) {
        //edit
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {

            editor.editing = true;
            editor.element = element;
            
            let before = element.querySelector('SPAN[sign=placeholder]') == null ? element.textContent : '';
            let textBox = $create('INPUT', { type: 'text', value: before, defaultValue: before, className: editor.inputClass });
            if (editor.maxLength > 0) {
                textBox.maxLength = editor.maxLength;
            }

            //添加事件不支持return，只能直接指定
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
            }

            textBox.onblur = function (ev) {
                if (this.value != this.defaultValue) {
                    let after = this.value;
                    if (after == '') {
                        editor.execute('onempty', ev);
                        if (!editor.allowEmpty) {
                            this.focus();
                            return false;
                        }                        
                    }         
                    if ((!editor.allowEmpty && after == '') || (after != '' && editor.validator != '' && !editor.validator.test(after)) || (editor.minLength > 0 && after.length < editor.minLength)) {
                        editor.execute('onfail', after, ev);
                        this.focus();
                        return false;                        
                    }
                    
                    if (editor.editing && editor.execute('onupdate', after, ev)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    //finish
                                    if (editor.execute('onfinish', result, after, ev)) {
                                        if (after == '') {
                                            editor.setPlaceHolder(element);
                                        }
                                        else {
                                            element.innerHTML = after;
                                        }
                                    }
                                    else {
                                        element.innerHTML = before;
                                    }
                                    editor.execute('oncomplete', after, ev);
                                })
                                .catch(error => {
                                    editor.execute('onerror', error);
                                    textBox.disabled = false;
                                    textBox.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
                                });

                            this.updating = true;
                        }
                        else {
                            //needn't updating, but will update display text  
                            if (after == '') {
                                editor.setPlaceHolder(element);
                            }
                            else {
                                element.innerHTML = '';
                                element.innerHTML = after;
                            }

                            editor.execute('oncomplete', after, ev);

                            editor.editing = false;
                            editor.element = null;
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
                            element.innerHTML = this.defaultValue;
                        }
                        editor.editing = false;
                        editor.element = null;
                    }
                }
            }

            textBox.size = textBox.value.$length(3) + 2;
            textBox.onkeyup = function (ev) {
                this.size = this.value.$length(3) + 2;
            }

            element.innerHTML = '';
            element.appendChild(textBox);

            textBox.focus();
        }
    });
}

Editor['TEXTAREA'] = function (editor, element) {

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
            editor.element = element;

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
                    
                    if (editor.editing && editor.execute('onupdate', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    //finish
                                    if (editor.execute('onfinish', data, after)) {
                                        if (after == '') {
                                            editor.setPlaceHolder(element);
                                        }
                                        else {
                                            element.innerHTML = textToHtml(after);
                                        }

                                        editor.execute('oncomplete', after);
                                    }
                                    else {
                                        textArea.disabled = false;
                                        textArea.focus();
                                    }
                                })
                                .catch(error => {
                                    editor.execute('onerror', error);
                                    textArea.disabled = false;
                                    textArea.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
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

                            editor.execute('oncomplete', after);

                            editor.editing = false;
                            editor.element = null;
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
                        editor.element = null;
                    }
                }
            }

            element.innerHTML = '';
            element.appendChild(textArea);

            textArea.focus();
        }
    });
}

Editor['INTEGER'] = function (editor, element) {

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
            editor.element = element;

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

                    if (editor.editing && editor.execute('onupdate', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    if (editor.execute('onfinish', data, after)) {
                                        element.innerHTML = (editor.kilo ? after.kilo() : after);
                                        if (element.innerHTML == '') { 
                                            editor.setPlaceHolder(element);
                                        }

                                        editor.execute('oncomplete', after);
                                    }
                                    else {
                                        textBox.disabled = false;
                                        textBox.focus();
                                    }
                                })
                                .catch(error => {
                                    editor.execute('onerror', error);
                                    textBox.disable = true;
                                    textBox.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
                                });
                            
                            this.updating = true;
                        }
                        else {
                            element.innerHTML = editor.kilo ? after.kilo() : after;
                            if (element.innerHTML == '') { 
                                editor.setPlaceHolder(element);
                            }

                            editor.execute('oncomplete', after);

                            editor.editing = false;
                            editor.element = null;
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
                        editor.element = null;
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

Editor['DECIMAL'] = function (editor, element) {

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
            editor.element = element;

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
                    
                    if (editor.editing && editor.execute('onupdate', after)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    if (editor.execute('onfinish', data, after)) {
                                        element.innerHTML = (editor.kilo ? after.kilo() : after);
                                        if (element.innerHTML == '') { 
                                            editor.setPlaceHolder(element);
                                        }

                                        editor.execute('oncomplete', after);
                                    }
                                    else {
                                        textBox.disabled = false;
                                        textBox.focus();
                                    }
                                })
                                .catch(error => {
                                    editor.execute('onerror', error);
                                    textBox.disable = true;
                                    textBox.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
                                });                            

                            this.updating = true;
                        }
                        else {
                            element.innerHTML = editor.kilo ? after.kilo() : after;
                            if (element.innerHTML == '') { 
                                editor.setPlaceHolder(element);
                            }

                            editor.execute('oncomplete', after);

                            editor.editing = false;
                            editor.element = null;
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
                        editor.element = null;
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

Editor['PERCENT'] = function (editor, element) {

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
            editor.element = element;

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

                    if (editor.editing && editor.execute('onupdate', afterText)) {
                        //update
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    if (editor.execute('onfinish', data, afterValue)) {
                                        element.innerHTML = (editor.kilo ? afterText.kilo() : afterText) + '%';

                                        editor.execute('oncomplete', afterText);
                                    }
                                    else {
                                        textBox.disabled = false;
                                        textBox.focus();
                                    }
                                })
                                .catch(error => {
                                    editor.execute('onerror', error);
                                    textBox.disable = true;
                                    textBox.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
                                });                            

                            this.updating = true;
                        }
                        else {
                            element.innerHTML = (editor.kilo ? afterText.kilo() : afterText) + '%';

                            editor.execute('oncomplete', afterText);

                            editor.editing = false;
                            editor.element = null;
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
                        editor.element = null;
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

Editor['SELECT'] = function (editor, element) {

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
                editor.element = element;

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
                    if (editor.editing && editor.execute('onupdate', afterValue, element)) {
                        if (editor.action != '') {
                            this.disabled = true;
                            $cogo(editor.action.$parseDataURL(after), element)
                                .then(data => {
                                    if (editor.execute('onfinish', data, afterValue, element)) {
                                        element.setAttribute('value', afterValue);
                                        element.innerHTML = ''; //must set empty first
                                        element.innerHTML = afterText;

                                        editor.execute('oncomplete', afterValue, element);
                                    }
                                    else {
                                        select.disabled = false;
                                        select.focus();
                                    }
                                })
                                .catch(error => {
                                    editor.execute('onerror', status, statusText);
                                    select.disable = true;
                                    select.focus();
                                })
                                .finally(() => {
                                    editor.updating = false;
                                    editor.editing = false;
                                    editor.element = null;
                                });                            

                            editor.updating = true;
                        }
                        else {
                            element.setAttribute('value', afterValue);
                            element.innerHTML = ''; //must set empty first
                            element.innerHTML = afterText;

                            editor.execute('oncomplete', value, element);

                            editor.editing = false;
                            editor.element = null;
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
                        editor.element = null;
                    }
                }
                
                element.innerHTML = '';
                element.appendChild(select);
                select.focus();
            }
        }
    });
}

Editor['SWITCH'] = function (editor, element) {

    let button = element.querySelector('img[sign=switch]');
    if (button == null) {
        let value = element.textContent.trim() == editor.options[0] ? editor.options[0] : editor.options[1];
        button = $create('IMG',
            { src: `${editor.imagesBaseUrl}${editor.theme}_${value == editor.options[0] ? 'on' : 'off'}_default.${editor.theme != 'checkbox' ? 'png' : 'gif'}`, align: 'absmiddle' },
            { cursor: 'default' },
            { 'sign': 'switch', 'value': value });
        element.innerHTML = '';
        element.appendChild(button);
    }

    button.onmouseover = function (ev) {
        if (editor.editable) {
            this.src = this.src.replace('default', 'hover');
        }
    }

    button.onmouseout = function (ev) {
        if (editor.editable) {
            this.src = this.src.replace('hover', 'default');
        }
    } 

    button.onmousedown = function (ev) {
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
            this.src = this.src.replace('hover', 'active');
            editor.editing = true;
            editor.element = element;
            this.style.opacity = 0.5;
        }
    }

    button.onmouseup = function (ev) {
        let before = button.getAttribute('value');
        let after = before == editor.options[0] ? editor.options[1] : editor.options[0];
        if (editor.editable && editor.editing && editor.execute('onupdate', after)) {
            if (editor.action != '') {
                $cogo(editor.action.$parseDataURL(after), element)
                    .then(data => {
                        if (editor.execute('onfinish', data, after)) {
                            button.src = button.src.replace((before == editor.options[0] ? 'on' : 'off') + '_active', (before == editor.options[0] ? 'off' : 'on') + '_hover');
                            button.setAttribute('value', after);

                            editor.execute('oncomplete', after);
                        }
                        else {
                            button.src = button.src.replace('active', 'hover');
                        }
                    })
                    .catch(error => {
                        editor.execute('onerror', error);
                        button.src = button.src.replace('active', 'hover');
                    })
                    .finally(() => {
                        editor.updating = false;
                        button.style.opacity = 1;
                        editor.editing = false;
                        editor.element = null;
                    });                

                editor.updating = true;
            }
            else {
                //this.src = this.src.replace('active', 'hover'); //don't update
                this.src = this.src.replace((before == editor.options[0] ? 'on' : 'off') + '_active', (before == editor.options[0] ? 'off' : 'on') + '_hover');
                this.setAttribute('value', after);
                this.style.opacity = 1;

                editor.execute('oncomplete', after);

                editor.editing = false;
                editor.element = null;
            }
        }
        else {
            this.src = this.src.replace('_active', '_hover');
            this.style.opacity = 1;
            editor.editing = false;
            editor.element = null;
        }
    }   
}

Editor['SWITCHBUTTON'] = function (editor, element) {

    if (editor.options[0].class == null) {
        editor.options[0].class = 'normal-button new';
    }
    if (editor.options[1].class == null) {
        editor.options[1].class = 'normal-button old';
    }

    let button = element.querySelector('button[sign=switchbutton]');
    if (button == null) {
        let index = element.textContent == editor.options[0].value || element.textContent == editor.options[0].text ? 0 : 1;
        button = $create('BUTTON',
            { innerHTML: editor.options[index].text, className: editor.options[index].class },
            { },
            { 'sign': 'switchbutton', 'value': editor.options[index].value });
        element.innerHTML = '';
        element.appendChild(button);
    }

    button.onmousedown = function (ev) {
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
            editor.editing = true;
            editor.element = element;
        }
    }

    button.onmouseup = function (ev) {
        let before = button.getAttribute('value');
        let beforeIndex = before == editor.options[0].value ? 0 : 1;
        let afterIndex = beforeIndex == 0 ? 1 : 0;
        let after = editor.options[afterIndex].value;
        if (editor.editable && editor.editing && editor.execute('onupdate', after)) {
            button.disabled = true;
            if (editor.action != '') {
                $cogo(editor.action.$parseDataURL(after), element)
                    .then(data => {
                        if (editor.execute('onfinish', data, after)) {
                            $x(button).html(editor.options[afterIndex].text).css(editor.options[afterIndex].class);
                            button.setAttribute('value', after);

                            editor.execute('oncomplete', after);
                        }
                    })
                    .catch(error => {
                        editor.execute('onerror', error);
                    })
                    .finally(() => {
                        editor.updating = false;
                        button.disabled = false;
                        editor.editing = false;
                        editor.element = null;
                    });                

                editor.updating = true;
            }
            else {
                $x(button).html(editor.options[afterIndex].text).css(editor.options[afterIndex].class);
                button.setAttribute('value', after);
                button.disabled = false;

                editor.execute('oncomplete', after);

                editor.editing = false;
                editor.element = null;
            }
        }
        else {
            editor.editing = false;
            editor.element = null;
        }
    }  
}

Editor['CHECKBOX'] = function (editor, element) {

    let checkbox = element.querySelector('input[sign=checkbox]');
    if (checkbox == null) {
        checkbox = $create('INPUT',
                    { id: element.id + '_checkbox', type: 'checkbox', value: element.innerHTML, checked: element.textContent.trim() == editor.options[0] },
                    { }, 
                    { 'sign': 'checkbox' });
        element.innerHTML = '';
        element.appendChild(checkbox);
    }

    if (element.nodeName == 'TD') {
        element.style.textAlign = 'center';
    }

    checkbox.onclick = function (ev) {
        if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
            this.disabled = true;
            let after = this.checked ? editor.options[0] : editor.options[1];
            if (editor.execute('onupdate', after)) {
                if (editor.action != '') {   
                    $cogo(editor.action.$parseDataURL(after), element)
                        .then(data => {
                            if (!editor.execute('onfinish', data, after)) {
                                //restore if return false
                                checkbox.checked = !checkbox.checked;
                            }
                            else {
                                editor.execute('oncomplete', after);
                            }
                        })
                        .catch(error => {
                            editor.execute('onerror', error);
                            checkbox.disable = true;
                            checkbox.focus();
                        })
                        .finally(() => {
                            editor.updating = false;
                            checkbox.disabled = false;
                            editor.editing = false;
                            editor.element = null;
                        });                     

                    editor.updating = true;
                }
                else {
                    checkbox.disabled = false;

                    editor.execute('oncomplete', after);

                    editor.editing = false;
                    editor.element = null;
                }
            }
            else {
                editor.editing = false;
                editor.element = null;
                this.disabled = false;
                return false;
            }            
        }
        else {
            return false;
        }
    }
}

Editor['CHECKBUTTON'] = function(editor, element) {

    if (element.querySelectorAll('button[sign=checkbutton]').length == 0) {
        element.setAttribute('value', element.textContent.trim());
        element.innerHTML = '';
        for (let option of editor.options) {

            let button = $create('BUTTON',
                { innerHTML: option.text },
                { },
                {
                    value: option.value,
                    enabledClass: option.enabledClass || 'new',
                    disabledClass: option.disabledClass || 'old',
                    enabled: element.getAttribute('value').$includes(option.value) ? 'yes' : 'no',
                    sign: 'checkbutton'
                });

            button.onmousedown = function (ev) {
                if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
                    editor.editing = true;
                    editor.element = element;
                }
            }

            button.onmouseup = function (ev) {

                $x(button).swap('[enabledClass]', '[disabledClass]').switch('enabled', 'yes', 'no');

                let after = $x(element).select('button[enabled=yes]').objects.map(e => e.getAttribute('value')).join(',');

                if (editor.editable && editor.editing && editor.execute('onupdate', after)) {
                    $x(element).children().disable();
                    if (editor.action != '') {
                        $cogo(editor.action.$parseDataURL(after), element)
                            .then(data => {
                                if (editor.execute('onfinish', result, after)) {
                                    element.setAttribute('value', after);

                                    editor.execute('oncomplete', after);
                                }
                                else {
                                    $x(button).swap('[enabledClass]', '[disabledClass]').switch('enabled', 'yes', 'no');
                                }
                            })
                            .catch(error => {
                                editor.execute('onerror', error);
                            })
                            .finally(() => {
                                editor.updating = false;
                                $x(element).children().enable();
                                editor.editing = false;
                                editor.element = null;
                            });                       

                        editor.updating = true;
                    }
                    else {
                        $x(element).attr('value', after).children().enable();

                        editor.execute('oncomplete', after);

                        editor.editing = false;
                        editor.element = null;
                    }
                }
                else {
                    $x(button).swap('[enabledClass]', '[disabledClass]').switch('enabled', 'yes', 'no');
                    editor.editing = false;
                    editor.element = null;
                }
            }

            element.appendChild(button);
        }

        //initialize button css
        for (let i = 0; i < element.children.length; i++) {
            let enabledClass = element.children[i].getAttribute('enabledClass');
            let disabledClass = element.children[i].getAttribute('disabledClass');
            if (element.getAttribute('value').$includes(element.children[i].getAttribute('value'))) {
                if (i == 0) {
                    element.children[i].className = 'button-left ' + enabledClass;
                }
                else if (i == element.children.length - 1) {
                    element.children[i].className = 'button-right ' + enabledClass;
                }
                else {
                    element.children[i].className = 'button-center ' + enabledClass;
                }
            }
            else {
                if (i == 0) {
                    element.children[i].className = 'button-left ' + disabledClass;
                }
                else if (i == element.children.length - 1) {
                    element.children[i].className = 'button-right ' + disabledClass;
                }
                else {
                    element.children[i].className = 'button-center ' + disabledClass;
                }
            }
        }
    }
}

Editor['LINKTEXT'] = function (editor, element) {

    if (element.nodeName != 'A') {
        element = element.querySelector('A');
    }

    if (element != null && element.nodeName == 'A') {

        let button = $create('INPUT', { type: 'button', value: 'Edit' }, { display: 'none' }, { 'sign': 'editbutton' });
        
        button.onclick = function (ev) {
            //edit
            if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
    
                editor.editing = true;
                editor.element = element;
                button.style.display = 'none';
                
                let before = element.textContent;
                let textBox = $create('INPUT', { type: 'text', value: before, defaultValue: before, className: editor.inputClass });
                if (editor.maxLength > 0) {
                    textBox.maxLength = editor.maxLength;
                }
    
                //添加事件不支持return，只能直接指定
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
                }
    
                textBox.onblur = function (ev) {
                    if (this.value != this.defaultValue) {
                        let after = this.value;
                        if (after == '') {
                            editor.execute('onempty', ev);
                            if (!editor.allowEmpty) {
                                this.focus();
                                return false;
                            }                        
                        }
                        if ((editor.validator != '' && !editor.validator.test(text)) || (editor.minLength > 0 && after.length < editor.minLength)) {
                            editor.execute('onfail', after);
                            this.focus();
                            return false;                        
                        }
                        
                        if (editor.editing && editor.execute('onupdate', after)) {
                            //update
                            if (editor.action != '') {
                                this.disabled = true;
                                $cogo(editor.action.$parseDataURL(after), element)
                                    .then(data => {
                                        //finish
                                        if (editor.execute('onfinish', data, after)) {
                                            element.innerHTML = (after == '' ? '&nbsp;' : after);
                                            element.style.display = '';
                                            textBox.remove();

                                            editor.execute('oncomplete', after);
                                        }
                                        else {
                                            textBox.disabled = false;
                                            textBox.focus();
                                        }
                                    })
                                    .catch(error => {
                                        editor.execute('onerror', error);
                                        textBox.disabled = false;
                                        textBox.focus();
                                    })
                                    .finally(() => {
                                        editor.updating = false;
                                        editor.editing = false;
                                        editor.element = null;
                                    });

                                this.updating = true;
                            }
                            else {
                                //needn't updating, but will update display text         
                                element.innerHTML = (after == '' ? '&nbsp;' : after);
                                element.style.display = '';
                                textBox.remove();

                                editor.execute('oncomplete', after);

                                editor.editing = false;
                                editor.element = null;
                            }
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        //cancel                    
                        if (editor.editing && !editor.updating && editor.execute('oncancel', ev)) {
                            textBox.remove();
                            element.style.display = '';
                            editor.editing = false;
                            editor.element = null;
                        }
                    }
                }
    
                textBox.size = textBox.value.$length(3) + 2;
                textBox.onkeyup = function (ev) {
                    this.size = this.value.$length(3) + 2;
                }
    
                if (element.nextSibling != null) {
                    element.parentNode.insertBefore(textBox, element.nextSibling);
                }   
                else {
                    element.parentNode.appendChild(textBox);
                } 
                element.style.display = 'none';            
    
                textBox.focus();
            }
        }

        if (element.nextSibling != null) {
            element.parentNode.insertBefore(button, element.nextSibling);
            element.parentNode.insertBefore(document.createTextNode(' '), element.nextSibling);
        }
        else {
            element.parentNode.appendChild(document.createTextNode(' '));
            element.parentNode.appendChild(button);
        }
        //element.insertAdjacentHTML('afterEnd', button);
        //element.insertAdjacentText('afterEnd', ' ');

        $x(element.parentNode).bind('mouseover', function (ev) {
            if (editor.editable && !editor.editing) {
                button.style.display = '';
            }
        });

        $x(element.parentNode).bind('mouseout', function (ev) {
            button.style.display = 'none';
        });
    }
}

Editor['STAR'] = function (editor, element) {
    //pcs(1,3,5,10)
    let stars = element.querySelectorAll('img[sign=star]');
    if (stars.length == 0) {
        let value = element.textContent.toInt(1);
        element.setAttribute("value", value);
        element.innerHTML = '';
        for (let i = 0; i < editor.pcs; i++) {
            let star = $create('IMG',
                            { src: `${editor.imagesBaseUrl}star_${i < value ? 'enabled' : 'disabled'}.png`, width: editor.zoom, height: editor.zoom, align: 'absmiddle' },
                            { cursor: 'hand', marginLeft: '1px' },
                            { 'sign': 'star', 'value': i + 1, 'state': i < value ? 1 : 0 });        
            element.appendChild(star);

            star.onmouseover = function(ev) {
                this.width = editor.zoom + 1;
                this.height = editor.zoom + 1;
            }

            star.onmouseout = function(ev) {
                this.width = editor.zoom - 1;
                this.height = editor.zoom - 1;
            }

            star.onclick = function(ev) {
                if (editor.editable && !editor.editing && editor.execute('onedit', element, ev)) {
                    editor.editing = true;
                    editor.element = element;

                    let last = element.getAttribute("value").toInt();
                    let after = this.getAttribute("value").toInt();

                    if (after != last) {
                        if (editor.editing && !editor.updating && editor.execute('onupdate', after)) {
                            let stars = element.querySelectorAll('img[sign=star]');
                            if (editor.action != '') {
                                $cogo(editor.action.$parseDataURL(after), element)
                                    .then(data => {
                                        if (editor.execute('onfinish', data, after)) {
                                            for (let j = 0; j < stars.length; j++) {
                                                stars[j].src = `${editor.imagesBaseUrl}star_${j < after ? 'enabled' : 'disabled' }.png`;                                    
                                            }
                                            element.setAttribute("value", after);

                                            editor.execute('oncomplete', after);
                                        }
                                    })
                                    .catch(error => {
                                        editor.execute('onerror', error);
                                    })
                                    .finally(() => {
                                        editor.updating = false;
                                        editor.editing = false;
                                        editor.element = null;
                                    });                                
    
                                this.updating = true;
                            }
                            else {                                
                                for (let j = 0; j < stars.length; j++) {
                                    stars[j].src = `${editor.imagesBaseUrl}star_${j < after ? 'enabled' : 'disabled' }.png`;                                    
                                }
                                element.setAttribute("value", after);

                                editor.execute('oncomplete', after);

                                editor.editing = false;
                                editor.element = null;
                            }
                        }
                    }
                    else {
                        editor.editing = false;
                        editor.element = null;
                    }                    
                }
            }
        }        
    }
}

Editor['STARBUTTON'] = function(editor, element) {
    
    if (element.querySelectorAll('button[sign=starbutton]').length == 0) {
        element.setAttribute('value', element.textContent.trim());
        element.innerHTML = '';        
        for (let option of editor.options) {

            let button = $create('BUTTON', { innerHTML: option.text }, { },
                { 
                    value: option.value, 
                    enabledClass: option.enabledClass || 'new', 
                    disabledClass: option.disabledClass || 'old', 
                    sign: 'starbutton'
                });

            button.onmousedown = function (ev) {
                if (editor.editable && button.getAttribute('value') != element.getAttribute('value') && !editor.editing && editor.execute('onedit', element, ev)) {
                    editor.editing = true;
                    editor.element = element;
                }
            }
            
            button.onmouseup = function (ev) {
                let before = element.getAttribute('value');
                let after = button.getAttribute('value');
                
                if (editor.editable && before != after && editor.editing && editor.execute('onupdate', after)) {
                    $x(element).children().disable();
                    if (editor.action != '') {
                        $cogo(editor.action.$parseDataURL(after), element)
                            .then(data => {
                                if (editor.execute('onfinish', data, after)) {
                                    element.setAttribute('value', after);
                                    Editor['STARBUTTON'].change(element, button);
    
                                    editor.execute('oncomplete', after);
                                }
                            })
                            .catch(error => {
                                editor.execute('onerror', error);
                            })
                            .finally(() => {
                                editor.updating = false;
                                $x(element).children().enable();
                                editor.editing = false;
                                editor.element = null;
                            });
    
                        editor.updating = true;
                    }
                    else {

                        element.setAttribute('value', after);
                        Editor['STARBUTTON'].change(element, button);                        
                        $x(element).children().enable();
    
                        editor.execute('oncomplete', after);
    
                        editor.editing = false;
                        editor.element = null;
                    }
                }
                else {                    
                    editor.editing = false;
                    editor.element = null;
                }
            }

            element.appendChild(button);    
        }

        Editor['STARBUTTON'].change(element);        
    }   
}

Editor['STARBUTTON'].change = function(element, button) {
    let found = false;
    for (let i = 0; i < element.children.length; i++) {
        let enabledClass = element.children[i].getAttribute('enabledClass');
        let disabledClass = element.children[i].getAttribute('disabledClass');
        if (!found && element.getAttribute('value') != '') {
            if (element.children[i].className.endsWith(disabledClass) || element.children[i].className == '') {
                if (i == 0) {
                    element.children[i].className = 'button-left ' + enabledClass;
                }
                else if (i == element.children.length - 1) {
                    element.children[i].className = 'button-right ' + enabledClass;
                }
                else {
                    element.children[i].className = 'button-center ' + enabledClass;
                }                
            }
            if ((button != undefined && element.children[i] == button)
                 || (button == undefined && element.getAttribute('value').$includes(element.children[i].getAttribute('value')))
                ) {
                found = true;
            }            
        }
        else {
            if (element.children[i].className.endsWith(enabledClass) || element.children[i].className == '') {
                if (i == 0) {
                    element.children[i].className = 'button-left ' + disabledClass;
                }
                else if (i == element.children.length - 1) {
                    element.children[i].className = 'button-right ' + disabledClass;
                }
                else {
                    element.children[i].className = 'button-center ' + disabledClass;
                }
            }
        }
    }
}

Editor.Key = {
    ///		是不是[复制剪切粘贴]操作
    ///		ctrl+x
    ///		ctrl+c
    ///		ctrl+v
    isCopyCutPaste : function (ev) {
        if (ev.ctrlKey) {
            return (ev.keyCode == 88 || ev.keyCode == 67 || ev.keyCode == 86);
        }
        else {
            return false;
        }
    },
    ///		是不是[选择文本]操作
    ///		ctrl+shift+←→ 选择上一个单词下一个单词
    ///		shift+←→ 选择下一个字母上一个字母
    ///		ctrl+shift+home,end 选择光标前面或后面所有
    ///		shift+home,end 选择光标本行前面或后面所有
    ///		ctrl+a 选择所有
    isSelect : function (ev) {
        if (ev.shiftKey || (ev.ctrlKey && ev.shiftKey)) {
            return (ev.keyCode >= 35 && ev.keyCode <= 40);
        }
        else if (ev.ctrlKey && !ev.shiftKey) {
            return ev.keyCode == 65;
        }
        else {
            return false;
        }
    },
    ///		是不是[移动光标]操作
    ///		ctrl+←→ 移动到上一个单词下一个单词
    ///		←→ 移动到下一个字母上一个字母
    ///		ctrl+home,end 移动到段落开始或结尾
    ///		home,end 行动到行开始或结尾
    isMove : function (ev) {
        return (ev.keyCode >= 35 && ev.keyCode <= 40);
    },
    ///		是不是[删除文本]操作
    ///		ctrl+backspace 删除前一单词
    ///		backspace,insert,delete 删除
    ///		shift+del删除整行
    isDelete : function (ev) {
        if (ev.ctrlKey) {
            return ev.keyCode == 8;
        }
        else if (ev.shiftKey) {
            return ev.keyCode == 46;
        }
        else {
            return ev.keyCode == 8 || ev.keyCode == 45 || ev.keyCode == 46;
        }
    },
    isEdit : function (ev) {
        return Editor.Key.isSelect(ev) || Editor.Key.isMove(ev) || Editor.Key.isDelete(ev) || ev.keyCode == 9 || ev.keyCode == 13 || Editor.Key.isCopyCutPaste(ev);
    },
    isInteger : function (ev) {
        return !ev.shiftKey && (ev.keyCode == 45 || (ev.keyCode >= 48 && ev.keyCode <= 57) || (ev.keyCode >= 96 && ev.keyCode <= 105));
    },
    isDecimal: function (ev, value) {
        return !ev.shiftKey && (ev.keyCode == 45 || (ev.keyCode >= 48 && ev.keyCode <= 57) || (ev.keyCode >= 96 && ev.keyCode <= 105) || (value.indexOf('.') == -1 ? (ev.keyCode == 190 || ev.keyCode == 110) : false));
    }
};

Editor.reapplyAll = function() {
    for (let component of document.components.values()) {
        if (component.tagName == 'EDITOR') {
            component.apply();
        }
    }
}

Editor.initializeAll = function () {
    //remove all first
    for (let [name, component] in document.components) {
        if (component.tagName == 'EDITOR') {
            document.components.delete(name);
        }        
    }

    //initialize from element
    $a('editor,[editable]').forEach(element => {
        if (element.noneName != 'COL' && element.getAttribute('root') == null) {
            new Editor(element).apply(element.getAttribute('elements') || element);
        }
    });
}

$finish(function () {
    Editor.initializeAll();
});