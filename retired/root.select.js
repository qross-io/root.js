
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

HTMLSelectElement.valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

$enhance(HTMLSelectElement.prototype)
    .defineProperties({
        text: {
            get() {
                if (this.selectedIndex > -1) {
                    if (this.multiple) {
                        return [...this.options].filter(option => option.selected).map(option => option.text).join(',');
                    }
                    else {
                        return this.options[this.selectedIndex].text;
                    }
                }
                else {
                    return "";
                }
            },
            set(value) {
                if (typeof(value) == 'string') {
                    value = value.split(',');
                }
                if (value instanceof Array) {
                    let vs = new Set(value);
                    [...this.options].forEach(option => option.selected = vs.has(option.value));                    
                }
                else {
                    HTMLSelectElement.valueDescriptor.set.call(this, value);
                }
            }
        },
        value: {
            get() {
                if (this.multiple) {
                    return [...this.options].filter(option => option.selected).map(option => option.value).join(',');
                }
                else {
                    return HTMLSelectElement.valueDescriptor.get.call(this);
                }
            },
            set(value) {
                if (this.multiple) {
                    if (typeof(value) == 'string') {
                        value = value.split(',');
                    }
                    [...this.options].forEach(option => option.selected = value.includes(option.value));
                }
                else {
                    HTMLSelectElement.valueDescriptor.set.call(this, value);
                }                
            }
        },
        selectedIndexes: {
            get() {
                if (this.multiple) {
                    return [...this.selectedOptions].map(option => option.index);
                }
                else {
                    return [this.selectedIndex];
                }
            },
            set(indexes) {
                if (this.multiple) {
                    let before = this.selectedIndexes;
                    before.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                    indexes.filter(index => !before.includes(index)).forEach(index => this.options[index].selected = true);
                }
                else {
                    this.selectedIndex = indexes[0] ?? -1;
                }
            }
        }
    });

class Select {

    constructor(element) {
        
        this.options = [];
        this._selectedIndex = -1;
        this._selectedIndexes = [];

        $initialize(this)
        .with(element)
        .declare({
            _name: 'Select_' + String.shuffle(7),
            type: 'original|beauty|button|image|checkbox|radio',
            _value: '',

            _className: '',
            //for beauty only
            _frameClass: function(value) {
                return value ?? this._className;                
            },
            _labelClass: '', 
            _optionClass: function(value) {
                return value ?? Select[this.type].optionClass;
            },
            _selectedOptionClass: function(value) {
                return value ?? Select[this.type].selectedOptionClass;
            },
            _disabledOptionClass: function(value) {
                return value ?? Select[this.type].disabledOptionClass;
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
            await: '',
            
            _disabled: false,
            _enabled: true,

            onload: null,
            onreload: null,
            onchange: null, //function(index, ev) { },
            'onchange+': null, //server side event
            'onchange+success': null,
            'onchange+failure': null,
            'onchange+exception': null,
            'onchange+completion': null,

            status: 'none',
            hint: null,
            callout: null,
            message: null
        })
        .elementify(element => {
            if (this.type == 'beauty') {
                //this.box =           
            }
            else if (this.type != 'original') {
                this.container = $create(Select[this.type].container, { id: this.id, className: this._frameClass }, { }, { name: this._name, value: this._value || '' });
                if (element.getAttribute('style') != null) {
                    this.container.setAttribute('style', element.getAttribute('style'));
                }
                element.insertAdjacentElement('beforeBegin', this.container);

                //transfer attributes
                let excludings = new Set(['id', 'type', 'data']);
                element.getAttributeNames()
                    .forEach(attr => {
                        if (!excludings.has(attr)) {
                            let value = element[attr] != null ? element[attr] : element.getAttribute(attr);
                            if (this.container[attr] != null) {
                                this.container[attr] = value;
                            }
                            else if (!attr.includes('+') && !attr.includes('-')) {
                                this.container.setAttribute(attr, value);
                            }
                        }
                    });

                element.id = '';
            }
            else {
                this.container = element;
            }

            if (this.type == 'checkbox' && !this.multiple) {
                this.multiple = true;
            }
            
            this.$value = element.getAttribute('value') ?? '';
            this.element = element;
        });        

        let select = this;
        if (this.type != 'original') {
            this.container.onclick = function(ev) {
                if (!select.disabled) {
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
                        if (select.initialized) {
                            select.container.setAttribute('value-', select.getComingValue(index));
                            if (select.execute('onchange', index, ev)) {
                                if (select.multiple) {
                                    select.options[index].selected = !select.options[index].selected;
                                }
                                else if (!select.options[index].selected) {
                                    select.options[index].selected = true;
                                }
                                select._fireChange();
                            }
                            select.container.removeAttribute('value-');
                        }                    
                    }
                }
            }
        }
        else {
            if (this.container.onchange != null && this['onchange+'] != null) {
                this.onchange_ = this.container.onchange;
                this.container.onchange = null;
            }

            this.container.on('change', function(ev) {
                if (select.execute(select.onchange_ != null ? 'onchange_' : 'onchange', this.selectedIndex, ev)) {
                    select._fireChange();
                }
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
        if (index < -1) {
            index = -1;
        }
        if (index > this.options.length - 1) {
            index = this.options.length - 1;
        }

        if (!this.multiple) {            
            if (index != this._selectedIndex) {
                if (this.initialized) {
                    this.container.setAttribute('value-', select.getComingValue(index));
                    if (this.execute('onchange', index)) {
                        this._source = 'index';
                        if (index == -1) {
                            this.options[this._selectedIndex].selected = false;                        
                        }
                        else {                        
                            this.options[index].selected = true;                
                        }
                        this._source = 'none';
                        this._selectedIndex = index;  
                        this._fireChange();
                    }
                    this.container.removeAttribute('value-');
                }
                else {
                    this._source = 'index';
                    if (index == -1) {
                        this.options[this._selectedIndex].selected = false;                        
                    }
                    else {                        
                        this.options[index].selected = true;                
                    }
                    this._selectedIndex = index;
                    this._source = 'none';
                }
            }            
        }
        else {
            this.selectedIndexes = [index];
        }
    }

    get selectedIndexes() {
        return this._selectedIndexes;
    }

    set selectedIndexes(indexes) {
        if (JSON.stringify(indexes) != JSON.stringify(this._selectedIndexes)) {
            if (this.initialized) {
                this.container.setAttribute('value-', select.getComingValue(indexes));
                if (this.execute('onchange', indexes)) {
                    this._source = 'indexes';
                    this._selectedIndexes.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                    indexes.filter(index => !this._selectedIndexes.includes(index)).forEach(index => this.options[index].selected = true);
                    this._source = 'none';
                    this._selectedIndexes = indexes;
                    this._selectedIndex = indexes[0] ?? -1;
                    this._fireChange();
                }
                this.container.removeAttribute('value-');
            }
            else {
                this._source = 'indexes';
                this._selectedIndexes.filter(index => !indexes.includes(index)).forEach(index => this.options[index].selected = false);
                indexes.filter(index => !this._selectedIndexes.includes(index)).forEach(index => this.options[index].selected = true);
                this._source = 'none';
                this._selectedIndexes = indexes;
                this._selectedIndex = indexes[0] ?? -1;
            }
        }
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(disabled) {
        if (typeof(disabled) != 'boolean') {
            disabled = $parseBoolean(disabled, true, this);
        }        
        this.options.forEach(option => option.disabled = disabled);
        this._disabled = disabled;        
    }

    get enabled() {
        return !this._disabled;
    }

    set enabled(enabled) {
        if (typeof(enabled) != 'boolean') {
            enabled = $parseBoolean(enabled, true, this);
        }
        this.disabled = !enabled;
    }

    get text() {
        if (this.type != 'original') {
            if (this.multiple) {
                return [...this.options].filter(option => option.selected).map(option => option.text).join(',');
            }
            else {
                return this.selectedIndex > -1 ? this.options[this.selectedIndex].text : '';
            }
        }
        else {
            return this.container.text;
        }
    }

    set text(text) {
        if (this.type != 'original') {
            if (this.multiple) {
                this.selectedIndexes = this.indexesTextOf(typeof(value) == 'string' ? text.split(',') : text);
            }
            else {
                this.selectedIndex = this.indexTextOf(text);
            }
        }
        else {
            this.container.text = text;
        }
    }

    get value() {
        if (this.type != 'original') {
            if (this.container.hasAttribute('value-')) {
                return this.container.getAttribute('value-');
            }
            else {
                if (this.multiple) {
                    return [...this.options].filter(option => option.selected).map(option => option.value).join(',');
                }
                else {
                    return this.selectedIndex > -1 ? this.options[this.selectedIndex].value : '';
                }
            }
        }
        else {
            return this.container.value;
        }        
    }

    set value(value) {
        if (this.type != 'original') {
            if (this.multiple) {
                this.selectedIndexes = this.indexesOf(typeof(value) == 'string' ? value.split(',') : value);
            }
            else {
                this.selectedIndex = this.indexOf(value);
            }
        }
        else {
            this.container.value = value;
        }
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
        
        if (text != '') {
            if (this.callout != null) {
                Callout(text).position(this.container, this.callout).show();
            }
            
            if (this.message != null) {
                window.Message?.[this.status != 'success' ? 'red' : 'green'](text).show(this.message.toFloat(0));
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
Select.prototype.onchange_ = null; //原生 onchange 事件
Select.prototype.element = null; //保存配置的元素
Select.prototype.container = null; //容器元素
Select.prototype.$for = null; //as a for loop
Select.prototype._initialized = false;
Select.prototype._source = 'none'; // 触发 selected 的来源 value/text/index/none

Select.prototype.getComingValue = function(index) {
    if (this.multiple) {
        if (index instanceof Array) {
            return index.map(i => this.options[i].value).join(',');
        }
        else {
            let indexes = new Set(this.selectedIndexes);
            if (indexes.has(index)) {
                index.delete(index);
            }
            else {
                indexes.add(index);
            }
            return [...indexes].map(i => this.options[i].value).join(',');
        }
    }
    else {
        return this.options[index].value;
    }
}

Select.prototype.apply = function() {

    if (this.type != 'original') {
        for (let option of this.element.querySelectorAll('option')) {
            this.add(option);
        }
    }
    else {
        //同步属性
        this._selectedIndex = this.container.selectedIndex;
        this.options = [...this.container.options];
    }

    if (!this._initialized) {
        if (this.$value != '' && this.value != this.$value) {
            this.value = this.$value;
        }
    }
}

Select.prototype.enable = function() {
    this.disabled = false;
}

Select.prototype.disable = function() {
    this.disabled = true;
}

Select.prototype.initialize = function() {

    if (this.type != 'original') {
        this.element.hidden = true; 
    }
    
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
                this.owner.element.setAttribute('loaded', '');
                Event.execute(this.owner, 'onload', data);                
            }
        }

        if (this.await == '') {
            this.$for.load();
        }
        else {
            Event.await(this, this.await);
        }
    }

    Event.interact(this, this.element);

    if (this.data == '') {
        this.apply();
        this._initialized = true;
        Event.execute(this, 'onload');
    }

    if (this._disabled || !this._enabled) {
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
                    this.insertAdjacentElement('afterEnd', this.hintSpan);
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

    if (option._selected) {
        if (this.multiple) {
            this._selectedIndexes.push(option.index);
            this._selectedIndex = this._selectedIndexes[0];
        }
        else {
            if (this.selectedIndex > -1) {
                this.options[this.selectedIndex].container.removeClass(this.options[this.selectedIndex].selectedClass).addClass(this.options[this.selectedIndex].className);
                this.options[this.selectedIndex]._selected = false;
            }
            this._selectedIndex = option.index;
        }

        option.container.removeClass(option.className).addClass(option.selectedClass);
        option.hideAndShow();
    }
    
    if ((option._disabled || !option._enabled) && !option.container.disabled) {
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

//Select.prototype.insertBefore = function(index, text, value, className) { };
//Select.prototype.insertAfter = function(index, text, value, className) { };

Select.prototype.clear = function() {
    this.container.innerHTML = '';
    this.element.innerHTML = '';
    this._selectedIndex = -1;
    this.text = '';
    this.value = '';
    this.options.length = 0;
};

Select.prototype.indexOf = function(value) {
    let index = -1;
    if (value != '') {
        for (let option of this.options) {
            if (option.value == value) {
                index = option.index;
                break;
            }
        }
    }
    return index;
};

Select.prototype.indexesOf = function(values) {
    let indexes = [];
    if (values.length > 0) {
        for (let option of this.options) {
            if (values.includes(option.value)) {
                indexes.push(option.index);
            }
        }
    }
    return indexes;
}

Select.prototype.indexTextOf = function(text) { 
    let index = -1;
    for (let option of this.options) {
        if (option.text == text) {
            index = option.index;
        }
    }
    return index;
};

Select.prototype.indexesTextOf = function(texts) {
    let indexes = [];
    if (texts.length > 0) {
        for (let option of this.options) {
            if (texts.includes(option.text)) {
                indexes.push(option.index);
            }
        }
    }
    return indexes;
}

Select.prototype._fireChange = function() {
    if (this['onchange+'] != null) {
        $FIRE(this, 'onchange+',
                function(data) {
                    this.status = 'success';
                    this.hintText = this.successText.$p(this, data);
                }, 
                function(data) {
                    this.status = 'failure';
                    this.hintText = this.failureText.$p(this, data);
                },
                function(error) {
                    this.status = 'exception';
                    this.hintText = this.exceptionText == '' ? error : this.exceptionText.$p(this, error);
                });
    }
}

Select.prototype.set = function(item, value) {
    $attr(this, item, value);
}

Select.prototype.setValue = function(value) {
    this.value = value;
}

Select.prototype.setText = function(text) {
    this.text = text;
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
                _selected: false,
                _disabled: false,
                _enabled: true,
                toShow: '', //切换到当前选项时显示哪些元素
                toHide: '' //切换到当前选项时隐藏哪些元素
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
            this._text = text;
            Select[this.select.type].setText.call(this, text);
        }        
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (value != this._value) {
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
        if (typeof (selected) != 'boolean') {
            selected = $parseBoolean(selected);
        }
                
        if (selected != this._selected || (selected && this._selected && this.select.selectedIndex == -1)) {

            if (this.select.multiple) {
                if (selected) {
                    this.container.removeClass(this.selectedClass).addClass(this.className);
                }
                else {
                    this.container.removeClass(this.className).addClass(this.selectedClass);
                }
                this._selected = selected;

                if (selected) {
                    this.hideAndShow();
                }

                if (this.select._source == 'none') {
                    this.select._selectedIndexes = this.select.options.filter(option => option.selected).map(option => option.index);
                    this.select._selectedIndex = this.select._selectedIndexes[0] ?? -1;
                }
            }
            else {
                if (selected) {
                    if (this.select._selectedIndex > -1) {
                        this.select.options[this.select._selectedIndex].container.removeClass(this.select.options[this.select._selectedIndex].selectedClass).addClass(this.select.options[this.select._selectedIndex].className);
                        this.select.options[this.select._selectedIndex]._selected = false;
                    }        
                    this.container.removeClass(this.className).addClass(this.selectedClass);
                    this._selected = true;

                    this.hideAndShow();
                }
                else {
                    this.container.removeClass(this.selectedClass).addClass(this.className);
                    this._selected = false;
                }

                if (this.select._source == 'none') {
                    this.select._selectedIndex = selected ? this.index : -1;
                }
            }            
        }
        
        Select[this.select.type].selectAop.call(this, selected);
    }

    get disabled() {
        return this._disabled;
    }

    set disabled(disabled) {
        if (typeof(disabled) != 'boolean') {
            disabled = $parseBoolean(disabled, true, this);
        }
        if (disabled != this._disabled) {                
            if (disabled) {
                this.container.classList.add(this.disabledClass);
            }
            else {
                this.container.classList.remove(this.disabledClass);
            }
            this._disabled = disabled;
            Select[this.select.type].disableAop.call(this, disabled);
        }        
    }

    get enabled() {
        return !this._disabled;
    }

    set enabled(enabled) {
        if (typeof(enabled) != 'boolean') {
            enabled = $parseBoolean(enabled, true, this);
        }
        this.disabled = !enabled;
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
    $a(this.toHide).forEach(e => e.hide());
    $a(this.toShow).forEach(e => e.show());
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
    defaultSelectedIndex: 0,
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
    selectedOptionClass: 'blue-button',
    disabledOptionClass: 'disabled-button',
    defaultSelectedIndex: 0,
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

        if (this.selected) {
            css += ' ' + (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            css += ' ' + (this.className == '' ? this.select.optionClass : this.className);
        }

        if (this.disabled) {
            css += ' ' + (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
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
    defaultSelectedIndex: 0,
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
        if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }

        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
    }
}

Select['radio'] = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    defaultSelectedIndex: 0,
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
        if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }

        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
        }
    }
}

Select['checkbox'] = {
    container: 'DIV',
    optionClass: 'item-option',
    selectedOptionClass: 'item-selected-option',
    disabledOptionClass: 'item-disabled-option',
    defaultSelectedIndex: -1,
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
        if (this.selected) {
            this.container.className = (this.selectedClass == '' ? this.select.selectedOptionClass : this.selectedClass);
        }
        else {
            this.container.className = (this.className == '' ? this.select.optionClass : this.className);
        }

        if (this.disabled) {
            this.container.className = (this.disabledClass == '' ? this.select.disabledOptionClass : this.disabledClass);
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
        HTMLElement.boostPropertyValue(select, 'value');        
        new Select(select).initialize();
    });
}

Select.initializeAll = function() {
    Select.initializeAllIn(document);
}

document.on('post', function () {
    Select.initializeAll();
});