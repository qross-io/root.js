
/**

<select type="button/image/checkbox/radio" data="" text="" value="" cols="">
    <option value="" icon="url/icon/other" show="" hide=""></option>
    <option>text</option>
    <optgroup data="@[initial]">
        <option value="@[id]" if="@[age] >= 18">@[name]<option>
    </optgroup>
</select>

reload-on
 */ 

class Select {

    constructor(element) {
        
        this.options = [];
        this._selectedIndex = -1;

        $initialize(this)
        .with(element)
        .declare({
            _name: 'Select_' + document.components.size,
            type: 'original|beauty|button|image|checkbox|radio',
            _value: '',

            _className: '',
            _frameClass: function(value) {
                return value || this._className;                
            }, //for beauty only
            _labelClass: '', 
            _optionClass: function(value) {
                return value || Select[this.type].optionClass;
            },
            _selectedOptionClass: function(value) {
                return value || Select[this.type].selectedOptionClass;
            },
            _disabledOptionClass: function(value) {
                return value || Select[this.type].disabledOptionClass;
            },
            
            requiredText: '',
            invalidText: '',
            validText: '',
            successText: '',
            failureText: '',
            exceptionText: '',

            //button only
            _scale: SelectButtonScale.NORMAL,

            optGroup: 'OPTGROUP',  //选项元素组的标签选择器
            option: 'OPTION', //选项元素的标签选择器
            cols: 1,

            multiple: false,
   
            data: '',
            
            _disabled: function(value) {
                return value == 'disabled' || $parseBoolean(value, false);
            },

            onchange: null, //function(beforeOption, ev) { },
            'onchange+': null, //server side event
            'onchange+success': null,
            'onchange+failure': null,
            'onchange+exception': null,
            'onchange+completion': null,

            status: 'none',
            hint: null,
            callout: null,
            alter: null
        })
        .elementify(element => {
            if (this.type == 'beauty') {
                //this.box = 
                //this.container =                 
            }
            else if (this.type != 'original') {
                this.container = $create(Select[this.type].container, { id: this.id, className: this._frameClass }, { }, { name: this._name, value: this._value || '' });
                if (element.getAttribute('style') != null) {
                    this.container.setAttribute('style', element.getAttribute('style'));
                }
                $x(element).insertFront(this.container);
                //transfer attributes
                $transfer(element, this.container);                
            }
            else {
                this.container = element;
            }

            if (this.type == 'checkbox' && !this.multiple) {
                this.multiple = true;
            }
            
            this.$value = element.getAttribute('value') || '';
            this.element = element;
        });        

        if (this.type != 'original') {
            let select = this;
            this.container.onclick = function(ev) {
                let target = ev.target;
                let allowed = true;
                if (select.type == 'radio' || select.type == 'checkbox') {
                    allowed = target.nodeName == 'INPUT' || target.nodeName == 'LABEL';
                }
                while (target.getAttribute('index') == null && target.nodeName != 'BODY') {
                    target = target.parentNode;
                }
                if (allowed && target.nodeName != 'BODY') {
                    let index = target.getAttribute('index').toInt();
                    if (select.multiple) {
                        select.options[index].selected = !select.options[index].selected;
                    }
                    else if (!select.options[index].selected) {
                        select.options[index].selected = true;
                    }
                }
            }
        }
        else {
            $x(this.element).on('change', function(ev) {
                this.setAttribute('text', this.options[this.selectedIndex].text);
                this.setAttribute('value', this.value);
            });
        }
    }

    get name() {
        return this._name;
    }

    set name(name) {
        if (name != this._name) {
            this.container.id = name;
            document.components.delete(this._name);
            document.components.set(name, this);
            this.id = name;
            this._name = name;
        }
    }
    
    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(index) {
        if (index != this._selectedIndex) {
            if (index < -1) {
                index = -1;
            }
            if (index > this.options.length - 1) {
                index = this.options.length - 1;
            }

            if (index == -1) {
                this.options.filter(option => option.selected).forEach(option => option.selected = false);
            }
            else {
                if (this.multiple) {
                    this.options.filter(option => option.selected && option.index != index).forEach(option => option.selected = false);
                }
                this.options[index].selected = true;
            }
        }
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(disabled) {
        this.options.forEach(option => option.disabled = disabled);
        this._disabled = disabled;        
    }

    get text() {
        return this.container.getAttribute('text') || '';
    }

    set text(text) {
        this.container.setAttribute('text', text);
    }

    get value() {        
        return this.container.getAttribute('value') || '';
    }

    set value(value) {
        this.container.setAttribute('value', value);
    }

    get className() {
        return this._className;
    }

    set className(className) {
        this._className = className;
        if (this.type != 'BEAUTY') {
            this.container.className = className;
        }
        else {
            this.box.className = className;
        }
    }

    get frameClass() {
        return this._frameClass;
    }

    set frameClass(frameClass) {
        this._frameClass = frameClass;
        this.container.className = this.className;
    }

    get optionClass() {
        return this._optionClass;
    }

    set optionClass(className) {
        if (className != this._optionClass) {
            this._optionClass = className;
            this.updateAppearances();
        }
    }

    get selectedOptionClass() {
        return this._selectedOptionClass;
    }

    set selectedOptionClass(className) {
        if (className != this._selectedOptionClass) {
            this._selectedOptionClass = className;
            this.updateAppearances();
        }
    }

    get disabledOptionClass() {
        return this._disabledOptionClass;
    }

    set disabledOptionClass(className) {
        if (className != this._disabledOptionClass) {
            this._disabledOptionClass = className; 
            this.updateAppearances();
        }
    }

    get scale() {
        return this._scale;
    }

    set scale(scale) {
        if (scale != this._scale) {
            this._scale = scale;
            this.updateAppearances();
        }
    }

    get initialized() {
        return this._initialized;
    }

    get hidden() {
        return this.container.hidden;
    }

    set hidden(value) {
        this.container.hidden = value;
    }

    set hintText(text) {
        if (this.hintSpan != null) {
            this.hintSpan.innerHTML = text;
            if (this.status == 'success') {
                this.hintSpan.className = this.validTextClass;
            }
            else {
                this.hintSpan.className = this.errorTextClass;
            }                    
            this.hintSpan.hidden = text == '';
        }
        
        if (text != '' && this.callout != null) {
            Callout(text).position(this, this.callout).show();
        }

        if (text != '' && this.alert != null) {
            if ($root.alert != null) {
                $root.alert(text, this.confirmButtonText);
            }
            else {
                window.alert(text);
            }
        }
    }
}

SelectButtonScale = {
    LARGE: 'large',
    BIG: 'big',
    MEDIUM: 'medium',
    NORMAL: 'normal',
    SMALL: 'small',
    MINI: 'mini'
}

$select = function(name) {
    let select = $t(name);
    if (select != null && select.tagName == 'SELECT') {
        return select;
    }
    else {
        return null;
    }
}

// Select.prototype.onchange = function(beforeOption, ev) { };
// Select.prototype.onerror = function(status, statusText) { };
// Select.prototype.onsuccess = function(result) { };

Select.prototype.$value = null; //初始值
Select.prototype.element = null; //保存配置的元素
Select.prototype.container = null; //容器元素
Select.prototype.$for = null; //as a for loop
Select.prototype._initialized = false;

Select.prototype.apply = function() {

    if (this.type != 'original') {
        for (let option of this.element.querySelectorAll('option')) {
            this.add(option);
        }
    }

    if (this.$value != '') {
        this.$value.split(',')
            .forEach(v => {
                this.options.filter(option => option.value == v).forEach(option => option.selected = true);
            });
    }
    
    if (this.selectedIndex > -1) {
        if (this.text == '') {
            this.text = this.options.filter(option => option.selected).map(option => option.text).join(',');
        }
        if (this.value == '') {
            this.value = this.options.filter(option => option.selected).map(option => option.value).join(',');
        }
    }
}

Select.prototype.initialize = function() {

    this.element.hidden = true;
    
    if (this.data != '') {        
        this.$for = new For(this.element);
        this.$for.owner = this;
        this.$for.onload = function(data) {
            this.owner.apply();            
            if (this.owner._initialized) {
                Event.execute(this.owner, 'onreload', data);
            }
            else {
                this.owner._initialized = true;
                Event.execute(this.owner, 'onload', data);                
            }            
        }
        this.$for.load();
    }

    Event.interact(this, this.element);

    if (this.data == '') {
        this.apply();
        this._initialized = true;
        Event.execute(this, 'onload');
    }
    
    if (this.type == 'original') {
        this.element.hidden = false;
    }

    if (this._disabled) {
        this.disabled = true;
    }

    if (this.successText != '' || this.failureText != '' || this.exceptionText != '') {
        if (this.hint != null) {
            if (this.hintSpan == null) {
                if (this.hint != '') {
                    this.hintSpan = $s(this.hint);
                }
                else {
                    this.hintSpan = $create('SPAN', { innerHTML: '', className: this.errorTextClass }, { display: 'none' });
                    $x(this).insertBehind(this.hintSpan);
                }
            }
        }
    }
}

Select.prototype.load = function() {
    if (this.$for != null) {
        this.$for.load();
    }    
}

Select.prototype.reload = function() {
    if (this.data != '') {
        this.clear();
        this.load();
    }    
}

Select.prototype.add = function(settingsOrOptionElement) {

    let option = new SelectOption(settingsOrOptionElement);
    if (option.value != '' && option.text == '') {
        option._text = option.value;
    }
    if (option.text != '' && option.value == '') {
        option._value = option.text;
    }
    option.select = this;

    option._index = this.options.length;
    option.container = Select[this.type].populate.call(option);
    this.container.appendChild(option.container);
    this.options.push(option);    

    if (this.value.$includes(option.value) || option._selected) {
        if (!this.multiple) {
            if (this.selectedIndex > -1) {
                $x(this.options[this.selectedIndex].container).swap(this.options[this.selectedIndex].selectedClass, this.options[this.selectedIndex].className);
                this.options[this.selectedIndex]._selected = false;
            }
        }

        $x(option.container).swap(option.selectedClass, option.className);
        option._selected = true;
        this._selectedIndex = option.index;
        option.hideAndShow();
    }
    
    if (option.disabled && !option.container.disabled) {
        option.disabled = true;
    }

    option._updateAppearance();
};

Select.prototype.delete = function(option) {

    //原索引位置
    let index = option.index;
    
    //更新select的value和text
    option.selected = false;

    //删除元素和数组项
    option.container.remove();
    this.options.splice(index, 1);
    
    //更新其他option的index
    for (let i = index + 1; i < this.options.length; i++) {
        this.options[i]._index -= 1;
    }

    this.updateAppearances();
}

Select.prototype.updateAppearances = function() {
    for (let i = 0; i < this.options.length; i++) {
        this.options[i]._updateAppearance(); 
    }
}

Select.prototype.insertBefore = function(index, text, value, className) { };

Select.prototype.insertAfter = function(index, text, value, className) { };

Select.prototype.clear = function() {
    this.container.innerHTML = '';
    this.element.innerHTML = '';
    this._selectedIndex = -1;
    this.text = '';
    this.value = '';
    this.options.length = 0;
};

Select.prototype.indexOf = function(value) { };

Select.prototype.indexTextOf = function(text) { };

//回退到上一个状态
Select.prototype._rollback = function(before, after) {
    if (this.multiple) {
        $x(this.options[after].container).swap(this.options[after].selectedClass, this.options[after].className);
        this.options[after]._selected = !this.options[after]._selected;

        let options = this.options.filter(option => option.selected);
        if (options.length == 0) {
            this.text = '';
            this.value = '';
            this._selectedIndex = -1;
        }
        else {
            this.text = options.map(option => option.text).join(',');
            this.value = options.map(option => option.value).join(',');
            this._selectedIndex = options[0].index;

            options.forEach(option => option.hideAndShow());
        }
    }
    else {
        if (before > -1) {
            $x(this.options[before].container).swap(this.options[before].selectedClass, this.options[before].className);
            this.options[before]._selected = true;
        }
        if (after > -1) {
            $x(this.options[after].container).swap(this.options[after].selectedClass, this.options[after].className);
            this.options[after]._selected = false;
        }

        this._selectedIndex = before;
        this.text = before != -1 ? this.options[before].text : '';
        this.value = before != -1 ? this.options[before].value : '';

        if (this.options[before].hide != '') {
            $x(this.options[before].hide).hide();
        }
        if (this.options[before].show != '') {
            $x(this.options[before].show).show();
        }
    }
}

Select.prototype.setValue = function(value) {
    this.container.setAttribute('value', value);
}

Select.prototype.setText = function(text) {
    this.container.setAttribute('text', text);
}

Select.prototype.getAttribute = function(attr) {
    return this[attr] || this.container.getAttribute(attr) || this.options[this.selectedIndex].getAttribute(attr);  
}

Select.prototype.setAttribute = function(attr, value) {
    if (this[attr] != undefined) {
        this[attr] = value;
    }
    else {
        this.container.setAttribute(attr, value);
    }
}

class SelectOptGroup {
    constructor(element) {
        this.select = null;
        this.label = '';
        this.data = '';
    }
}

class SelectOption {

    constructor(settings) {
        
        this.attributes = { };

        $initialize(this)
            .with(settings)
            .declare({
                _value: '',
                _text: 'html',
                _title: '',
                _src: null, //image only
                _selectedClass: '', //默认从Select继承
                _className: '', //默认从Select继承
                _disabledClass: '', //默认从Select继承
                _selected: function(value) {
                    return value == 'selected' || $parseBoolean(value, false);
                },
                _disabled: function(value) {
                    return value == 'disabled' || $parseBoolean(value, false);
                },
                show: '', //切换到当前选项时显示哪些元素
                hide: '' //切换到当前选项时隐藏哪些元素
            })
            .elementify(element => {
                this.element = element;
                element.getAttributeNames().forEach(attr => {
                    if (this[attr] === undefined) {
                        this.attributes[attr] = element.getAttribute(attr);
                    }
                });
            });

        this._index = -1; //readOnly
        this.group = null; //readOnly
        this.container = null;
    }
    
    get text() {
        return this._text;
    }

    set text(text) {
        if (text != this._text) {
            if (this.selected) {
                this.select.container.setAttribute('text', text);
            }
            this._text = text;
            Select[this.select.type].setText.call(this, text);
        }        
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (value != this._value) {
            if (this.selected) {
                this.select.container.setAttribute('value', value);
            }
            this.container.setAttribute('value', value);
            this._value = value;
        }        
    }

    get title() {
        return this._title;
    }

    set title(title) {
        this._title = title;
        this.container.title = title;        
    }

    get src() {
        let img = this.container != null ? this.container.querySelector('IMG') : null;
        if (img != null && this._src != img.src) {
            this._src = img.src;
        }
        return this._src;
    }

    set src(src) {
        this._src = src;
        let img = this.container.querySelector('IMG');
        if (img != null) {
            img.src = src;
        }
    }

    get selectedClass() {
        return this._selectedClass == '' && this.select != null ? this.select.selectedOptionClass : this._selectedClass;
    }

    set selectedClass(className) {
        if (className != this._selectedClass) {
            if (this.selected) {
                this.container.className = this.container.className.replace(this._selectedClass, className);
            }            
            this._selectedClass = className;
        }
    }

    get className() {
        return this._className == '' && this.select != null ? this.select.optionClass : this._className;
    }

    set className(className) {
        if (className != this._className) {
            if (!this.selected) {
                this.container.className = this.container.className.replace(this._className, className);
            }            
            this._className = className;
        }
    }

    get disabledClass() {
        return this._disabledClass == '' && this.select != null ? this.select.disabledOptionClass : this._disabledClass;
    }

    set disabledClass(className) {
        if (className != this._disabledClass) {
            if (this.disabled) {
                this.container.className = this.container.className.replace(this._disabledClass, className);
            }         
            this._disabledClass = className;
        }
    }

    get index() {
        return this._index;
    }

    get selected() {
        return this._selected;
    }

    set selected(selected) {
        if (typeof (selected) == 'boolean') {
            if (selected != this._selected || (selected && this._selected && this.select.selectedIndex == -1)) {
                let before = this.select.selectedIndex;

                if (this.select.multiple) {
                    $x(this.container).swap(this.selectedClass, this.className);
                    this._selected = selected;
            
                    let options = this.select.options.filter(option => option.selected);
                    if (options.length == 0) {
                        this.select.container.setAttribute('text', '');
                        this.select.container.setAttribute('value', '');
                        this.select._selectedIndex = -1;
                    }
                    else {
                        this.select.container.setAttribute('text', options.map(option => option.text).join(','));
                        this.select.container.setAttribute('value', options.map(option => option.value).join(','));
                        this.select._selectedIndex = options[0].index;
                    }
                }
                else {
                    if (selected) {
                        if (this.select.selectedIndex > -1) {
                            $x(this.select.options[this.select.selectedIndex].container).swap(this.select.options[this.select.selectedIndex].selectedClass, this.select.options[this.select.selectedIndex].className);
                            this.select.options[this.select.selectedIndex]._selected = false;
                        }        
                        $x(this.container).swap(this.selectedClass, this.className);
                        this._selected = true;
                        this.select._selectedIndex = this.index;
            
                        this.select.container.setAttribute('text', this.text);
                        this.select.container.setAttribute('value', this.value);

                        this.hideAndShow();
                    }
                    else {
                        $x(this.container).swap(this.selectedClass, this.className);
                        this._selected = false;
                        this.select._selectedIndex = -1;
            
                        this.select.container.setAttribute('text', '');
                        this.select.container.setAttribute('value', '');
                    }
                }

                //事件在加载完成后才触发
                if (this.select.initialized) {
                    if (this.select.execute('onchange', this.select.options[before], this)) {
                        if (this.select['onchange+'] != null) {
                            $FIRE(this.select, 'onchange+',
                                    function(data) {
                                        this.status = 'success';
                                        this.hintText = this.successText.$p(this, data);
                                    }, 
                                    function(data) {
                                        this.status = 'failure';
                                        this.hintText = this.failureText.$p(this, data);
                                        this._rollback(before, this.selectedIndex);
                                    },
                                    function(error) {
                                        this.status = 'exception';
                                        this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
                                        this._rollback(before, this.selectedIndex);
                                    },
                                    function() { });
                        }
                    }
                    else {
                        //back on illegal
                        this.select._rollback(before, this.index);
                    }
                }
            }
            Select[this.select.type].selectAop.call(this, selected);
        }
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(disabled) {
        if (typeof(disabled) == 'boolean') {
            if (disabled != this._disabled) {                
                $x(this.container).swap(this.selected ? this.selectedClass : this.className, this.disabledClass);
                this._disabled = disabled;
            }
            Select[this.select.type].disableAop.call(this, disabled);
        }        
    }
}

//button
SelectOption.prototype.element = null;
//parent
SelectOption.prototype.select = null;
//parent
SelectOption.prototype.group = null;

SelectOption.prototype.getAttribute = function(attr) {
    if (this[attr] != undefined) {
        return this[attr];
    }
    else {
        return this.attributes[attr];
    }
}

SelectOption.prototype.setAttribute = function(attr, value) {
    if (this[attr] != undefined) {
        this[attr] = value;
    }
    else {
        this.attributes[attr] = value;
    }  
}

SelectOption.prototype.remove = function() {
    this.select.delete(this);
};

SelectOption.prototype.insertBehind = function(text, value, className) {

};

SelectOption.prototype.insertFront = function(text, value, className) {

};

SelectOption.prototype.hideAndShow = function() {
    if (this.hide != '') {
        $x(this.hide).hide();
    }
    if (this.show != '') {
        $x(this.show).show();
    }
}

// scale = normal
// selectedClass = 'new' 或 className = 'old' 或 disabled
SelectOption.prototype._updateAppearance = function(terminal) {
    Select[this.select.type].updateAppearance.call(this, terminal);
}


Select['original'] = {
    container: '',
    optionClass: '', 
    selectedOptionClass: '',
    disabledOptionClass: '',
    setText: function(text) {

    },
    populate: function() {

    },
    selectAop: function(yes) {

    },
    disableAop: function(yes) {

    }
}

Select['button'] = {
    container: 'SPAN',
    optionClass: 'optional-button', 
    selectedOptionClass: 'green-button',
    disabledOptionClass: 'disabled',
    setText: function(text) {
        this.container.innerHTML = text;
    },
    populate: function() {
        return $create('BUTTON', { innerHTML: this.text, title: this.title }, { }, { value: this.value, index: this.index });
    },
    selectAop: function(yes) {

    },
    disableAop: function(yes = true) {
        this.container.disabled = yes;
    },
    updateAppearance: function(terminal) {
        let css = this.select.scale != '' && SelectButtonScale[this.select.scale.toUpperCase()] != null ? this.select.scale + '-button ' : '';
        let length = this.select.options.length;

        // l = 1, i = 0 - alone
        // l > 1, i = 0 - left
        // i > 1, i = length -1 = right
        // i > 2, i > 0 && i < length - 1 = center
        if (length == 1) {
            //alone
            css += 'button-alone';
        }
        else if (length == 2) {
            //left-right
            if (this.index == 0) {
                css += 'button-left';
            }
            else if (this.index == 1) {
                css += 'button-right';            
            }      
        }
        else if (length > 2) {
            //left-center-right
            if (this.index == 0) {
                css += 'button-left';
            }
            else if (this.index == length - 1) {
                css += 'button-right';
            }
            else {
                css += 'button-center';
            }
        }

        if (this.disabled) {
            css += ' ' + (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
        else if (this.selected) {
            css += ' ' + (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            css += ' ' + (this.className == '' ? this.select.optionClass : this.className);
        }

        if (this.container.className != css) {
            this.container.className = css;
        }

        if (terminal == null) {
            if (this.index > 0) {
                this.select.options[this.index - 1]._updateAppearance('terminal');
            }
            if (this.index < length - 1) {
                this.select.options[this.index + 1]._updateAppearance('terminal');
            }
        }
    }
}

Select['image'] = {
    container: 'SPAN',
    optionClass: 'image-option', 
    selectedOptionClass: 'image-selected-option',
    disabledOptionClass: 'image-disabled-option',
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let span = $create('SPAN', { title: this.title }, { }, { value: this.value, index: this.index });
        let image = $create('IMG', { src: this._src, align: 'absmiddle' });
        span.appendChild(image);
        span.appendChild($create('BR'))
        span.appendChild($create('SPAN', { innerHTML: this.text }));
        return span;
    },
    selectAop: function(yes) {

    },
    disableAop: function(yes = true) {
        this.container.setAttribute('disabled', yes);
    },
    updateAppearance: function(terminal) {
        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
        else if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }
    }
}

Select['radio'] = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let div = $create('DIV', { title: this.title, className: this.className }, { }, { value: this.value, index: this.index });
        let radio = $create('INPUT', { type: 'radio', name: this.select.id, id: this.select.id + '_' + this.index, value: this.value, checked: this.selected }, { }, { index: this.index });
        let label = $create('LABEL', { htmlFor: this.select.id + '_' + this.index, innerHTML: this.text });
        div.appendChild(radio);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(label);
        return div;
    },
    selectAop: function(yes) {
        this.container.firstChild.checked = yes;
    },
    disableAop: function(yes = true) {
        this.container.firstChild.disabled = yes;
    },
    updateAppearance: function(terminal) {
        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
        else if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }
    }
}

Select['checkbox'] = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    setText: function(text) {
        this.container.lastChild.innerHTML = text;
    },
    populate: function() {
        let div = $create('DIV', { title: this.title, className: this.className }, { }, { value: this.value, index: this.index });
        let radio = $create('INPUT', { type: 'checkbox', name: this.select.id, id: this.select.id + '_' + this.index, value: this.value, checked: this.selected }, { }, { index: this.index });
        let label = $create('SPAN', { htmlFor: this.select.id + '_' + this.index, innerHTML: this.text });
        div.appendChild(radio);
        div.appendChild(document.createTextNode(' '));
        div.appendChild(label);
        return div;
    },
    selectAop: function(yes) {
        this.container.firstChild.checked = yes;
    },
    disableAop: function(yes = true) {
        this.container.firstChild.disabled = yes;
    },
    updateAppearance: function(terminal) {
        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
        else if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }
    }
}

Select.initialize = function(button) {
    if (typeof(button) == 'string') {
        button = $s(button);
    }
    if (button != null) {
        new Select(button).initialize();
    }
    else {
        throw new Error('Must specify a SELECT element.');
    }
}

Select.initializeAllIn = function(element) {
    if (typeof(element) == 'string') {
        element = $s(element);
    }
    element.querySelectorAll('select').forEach(select => {
        if (document.models != null) {
            Model.boostPropertyValue(select, 'value');
        }
        new Select(select).initialize();
    });
}

Select.initializeAll = function() {
    Select.initializeAllIn(document);
}

$finish(function () {
    Select.initializeAll();
});